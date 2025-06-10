const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("GroupChat Contract", function () {
  let GroupChat;
  let groupChat;
  let owner;
  let user1;
  let user2;

  beforeEach(async () => {
    // Получаем список аккаунтов
    [owner, user1, user2] = await ethers.getSigners();

    // Деплой контракта
    const GroupChatFactory = await ethers.getContractFactory("GroupChat");
    groupChat = await GroupChatFactory.deploy(owner.address);
  });

  describe("sendMessage", () => {
    it("должен отправлять сообщение и увеличивать счетчик сообщений пользователя", async () => {
      await expect(groupChat.connect(user1).sendMessage("Hello World"))
        .to.emit(groupChat, "MessageSent")
        .withArgs(user1.address, "Hello World");

      const messages = await groupChat.viewMessages();
      expect(messages.length).to.equal(1);
      expect(messages[0].content).to.equal("Hello World");
      expect(messages[0].sender).to.equal(user1.address);
      expect(messages[0].votes).to.equal(0);

      const messageCount = await groupChat.userMessageCount(user1.address);
      expect(messageCount).to.equal(1);
    });
  });

  describe("voteForMessage", () => {
    beforeEach(async () => {
      await groupChat.connect(user1).sendMessage("First message");
    });

    it("должен увеличивать количество голосов у сообщения", async () => {
      await expect(groupChat.connect(user2).voteForMessage(0))
        .to.emit(groupChat, "MessageVoted")
        .withArgs(user2.address, 0);

      const messages = await groupChat.viewMessages();
      expect(messages[0].votes).to.equal(1);
    });

    it("должен выбрасывать ошибку при голосовании за несуществующее сообщение", async () => {
      await expect(groupChat.connect(user2).voteForMessage(999)).to.be.revertedWith("Message does not exist");
    });
  });

  describe("viewMessages", () => {
    it("должен возвращать все сообщения", async () => {
      await groupChat.connect(user1).sendMessage("Message 1");
      await groupChat.connect(user2).sendMessage("Message 2");

      const messages = await groupChat.viewMessages();
      expect(messages.length).to.equal(2);
      expect(messages[0].content).to.equal("Message 1");
      expect(messages[1].content).to.equal("Message 2");
    });
  });

  describe("owner", () => {
    it("должен быть установлен правильно при деплое", async () => {
      expect(await groupChat.owner()).to.equal(owner.address);
    });
  });
});
