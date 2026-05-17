// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract ThesisRegistry {
    struct ThesisRecord {
        bytes32 signalId;
        address author;
        string thesis;
        uint64 createdAt;
    }

    ThesisRecord[] public theses;

    event ThesisCreated(uint256 indexed thesisIndex, bytes32 indexed signalId, address indexed author);

    function createThesis(bytes32 signalId, string calldata thesis) external {
        theses.push(
            ThesisRecord({
                signalId: signalId,
                author: msg.sender,
                thesis: thesis,
                createdAt: uint64(block.timestamp)
            })
        );

        emit ThesisCreated(theses.length - 1, signalId, msg.sender);
    }
}
