// SPDX-License-Identifier: UNLICENSED
pragma solidity = 0.8.18;

import "../Structs.sol";

interface ISoloMargin {
    function operate(Info[] memory accounts, ActionArgs[] memory actions) external;
}