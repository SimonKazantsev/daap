// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "hardhat/console.sol";

contract GroupChat {
    address public immutable owner;
    struct Message {
        string content;
        address sender;
        uint256 votes;
    }

    Message[] public messages;
    mapping(address => uint) public userMessageCount;

    event MessageSent(address indexed sender, string content);
    event MessageVoted(address indexed voter, uint256 messageId);

    constructor(address _owner) {
        owner = _owner;
    }

    modifier isOwner() {
        require(msg.sender == owner, "Not the Owner");
        _;
    }

    function sendMessage(string memory _content) public {
        messages.push(Message(_content, msg.sender, 0));
        userMessageCount[msg.sender] += 1;
        emit MessageSent(msg.sender, _content);
    }

    function voteForMessage(uint256 _messageId) public {
        require(_messageId < messages.length, "Message does not exist");
        messages[_messageId].votes += 1;
        emit MessageVoted(msg.sender, _messageId);
    }

    function viewMessages() public view returns (Message[] memory) {
        return messages;
    }

    receive() external payable {}
}
