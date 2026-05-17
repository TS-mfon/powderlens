// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract PowderLensAdminController {
    address public owner;
    bool public paused;

    event PauseStateChanged(bool paused);

    modifier onlyOwner() {
        require(msg.sender == owner, "not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function setPaused(bool nextState) external onlyOwner {
        paused = nextState;
        emit PauseStateChanged(nextState);
    }
}
