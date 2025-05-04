import React, { useEffect, useRef, useState } from "react";
import "../aspect/ChatWidget.css";
import ChatbotIcon from "./ChatbotIcon";
import ChatForm from "./ChatForm";
import ChatMessage from "./ChatMessage";
import { basic_info } from "./basic_info";

const ChatWidget = () => {
  const [chatHistory, setChatHistory] = useState([
    {
      hideInChat: true,
      role: "model",
      text: basic_info,
    },
  ]);
  const [showChatbot, setShowChatbot] = useState(false);
  const chatBodyRef = useRef();

  const generateBotResponse = async (history) => {
    const lastUserMessage = history[history.length - 1]?.text;

    // Pas 1: încearcă să obții un răspuns de la server
    try {
      const userId = localStorage.getItem("utilizator_id");
      const res = await fetch("http://localhost:3000/chatbot-query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: lastUserMessage, userId }),
      });

      const serverReply = await res.json();

      // Dacă serverul a răspuns cu informații dinamice (ex: din DB)
      if (serverReply.type === "dynamic") {
        setChatHistory((prev) => [
          ...prev.filter((msg) => msg.text !== "Se gândește..."),
          { role: "model", text: serverReply.text },
        ]);
        return;
      }

      // Dacă serverul nu a găsit un răspuns, continuăm spre fallback AI
    } catch (err) {
      console.error("Eroare la interogarea serverului:", err);
    }

    // Pas 2: fallback – AI-ul răspunde folosind istoricul (inclusiv basic_info)
    const updateHistory = (text, isError = false) => {
      setChatHistory((prev) => [
        ...prev.filter((msg) => msg.text !== "Se gândește..."),
        { role: "model", text, isError },
      ]);
    };

    const formattedHistory = history.map(({ role, text }) => ({
      role,
      parts: [{ text }],
    }));

    try {
      const response = await fetch(import.meta.env.VITE_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: formattedHistory }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || "Eroare AI");

      const aiResponse = data.candidates[0].content.parts[0].text.trim();
      updateHistory(aiResponse);
    } catch (err) {
      updateHistory(err.message, true);
    }
  };

  useEffect(() => {
    //autoscroll cand istoricul chatului se updateaza
    chatBodyRef.current.scrollTo({
      top: chatBodyRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [chatHistory]);

  return (
    <>
      <div className={`chatbot-container ${showChatbot ? "show-chatbot" : ""}`}>
        <button
          onClick={() => setShowChatbot((prev) => !prev)}
          id="chatbot-toggler"
        >
          <span className="material-symbols-rounded">mode_comment</span>
          <span className="material-symbols-rounded">close</span>
        </button>

        <div className="chatbot-popup">
          {/* chatbot header */}
          <div className="chat-header">
            <div className="header-info">
              <ChatbotIcon />
              <h2 className="logo-text">Chatbot</h2>
            </div>
            <button
              onClick={() => setShowChatbot((prev) => !prev)}
              className="material-symbols-rounded"
            >
              keyboard_arrow_down
            </button>
          </div>
          {/* chatbot body */}
          <div ref={chatBodyRef} className="chat-body">
            <div className="message bot-message">
              <ChatbotIcon />
              <p className="message-text">
                Bună! <br /> Cu ce te pot ajuta astăzi?
              </p>
            </div>

            {/* render chat history dinamically */}
            {chatHistory.map((chat, index) => (
              <ChatMessage key={index} chat={chat} />
            ))}
          </div>
          {/* chatbot footer */}
          <div className="chat-footer">
            <ChatForm
              chatHistory={chatHistory}
              setChatHistory={setChatHistory}
              generateBotResponse={generateBotResponse}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatWidget;
