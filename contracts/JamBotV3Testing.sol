//// SPDX-License-Identifier: UNLICENSED
//pragma solidity = 0.8.18;
//
//import "./interfaces/IUniswapV2Callee.sol";
//import "./interfaces/IUniswapV3SwapCallback.sol";
//import "@pancakeswap/v3-core/contracts/interfaces/callback/IPancakeV3SwapCallback.sol";
//import "@pancakeswap/v3-core/contracts/interfaces/IPancakeV3Pool.sol";
//import "./interfaces/IUniswapV2Pair.sol";
//import "./interfaces/IUniswapV3Pool.sol";
//import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
//import "hardhat/console.sol";
//import "solidity-bytes-utils/contracts/BytesLib.sol";
//
//contract JamBotV3 is IUniswapV2Callee, IUniswapV3SwapCallback, IPancakeV3SwapCallback {
//    using BytesLib for bytes;
//    address public immutable deployer;
//    address public owner1;
//    address public owner2;
//    uint public deployerCut;
//    bool public deployerCutFinalized;
//    bool private locked;
//
//    constructor(address _owner1, address _owner2, uint _deployerCut) {
//        require(_deployerCut >= 0 && _deployerCut <= 100, "DEPLOYER CUT MUST BE BETWEEN 0 AND 100");
//        deployer = msg.sender;
//        owner1 = _owner1;
//        owner2 = _owner2;
//        deployerCut = _deployerCut;
//        deployerCutFinalized = false;
//        locked = true;
//    }
//
//    modifier onlyDeployer() {
//        require(msg.sender == deployer, "ONLY DEPLOYER CAN CALL");
//        _;
//    }
//
//    modifier onlyOwner1() {
//        require(msg.sender == owner1, "ONLY OWNER1 CAN CALL");
//        _;
//    }
//
//    modifier onlyOwner2() {
//        require(msg.sender == owner2, "ONLY OWNER2 CAN CALL");
//        _;
//    }
//
//    receive() external payable {}
//    fallback() external payable {}
//
//    function setOwner1(address newOwner1) external onlyOwner1 {
//        owner1 = newOwner1;
//    }
//
//    function setOwner2(address newOwner2) external onlyOwner2 {
//        owner2 = newOwner2;
//    }
//
//    function setDeployerCut(uint newDeployerCut) external onlyDeployer {
//        require(!deployerCutFinalized, "DEPLOYER CUT IS FINALIZED");
//        require(newDeployerCut >= 0 && newDeployerCut <= 100, "DEPLOYER CUT MUST BE BETWEEN 0 AND 100");
//        deployerCut = newDeployerCut;
//    }
//
//    function finalizeDeployerCut() external onlyDeployer {
//        deployerCutFinalized = true;
//    }
//
//    function withdraw() external onlyDeployer {
//        uint256 amount = address(this).balance;
//        require(amount > 1, "Nothing to withdraw; contract balance empty");
//        uint deployersShare = mul(amount, deployerCut)/100;
//        uint ownersShare = sub(amount, deployersShare);
//        uint share = ownersShare / 2;
//        if (deployerCut == 0) {
//            (bool sentOwner1, ) = owner1.call{value: share}("");
//            (bool sentOwner2, ) = owner2.call{value: share}("");
//            require(sentOwner1 && sentOwner2, "Failed to send Ether");
//        } else if (deployerCut == 100) {
//            (bool sentDeployer, ) = deployer.call{value: deployersShare}("");
//            require(sentDeployer, "Failed to send Ether");
//        } else {
//            (bool sentDeployer, ) = deployer.call{value: deployersShare}("");
//            (bool sentOwner1, ) = owner1.call{value: share}("");
//            (bool sentOwner2, ) = owner2.call{value: share}("");
//            require(sentDeployer && sentOwner1 && sentOwner2, "Failed to send Ether");
//        }
//    }
//
//    function withdrawTokens(address token) external onlyDeployer {
//        uint256 amount = IERC20(token).balanceOf(address(this));
//        require(amount > 1, "Nothing to withdraw; contract balance of token empty");
//        uint deployersShare = mul(amount, deployerCut)/100;
//        uint ownersShare = sub(amount, deployersShare);
//        uint share = ownersShare / 2;
//        if (deployerCut == 0) {
//            safeTransfer(token, owner1, share);
//            safeTransfer(token, owner2, share);
//        } else if (deployerCut == 100) {
//            safeTransfer(token, deployer, deployersShare);
//        } else {
//            safeTransfer(token, deployer, deployersShare);
//            safeTransfer(token, owner1, share);
//            safeTransfer(token, owner2, share);
//        }
//    }
//
//    function uniswapV2Call(address, uint amount0Out, uint amount1Out, bytes calldata data) external {
//        console.log("%s | Entering a v2 callback", msg.sender);
//        require(!locked, "FUNCTION IS LOCKED");
//
//        console.log("%s | V2 caller calculated amount0Out: %s amount1Out: %s", msg.sender, amount0Out, amount1Out);
//
//        callback(data);
//
//        console.log("%s | Leaving a v2 callback", msg.sender);
//    }
//
//    function uniswapV3SwapCallback(int256 amount0Delta, int256 amount1Delta, bytes calldata data) external {
//        console.log("%s | Entering a v3 callback", msg.sender);
//        require(!locked, "FUNCTION IS LOCKED");
//
//        console.log("%s | V3 caller calculated below amount0Delta and then amount1Delta", msg.sender);
//        console.logInt(amount0Delta);
//        console.logInt(amount1Delta);
//
//        callback(data);
//
//        console.log("%s | Leaving a v3 callback", msg.sender);
//    }
//
//    function pancakeV3SwapCallback(int256 amount0Delta, int256 amount1Delta, bytes calldata data) external {
//        console.log("%s | Entering a pancake v3 callback", msg.sender);
//        require(!locked, "FUNCTION IS LOCKED");
//
//        console.log("%s | V3 caller calculated below amount0Delta and then amount1Delta", msg.sender);
//        console.logInt(amount0Delta);
//        console.logInt(amount1Delta);
//
//        callback(data);
//
//        console.log("%s | Leaving a pancake v3 callback", msg.sender);
//    }
//
//    function executeTrade(address startToken, address target, bytes calldata payload) external onlyDeployer {
//        uint256 balanceBefore = IERC20(startToken).balanceOf(address(this));
//        console.log("JamBot balance before of starting token: %s", balanceBefore);
//        locked = false;
//        if (isV3Pool(target)) {
//            (address recipient, bool zeroForOne, int256 amountSpecified, uint160 sqrtPriceLimitX96, bytes memory swapData) = decodeV3SwapData(payload[4:]);
//            console.log("----------------------");
//            console.log("%s | V3 first target amount", target);
//            console.log("amountSpecified: %s", uint256(amountSpecified));
//            console.log("recipient: %s", recipient);
//            console.log("--Calling Swap--------------------");
//            IUniswapV3Pool(target).swap(recipient, zeroForOne, amountSpecified, sqrtPriceLimitX96, swapData);
//            console.log("--Finished Swap-------------------");
//            console.log("----------------------");
//        } else {
//            (uint amount0Out, uint amount1Out, address to, bytes memory swapData) = decodeV2SwapData(payload[4:]);
//            console.log("----------------------");
//            console.log("%s | V2 first target amounts", target);
//            console.log("Amount0Out: %s", amount0Out);
//            console.log("Amount1Out: %s", amount1Out);
//            console.log("To: %s", to);
//            console.log("--Calling Swap--------------------");
//            IUniswapV2Pair(target).swap(amount0Out, amount1Out, to, swapData);
//            console.log("--Finished Swap-------------------");
//        }
//        locked = true;
//        console.log("JamBot balance after of starting token: %s", IERC20(startToken).balanceOf(address(this)));
//        require(IERC20(startToken).balanceOf(address(this)) > balanceBefore, "ARBITRAGE UNSUCCESSFUL: REASON UNKNOWN");
//    }
//
//    function callback(bytes calldata data) internal {
//        (address[] memory targets, bytes[] memory payloads) = abi.decode(data, (address[], bytes[]));
//
//        for (uint8 i = 0; i < targets.length; i++) {
//            if (isV3Pool(targets[i])) {
//                (address recipient, bool zeroForOne, int256 amountSpecified, uint160 sqrtPriceLimitX96, bytes memory swapData) = decodeV3SwapDataMemory(payloads[i].slice(4, payloads[i].length - 4));
//
//                console.log("----------------------");
//                console.log("%s | V3 target", targets[i]);
//                console.log("%s - Recipient: %s", targets[i], recipient);
//                console.log("%s - zeroForOne: %s", targets[i], zeroForOne);
//                console.log("%s - amountSpecified: %s", targets[i], uint256(amountSpecified));
//                console.log("%s - sqrtPriceLimitX96: %s", targets[i], sqrtPriceLimitX96);
//                console.log("--Calling Swap--------------------");
//                IUniswapV3Pool(targets[i]).swap(recipient, zeroForOne, amountSpecified, sqrtPriceLimitX96, swapData);
//                console.log("--Finished Swap-------------------");
//            } else if (isV2Pair(targets[i])){
//                (uint amount0Out, uint amount1Out, address to, bytes memory swapData) = decodeV2SwapDataMemory(payloads[i].slice(4, payloads[i].length - 4));
//
//                console.log("----------------------");
//                console.log("%s | V2 target", targets[i]);
//                console.log("%s - Amount0Out: %s", targets[i], amount0Out);
//                console.log("%s - Amount1Out: %s", targets[i], amount1Out);
//                console.log("%s - To: %s", targets[i], to);
//                console.log("--Calling Swap--------------------");
//                IUniswapV2Pair(targets[i]).swap(amount0Out, amount1Out, to, swapData);
//                console.log("--Finished Swap-------------------");
//            } else {
//                (address to, uint256 value) = decodeERC20Payload(payloads[i].slice(4, payloads[i].length - 4));
//
//                console.log("----------------------");
//                console.log("%s | Token Address Target", targets[i]);
//                console.log("%s | To: %s", targets[i], to);
//                console.log("%s | Value: %s", targets[i], value);
//                IERC20 erc20 = IERC20(targets[i]);
//                console.log("%s | ERC20 Token | token balance of Jambot start: %s", targets[i], erc20.balanceOf(address(this)));
//                erc20.transfer(to, value);
//                console.log("%s | ERC20 Token | token balance of Jambot end: %s", targets[i], erc20.balanceOf(address(this)));
//                console.log("----------------------");
//            }
//        }
//    }
//
//    function safeTransfer(address token, address to, uint256 value) internal {
//        (bool success, bytes memory data) = token.call(abi.encodeWithSelector(0xa9059cbb, to, value));
//        require(success && (data.length == 0 || abi.decode(data, (bool))), 'TRANSFER FAILURE');
//    }
//
//    function mul(uint x, uint y) internal pure returns (uint z) {
//        if (y == 0) {
//            return 0;
//        }
//        z = x * y;
//        require(z / y == x, 'ds-math-mul-overflow');
//    }
//
//    function sub(uint x, uint y) internal pure returns (uint z) {
//        z = x - y;
//        require(z <= x, 'ds-math-sub-underflow');
//    }
//
//    function isV2Pair(address pairAddress) internal view returns (bool) {
//        (bool success, bytes memory data) = pairAddress.staticcall(abi.encodeWithSignature("getReserves()"));
//
//        if (success && data.length > 0) {
//            // The contract implements the Uniswap V2 Pool interface
//            return true;
//        }
//
//        // The contract does not implement either interface
//        return false;
//    }
//
//    function isV3Pool(address poolAddress) internal view returns (bool) {
//        (bool success, bytes memory data) = poolAddress.staticcall(abi.encodeWithSignature("slot0()"));
//
//        if (success && data.length > 0) {
//            // The contract implements the Uniswap V3 Pool interface
//            return true;
//        }
//
//        // The contract does not implement either interface
//        return false;
//    }
//
//
//
//
//    function decodeERC20Payload(bytes memory payload) public pure returns (address to, uint256 value) {
//        (to, value) = abi.decode(payload, (address, uint256));
//    }
//
//    function decodeV3SwapData(bytes calldata payload) public pure returns (
//        address recipient,
//        bool zeroForOne,
//        int256 amountSpecified,
//        uint160 sqrtPriceLimitX96,
//        bytes memory swapData
//    ) {
//        (
//        recipient,
//        zeroForOne,
//        amountSpecified,
//        sqrtPriceLimitX96,
//        swapData
//        ) = abi.decode(payload, (
//            address,
//            bool,
//            int256,
//            uint160,
//            bytes
//            ));
//    }
//
//    function decodeV2SwapData(bytes calldata payload) public pure returns (
//        uint amount0Out,
//        uint amount1Out,
//        address to,
//        bytes memory swapData
//    ) {
//        (
//        amount0Out,
//        amount1Out,
//        to,
//        swapData
//        ) = abi.decode(payload, (uint, uint, address, bytes));
//    }
//
//    function decodeV3SwapDataMemory(bytes memory payload) public pure returns (
//        address recipient,
//        bool zeroForOne,
//        int256 amountSpecified,
//        uint160 sqrtPriceLimitX96,
//        bytes memory swapData
//    ) {
//        (
//        recipient,
//        zeroForOne,
//        amountSpecified,
//        sqrtPriceLimitX96,
//        swapData
//        ) = abi.decode(payload, (
//            address,
//            bool,
//            int256,
//            uint160,
//            bytes
//            ));
//    }
//
//    function decodeV2SwapDataMemory(bytes memory payload) public pure returns (
//        uint amount0Out,
//        uint amount1Out,
//        address to,
//        bytes memory swapData
//    ) {
//        (
//        amount0Out,
//        amount1Out,
//        to,
//        swapData
//        ) = abi.decode(payload, (uint, uint, address, bytes));
//    }
//}