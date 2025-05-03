import { useRef } from "react";
import "../aspect/ChatWidget.css";

const ChatForm = ({ chatHistory, setChatHistory, generateBotResponse }) => {
  const inputRef = useRef();

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const userMessage = inputRef.current.value.trim();
    if (!userMessage) return;
    inputRef.current.value = "";

    //update chat history with the user's message
    setChatHistory((history) => [
      ...history,
      { role: "user", text: userMessage },
    ]);

    //placeholder pentru raspunsul bot ului
    setTimeout(() => {
      setChatHistory((history) => [
        ...history,
        { role: "model", text: "Se gândește..." },
      ]);

      //apelez functia pentru a genera raspunsul bot ului
      generateBotResponse([
        ...chatHistory,
        {
          role: "user",
          text: `Folosind detaliile oferite mai sus, răspunde la această întrebare: ${userMessage}`,
        },
      ]);
    }, 600);
  };

  return (
    <form action="#" className="chat-form" onSubmit={handleFormSubmit}>
      <input
        ref={inputRef}
        type="text"
        placeholder="Scrie mesaj..."
        className="message-input"
        required
      />
      <button className="material-symbols-rounded">arrow_upward</button>
    </form>
  );
};

export default ChatForm;
