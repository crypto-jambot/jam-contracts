// SPDX-License-Identifier: Apache-2.0
pragma solidity = 0.8.18;

import "../Structs.sol";

interface ISoloMargin {
    function operate(Info[] memory accounts, ActionArgs[] memory actions) external;
}