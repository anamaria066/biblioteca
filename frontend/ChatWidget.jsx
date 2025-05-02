import React, { useState } from 'react';
import './aspect/ChatWidget.css';
import { getFAQAnswer } from '../backend/faq'; // ajustează calea după locul fișierului



function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");

const addUserMessage = (text) => {
  setMessages(prev => [...prev, { sender: "user", text }]);
};

const addBotMessage = (text) => {
  setMessages(prev => [...prev, { sender: "bot", text }]);
};

const handleSendMessage = async (message) => {
    addUserMessage(message);
  
    const faqResponse = getFAQAnswer(message);
    if (faqResponse) {
      addBotMessage(faqResponse);
      return;
    }
  
    const count = parseInt(localStorage.getItem("ai_question_count")) || 0;
    if (count >= 3) {
      addBotMessage("Ai atins limita de întrebări AI gratuite.");
      return;
    }
  
    addBotMessage("Întrebarea ta a fost transmisă către asistentul virtual. Te rog așteaptă...");
  
    try {
      const res = await fetch("http://localhost:3000/intreaba-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: message }),
      });
  
      const data = await res.json();
      if (data.answer) {
        addBotMessage(data.answer);
        localStorage.setItem("ai_question_count", count + 1);
      } else {
        addBotMessage("AI-ul nu a returnat un răspuns valid.");
      }
    } catch (err) {
      addBotMessage("Eroare la conectarea cu asistentul AI.");
      console.error(err);
    }
  };

  return (
    <>
      {/* Buton plutitor */}
      <div className="chat-button" onClick={() => setIsOpen(prev => !prev)}>
        <img src="/images/chatbot.png" alt="Chat Icon" />
      </div>

      {/* Chat Box flotant */}
      {isOpen && (
        <div className="chat-box">
          <div className="chat-header">
            <h4>Asistent Virtual</h4>
            <button onClick={() => setIsOpen(false)}>✖</button>
          </div>
          <div className="chat-body">
        {messages.map((msg, idx) => (
            <div key={idx} className={`chat-message ${msg.sender}`}>
            {msg.text}
            </div>
        ))}
        </div>

          <div className="chat-input">
        <input
            type="text"
            placeholder="Scrie o întrebare..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
            if (e.key === "Enter") {
                handleSendMessage(inputValue);
                setInputValue("");
            }
            }}
        />
        <button onClick={() => {
            handleSendMessage(inputValue);
            setInputValue("");
        }}>Trimite</button>
        </div>
        </div>
      )}
    </>
  );
}

export default ChatWidget;