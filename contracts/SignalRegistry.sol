// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract SignalRegistry {
    struct SignalRecord {
        bytes32 evidenceHash;
        uint8 confidence;
        string headline;
        address operator;
        uint64 createdAt;
    }

    mapping(bytes32 => SignalRecord) public records;

    event SignalRecorded(bytes32 indexed signalId, bytes32 evidenceHash, uint8 confidence, address indexed operator);

    function recordSignal(bytes32 signalId, bytes32 evidenceHash, uint8 confidence, string calldata headline) external {
        records[signalId] = SignalRecord({
            evidenceHash: evidenceHash,
            confidence: confidence,
            headline: headline,
            operator: msg.sender,
            createdAt: uint64(block.timestamp)
        });

        emit SignalRecorded(signalId, evidenceHash, confidence, msg.sender);
    }
}
