// SPDX-License-Identifier: UNLICENSED
pragma solidity = 0.8.18;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract JamBotV3 {
    address public immutable deployer;
    address public owner1;
    address public owner2;
    uint public deployerCut;
    bool public deployerCutFinalized;
    bool private locked;

    constructor(address _owner1, address _owner2, uint _deployerCut) {
        require(_deployerCut >= 0 && _deployerCut <= 100, "DEPLOYER CUT MUST BE BETWEEN 0 AND 100");
        deployer = msg.sender;
        owner1 = _owner1;
        owner2 = _owner2;
        deployerCut = _deployerCut;
        deployerCutFinalized = false;
        locked = true;
    }

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
    modifier lockable() {
        require(!locked, "FUNCTION IS LOCKED");
        _;
    }

    receive() external payable {}
    fallback() external payable {}

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

    function withdraw() external onlyDeployer {
        uint256 amount = address(this).balance;
        require(amount > 1, "Nothing to withdraw; contract balance empty");
        uint deployersShare = mul(amount, deployerCut)/100;
        uint ownersShare = sub(amount, deployersShare);
        uint share = ownersShare / 2;
        if (deployerCut == 0) {
            (bool sentOwner1, ) = owner1.call{value: share}("");
            (bool sentOwner2, ) = owner2.call{value: share}("");
            require(sentOwner1 && sentOwner2, "Failed to send Ether");
        } else if (deployerCut == 100) {
            (bool sentDeployer, ) = deployer.call{value: deployersShare}("");
            require(sentDeployer, "Failed to send Ether");
        } else {
            (bool sentDeployer, ) = deployer.call{value: deployersShare}("");
            (bool sentOwner1, ) = owner1.call{value: share}("");
            (bool sentOwner2, ) = owner2.call{value: share}("");
            require(sentDeployer && sentOwner1 && sentOwner2, "Failed to send Ether");
        }
    }
    function withdrawTokens(address token) external onlyDeployer {
        uint256 amount = IERC20(token).balanceOf(address(this));
        require(amount > 1, "Nothing to withdraw; contract balance of token empty");
        uint deployersShare = mul(amount, deployerCut)/100;
        uint ownersShare = sub(amount, deployersShare);
        uint share = ownersShare / 2;
        if (deployerCut == 0) {
            safeTransfer(token, owner1, share);
            safeTransfer(token, owner2, share);
        } else if (deployerCut == 100) {
            safeTransfer(token, deployer, deployersShare);
        } else {
            safeTransfer(token, deployer, deployersShare);
            safeTransfer(token, owner1, share);
            safeTransfer(token, owner2, share);
        }
    }

    function executeTrade(address startToken, address target, bytes calldata payload) external onlyDeployer {
        uint256 balanceBefore = IERC20(startToken).balanceOf(address(this));
        locked = false;
        (bool success, ) = target.call(payload);
        locked = true;
        require(success, "ARBITRAGE UNSUCCESSFUL: REASON UNKNOWN");
        uint256 balanceAfter = IERC20(startToken).balanceOf(address(this));
        require(balanceAfter > balanceBefore, "ARBITRAGE UNSUCCESSFUL: REASON UNKNOWN");
    }

    // uniswapV3
    // sushiswapV3
    function uniswapV3SwapCallback(int256, int256, bytes calldata data) external lockable {
        callback(data);
    }
    function pancakeV3SwapCallback(int256, int256, bytes calldata data) external lockable {
        callback(data);
    }

    // uniswapV2
    // sushiswap
    // shibaswap
    // luaswap
    // fraxswap
    // bamboodefi
    // bxh
    // capitaldex
    // radioshack
    function uniswapV2Call(address, uint, uint, bytes calldata data) external lockable {
        callback(data);
    }
    // convergence
    function swapCall(address, uint, uint, bytes calldata data) external lockable {
        callback(data);
    }
    // swapr
    function DXswapCall(address, uint, uint, bytes calldata data) external lockable {
        callback(data);
    }
    // verse
    function swapsCall(address, uint256, uint256, bytes calldata data) external lockable {
        callback(data);
    }
    function unicSwapV2Call(address, uint, uint, bytes calldata data) external lockable {
        callback(data);
    }
    function linkswapCall(address, uint256, uint256, bytes calldata data) external lockable {
        callback(data);
    }
    function empireCall(address, uint256, uint256, bytes calldata data) external lockable {
        callback(data);
    }
    function croDefiSwapCall(address, uint, uint, bytes calldata data) external lockable {
        callback(data);
    }
    function elkCall(address, uint, uint, bytes calldata data) external lockable {
        callback(data);
    }
    function YouSwapV2Call(address, uint, uint, bytes calldata data) external lockable {
        callback(data);
    }
    function pancakeCall(address, uint, uint, bytes calldata data) external lockable {
        callback(data);
    }
    function orionpoolV2Call(address, uint, uint, bytes calldata data) external lockable {
        callback(data);
    }
    function apeCall(address, uint, uint, bytes calldata data) external lockable {
        callback(data);
    }
    function SaitaSwapCall(address, uint, uint, bytes calldata data) external lockable {
        callback(data);
    }

    function callback(bytes calldata data) internal {
        (address[] memory targets, bytes[] memory payloads) = abi.decode(data, (address[], bytes[]));
        for (uint8 i = 0; i < targets.length; i++) {
            (bool success, ) = targets[i].call(payloads[i]);
            require(success, "TRANSFER OR SWAP FAILURE");
        }
    }

    function safeTransfer(address token, address to, uint256 value) internal {
        (bool success, bytes memory data) = token.call(abi.encodeWithSelector(0xa9059cbb, to, value));
        require(success && (data.length == 0 || abi.decode(data, (bool))), 'TRANSFER FAILURE');
    }

    function mul(uint x, uint y) internal pure returns (uint z) {
        if (y == 0) {
            return 0;
        }
        z = x * y;
        require(z / y == x, 'ds-math-mul-overflow');
    }
    function sub(uint x, uint y) internal pure returns (uint z) {
        z = x - y;
        require(z <= x, 'ds-math-sub-underflow');
    }
}