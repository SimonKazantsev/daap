// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

contract GroupChat {
    address public immutable owner;

    struct Message {
        uint256 id;          // Уникальный идентификатор сообщения
        string content;
        address sender; 
        uint256 votes;
    }

    uint256 public nextMessageId = 0; // счетчик для уникальных ID сообщений

    // Отображение messageId => Message
    mapping(uint256 => Message) public messageMap;

    // Отслеживание голосов: messageId => voter => bool
    mapping(uint256 => mapping(address => bool)) public messageVoters;

    event MessageSent(address indexed sender, string content, uint256 messageId);
    event MessageVoted(address indexed voter, uint256 messageId);

    constructor(address _owner) {
        owner = _owner;
    }

    modifier isOwner() {
        require(msg.sender == owner, "Not the Owner");
        _;
    }

    uint256[] public allMessageIds; //id Сообщений

    // Отправка сообщения
    function sendMessage(string memory _content) public {
        uint256 currentId = nextMessageId;
        messageMap[currentId] = Message({
            id: currentId,
            content: _content,
            sender: msg.sender,
            votes: 0
        });
        allMessageIds.push(currentId);
        emit MessageSent(msg.sender, _content, currentId);
        nextMessageId++;
    }

    // Голосование за сообщение по его уникальному id
    function voteForMessage(uint256 _messageId) public {
        require(_messageId < nextMessageId, "Message does not exist");
        require(bytes(messageMap[_messageId].content).length != 0, "Message not found");
        require(!messageVoters[_messageId][msg.sender], "Already voted for this message");

        messageVoters[_messageId][msg.sender] = true;

        messageMap[_messageId].votes += 1;

        emit MessageVoted(msg.sender, _messageId);
    }

    // Получение сообщения по id
    function getMessageById(uint256 _messageId) public view returns (
        string memory content,
        address sender,
        uint256 votes
    ) {
        require(bytes(messageMap[_messageId].content).length != 0, "Message not found");
        Message storage msgStruct = messageMap[_messageId];
        return (msgStruct.content, msgStruct.sender, msgStruct.votes);
    }

    // Получение всех сообщений (через массив id)
    function getAllMessages() public view returns (Message[] memory) {
        Message[] memory messages = new Message[](allMessageIds.length);
        for (uint i = 0; i < allMessageIds.length; i++) {
            messages[i] = messageMap[allMessageIds[i]];
        }
        return messages;
    }
}