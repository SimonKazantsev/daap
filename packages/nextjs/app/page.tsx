"use client";

import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useAccount } from "wagmi";
import { Address } from "~~/components/scaffold-eth";

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

const CONTRACT_ABI = [
  "function sendMessage(string _content) public",
  "function getAllMessages() public view returns (tuple(uint256 id, string content, address sender, uint votes)[])",
  "function voteForMessage(uint256 _messageId) public",
];

const Home: React.FC = () => {
  const { address: connectedAddress } = useAccount();

  const [showSendForm, setShowSendForm] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [messages, setMessages] = useState<{ id: number; content: string; sender: string; votes: number }[]>([]);

  // Получение всех сообщений
  const fetchMessages = async () => {
    if (!window.ethereum) return;
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      const msgs: any[] = await contract.getAllMessages();

      // обработка сообщения
      setMessages(
        msgs.map((msg: any) => ({
          id: Number(msg.id),
          content: msg.content,
          sender: msg.sender,
          votes: Number(msg.votes),
        })),
      );
    } catch (error) {
      console.error("Ошибка при получении сообщений:", error);
    }
  };

  // Голосование за сообщение
  const voteForMessage = async (messageId: number) => {
    if (!window.ethereum || !connectedAddress) return;
    try {
      setLoading(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      const tx = await contract.voteForMessage(messageId);
      setTxHash(tx.hash);
      await tx.wait();

      fetchMessages(); // Здесь я обновляю список после голосования
    } catch (error) {
      console.error("Ошибка при голосовании:", error);
    } finally {
      setLoading(false);
    }
  };

  // Форма отправки (открыть/закрыть)
  const toggleSendForm = () => {
    setShowSendForm(prev => {
      if (prev) {
        setMessageText("");
      }
      return !prev;
    });
  };

  // Отправка сообщения
  const handleSendMessage = async () => {
    if (!window.ethereum || !connectedAddress || messageText.trim() === "") return;
    try {
      setLoading(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      const tx = await contract.sendMessage(messageText.trim());
      setTxHash(tx.hash);
      await tx.wait();

      // добавляю в локальный список
      setMessages(prev => [
        ...prev,
        {
          id: Date.now(), // id для списка
          content: messageText.trim(),
          sender: connectedAddress,
          votes: 0,
        },
      ]);

      setMessageText("");
      setShowSendForm(false);
    } catch (error) {
      console.error("Ошибка при отправке сообщения:", error);
    } finally {
      setLoading(false);
      fetchMessages();
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  return (
    <div className="flex items-center flex-col grow pt-10">
      <h1 className="text-center mb-4">
        <span className="block text-2xl mb-2">Добро пожаловать</span>
        <span className="block text-4xl font-bold">Групповой чат DApp</span>
      </h1>
      <div className="flex justify-center items-center space-x-2 mb-4">
        <p className="font-medium">Ваш адрес:</p>
        <Address address={connectedAddress} />
      </div>
      <p className="text-center text-lg mb-4">Участвуйте в групповых обсуждениях.</p>

      <button onClick={fetchMessages} className="btn btn-secondary mb-4">
        Обновить сообщения
      </button>

      {!showSendForm && (
        <button onClick={toggleSendForm} className="btn btn-primary mb-4">
          Написать сообщение
        </button>
      )}

      {showSendForm && (
        <div className="w-full max-w-md px-4 mb-8">
          <h2 className="text-xl mb-4">Напишите сообщение</h2>
          <textarea
            value={messageText}
            onChange={e => setMessageText(e.target.value)}
            placeholder="Введите ваше сообщение..."
            className="w-full textarea textarea-bordered h-24 mb-4"
          ></textarea>
          <div className="flex space-x-4 mb-4">
            <button onClick={handleSendMessage} disabled={loading} className="btn btn-success">
              {loading ? "Отправка..." : "Отправить"}
            </button>
            <button
              onClick={() => {
                setShowSendForm(false);
                setMessageText("");
              }}
              disabled={loading}
              className="btn btn-secondary"
            >
              Отмена
            </button>
          </div>
          {txHash && (
            <p className="mt-2 text-sm text-gray-600">
              Транзакция:{" "}
              <a
                href={`https://etherscan.io/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                {txHash}
              </a>
            </p>
          )}
        </div>
      )}

      <div className="w-full max-w-xl">
        <h2 className="text-xl mb-4">Сообщения</h2>
        {messages.length === 0 ? (
          <p>Пока сообщений нет.</p>
        ) : (
          <ul className="space-y-4">
            {messages.map(msg => (
              <li key={msg.id} className="border p-3 rounded shadow-sm">
                <div>
                  <strong>Сообщение:</strong> {msg.content}
                </div>

                <div>
                  <strong>Отправитель:</strong> {msg.sender ? <Address address={msg.sender} /> : "Неизвестно"}
                </div>

                <div>
                  <strong>Голоса:</strong> {msg.votes}
                </div>

                <button
                  onClick={() => voteForMessage(msg.id)}
                  disabled={loading}
                  className="btn btn-outline btn-accent mt-2"
                >
                  Голосовать
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Home;
