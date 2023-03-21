// SPDX-License-Identifier: UNLICENSED
pragma solidity = 0.8.18;

import "./interfaces/IUniswapV2Pair.sol";
import "./Structs.sol";
import "./DydxFlashLoan.sol";

contract Arbitrage is DyDxFlashLoan {
    address public deployer;
    address public owner1;
    address public owner2;
    uint public deployerCut;
    bool public deployerCutFinalized;

    constructor(address _owner1, address _owner2, uint _deployerCut) {
        require(_deployerCut >= 0 && _deployerCut <= 100, "DEPLOYER CUT MUST BE BETWEEN 0 AND 100");
        deployer = msg.sender;
        owner1 = _owner1;
        owner2 = _owner2;
        deployerCut = _deployerCut;
        deployerCutFinalized = false;
    }

    event Arb(address[] tokenPath, address[] poolPath, uint[] amounts);

    modifier onlyDeployer() {
        require(msg.sender == deployer, "ONLY DEPLOYER CAN CALL");
        _;
    }

    modifier onlyOwner1() {
        require(msg.sender == owner1, "ONLY OWNER1 CAN CALL");
        _;
    }

    modifier onlyOwner2() {
        require(msg.sender == owner2, "ONLY OWNER2 CAN CALL");
        _;
    }

    receive() external payable {}

    function setOwner1(address newOwner1) external onlyOwner1 {
        owner1 = newOwner1;
    }

    function setOwner2(address newOwner2) external onlyOwner2 {
        owner2 = newOwner2;
    }

    function setDeployerCut(uint newDeployerCut) external onlyDeployer {
        require(!deployerCutFinalized, "DEPLOYER CUT IS FINALIZED");
        require(newDeployerCut >= 0 && newDeployerCut <= 100, "DEPLOYER CUT MUST BE BETWEEN 0 AND 100");
        deployerCut = newDeployerCut;
    }

    function finalizeDeployerCut() external onlyDeployer {
        deployerCutFinalized = true;
    }

    function withdraw() public onlyDeployer {
        uint256 amount = address(this).balance;
        require(amount > 1, "Nothing to withdraw; contract balance empty");
        uint deployersShare = mul(amount, deployerCut)/100;
        uint ownersShare = sub(amount, deployersShare);
        uint share = ownersShare / 2;
        (bool sentDeployer, ) = deployer.call{value: deployersShare}("");
        (bool sentOwner1, ) = owner1.call{value: share}("");
        (bool sentOwner2, ) = owner2.call{value: share}("");
        require(sentDeployer && sentOwner1 && sentOwner2, "Failed to send Ether");
    }

    function withdrawTokens(address token) public onlyDeployer {
        uint256 amount = IERC20(token).balanceOf(address(this));
        require(amount > 1, "Nothing to withdraw; contract balance of token empty");
        uint deployersShare = mul(amount, deployerCut)/100;
        uint ownersShare = sub(amount, deployersShare);
        uint share = ownersShare / 2;
        safeTransfer(token, deployer, deployersShare);
        safeTransfer(token, owner1, share);
        safeTransfer(token, owner2, share);
    }

    function executeTrade(
        address[] calldata tokenPath,
        address[] calldata poolPath,
        uint256 tradeAmount
    ) external {
        uint256 balanceBefore = IERC20(tokenPath[0]).balanceOf(address(this));

        bytes memory data = abi.encode(
            tokenPath,
            poolPath,
            tradeAmount,
            balanceBefore
        );

        flashloan(tokenPath[0], tradeAmount, data); // execution goes to `callFunction`

    }

    function callFunction(
        address, /* sender */
        Info calldata, /* accountInfo */
        bytes calldata data
    ) external onlyPool {
        (
            address[] memory tokenPath,
            address[] memory poolPath,
            uint256 tradeAmount,
            uint256 balanceBefore
        ) = abi.decode(data, (address[], address[], uint256, uint256));

        uint256 balanceAfter = IERC20(tokenPath[0]).balanceOf(address(this));
        require(balanceAfter - balanceBefore == tradeAmount, "FLASH LOAN FAILURE");

        uint[] memory amounts = getAmountsOut(tradeAmount, poolPath, tokenPath);
        require(amounts[amounts.length - 1] >= tradeAmount + 2, "INSUFFICIENT OUTPUT AMOUNT");

        safeTransfer(tokenPath[0], poolPath[0], tradeAmount);
        swap(amounts, tokenPath, poolPath);

        emit Arb(tokenPath, poolPath, amounts);
    }

    function getAmountsOut(uint amountIn, address[] memory poolPath, address[] memory tokenPath) internal view returns (uint[] memory amounts) {
        amounts = new uint[](poolPath.length + 1);
        amounts[0] = amountIn;
        for (uint i; i < poolPath.length; i++) {
            (uint reserveIn, uint reserveOut) = i == poolPath.length - 1 ? getReserves(poolPath[i], tokenPath[i], tokenPath[0]) : getReserves(poolPath[i], tokenPath[i], tokenPath[i + 1]);
            amounts[i + 1] = getAmountOut(amounts[i], reserveIn, reserveOut);
        }
    }

    function getReserves(address v2Pool, address tokenA, address tokenB) internal view returns (uint reserveA, uint reserveB) {
        (address token0,) = sortTokens(tokenA, tokenB);
        (uint reserve0, uint reserve1,) = IUniswapV2Pair(v2Pool).getReserves();
        (reserveA, reserveB) = tokenA == token0 ? (reserve0, reserve1) : (reserve1, reserve0);
    }

    function sortTokens(address tokenA, address tokenB) internal pure returns (address token0, address token1) {
        (token0, token1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
    }

    function getAmountOut(uint amountIn, uint reserveIn, uint reserveOut) internal pure returns (uint amountOut) {
        uint amountInWithFee = mul(amountIn, 997);
        uint numerator = mul(amountInWithFee, reserveOut);
        uint reserveInTimes1000 = mul(reserveIn, 1000);
        uint denominator = add(reserveInTimes1000, amountInWithFee);
        amountOut = numerator / denominator;
    }

    function safeTransfer(
        address token,
        address to,
        uint256 value
    ) internal {
        // bytes4(keccak256(bytes('transfer(address,uint256)')));
        (bool success, bytes memory data) = token.call(abi.encodeWithSelector(0xa9059cbb, to, value));
        require(
            success && (data.length == 0 || abi.decode(data, (bool))),
            'TRANSFER FAILURE'
        );
    }

    // **** SWAP ****
    // requires the initial amount to have already been sent to the first pair
    function swap(uint[] memory amounts, address[] memory tokenPath, address[] memory swapPath) internal {
        for (uint i; i < tokenPath.length; i++) {
            (address input, address output) = (tokenPath[i], tokenPath[i == tokenPath.length - 1 ? 0 : i + 1]);
            (address token0,) = sortTokens(input, output);
            uint amountOut = amounts[i + 1];
            (uint amount0Out, uint amount1Out) = input == token0 ? (uint(0), amountOut) : (amountOut, uint(0));
            address to = i < tokenPath.length - 1 ? swapPath[i + 1] : address(this);
            IUniswapV2Pair(swapPath[i]).swap(
                amount0Out, amount1Out, to, new bytes(0)
            );
        }
    }

    function mul(uint x, uint y) internal pure returns (uint z) {
        if (y == 0) {
            return 0;
        }
        z = x * y;
        require(z / y == x, 'ds-math-mul-overflow');
    }

    function add(uint x, uint y) internal pure returns (uint z) {
        z = x + y;
        require(z >= x, 'ds-math-add-overflow');
    }

    function sub(uint x, uint y) internal pure returns (uint z) {
        z = x - y;
        require(z <= x, 'ds-math-sub-underflow');
    }
}