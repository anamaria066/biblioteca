import React, { useEffect, useRef, useState } from "react";
import "../aspect/ChatWidget.css";
import ChatbotIcon from "./ChatbotIcon";
import ChatForm from "./ChatForm";
import ChatMessage from "./ChatMessage";
import { basic_info } from "./basic_info";

const ChatWidget = () => {
  const [chatHistory, setChatHistory] = useState([]);
  const [showChatbot, setShowChatbot] = useState(false);
  const userMessageCountRef = useRef(0);
  const chatBodyRef = useRef();

  const sentIntroRef = useRef(false); // Adăugat în componentă, în afara funcției

  const generateBotResponse = async (history) => {
    // const lastUserMessage = history[history.length - 1]?.text;
    const rawUserMessage = history[history.length - 1]?.text.replace(
      /^Folosind detaliile.*?: /,
      ""
    ); //aici

    try {
      const userId = localStorage.getItem("utilizator_id");
      const res = await fetch("http://localhost:3000/chatbot-query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: rawUserMessage, userId }), //aici
      });

      const serverReply = await res.json();

      if (serverReply.type === "dynamic") {
        setChatHistory((prev) => [
          ...prev.filter((msg) => msg.text !== "Se gândește..."),
          { role: "model", text: serverReply.text },
        ]);
        return;
      }
    } catch (err) {
      console.error("Eroare la interogarea serverului:", err);
    }

    const visibleHistory = history.filter(
      (msg) => !msg.hideInChat && msg.text !== "Se gândește..."
    );

    const formattedHistory = [];
    userMessageCountRef.current += 1;

    if (!sentIntroRef.current || userMessageCountRef.current % 2 === 0) {
      formattedHistory.push({
        role: "user",
        parts: [
          {
            text:
              "Context despre platformă:\n" +
              basic_info +
              "\n\nȚine cont de aceste informații în toate răspunsurile următoare.",
          },
        ],
      });
      sentIntroRef.current = true;
    }

    const lastMessage = history
      .filter(
        (msg) =>
          msg.role === "user" &&
          !msg.hideInChat &&
          msg.text !== "Se gândește..."
      )
      .slice(-1)
      .map(({ role, text }) => ({
        role,
        parts: [{ text }],
      }));

    formattedHistory.push(...lastMessage);

    try {
      const response = await fetch(import.meta.env.VITE_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: formattedHistory }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || "Eroare AI");

      const aiResponse = data.candidates[0].content.parts[0].text.trim();

      setChatHistory((prev) => [
        ...prev.filter((msg) => msg.text !== "Se gândește..."),
        { role: "model", text: aiResponse },
      ]);
    } catch (err) {
      setChatHistory((prev) => [
        ...prev.filter((msg) => msg.text !== "Se gândește..."),
        { role: "model", text: err.message, isError: true },
      ]);
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
