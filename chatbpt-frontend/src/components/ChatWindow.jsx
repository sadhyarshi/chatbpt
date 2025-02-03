import React, { useEffect, useState, useCallback } from "react";
import { sendMessage, getChatHistory } from "../api";

const ChatWindow = ({ token, userId }) => {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [currentChat, setCurrentChat] = useState([]);

  // Fetch chat history
  const fetchChatHistory = useCallback(async () => {
    try {
      const history = await getChatHistory(token, userId);
      setChatHistory(history);
    } catch (err) {
      console.error("Failed to fetch chat history:", err);
    }
  }, [token, userId]);

  useEffect(() => {
    fetchChatHistory();
  }, [fetchChatHistory]);

  // Handle sending a new message
  const handleSendMessage = async () => {
    if (!message.trim()) return;

    // Add the user's message to the chat immediately
    const newMessage = { user: message, ai: "" };
    setCurrentChat((prev) => [...prev, newMessage]);
    setMessage("");

    try {
      // Send the message to the backend
      const response = await sendMessage(token, newMessage.user);

      // Update the AI's response in the chat
      setCurrentChat((prev) =>
        prev.map((msg, index) =>
          index === prev.length - 1 ? { ...msg, ai: response.response } : msg
        )
      );
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  // Handle clicking on a chat history item
  const handleChatHistoryClick = (chat) => {
    // Load the selected chat into the chat window
    setCurrentChat([
      { user: chat.message, ai: chat.response },
    ]);
  };

  return (
    <div className="chat-container">
      {/* Sidebar */}
      <div className="sidebar">
        <h3>Chat History</h3>
        {Array.isArray(chatHistory) && chatHistory.length > 0 ? (
          chatHistory.map((chat, index) => (
            <div
              key={index}
              className="history-item"
              onClick={() => handleChatHistoryClick(chat)} // Add click handler
              style={{ cursor: "pointer" }}
            >
              {chat.message}
            </div>
          ))
        ) : (
          <p>No chat history available</p>
        )}
      </div>

      {/* Main Chat Area */}
      <div className="main-chat">
        <div className="chat-header">
          <h2>ChatBPT</h2>
        </div>
        <div className="chat-messages">
          {currentChat.map((msg, index) => (
            <React.Fragment key={index}>
              {/* User Message */}
              {msg.user && (
                <div className="message user">{msg.user}</div>
              )}
              {/* AI Response */}
              {msg.ai && (
                <div className="message ai">{msg.ai}</div>
              )}
            </React.Fragment>
          ))}
        </div>
        <div className="chat-input">
          <input
            type="text"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
          />
          <button onClick={handleSendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;