import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./aspect/Welcome.css";

function Welcome() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showDeletedMessage, setShowDeletedMessage] = useState(false);

  useEffect(() => {
    if (location.state?.showDeletedMessage) {
      setShowDeletedMessage(true);
      const timer = setTimeout(() => setShowDeletedMessage(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  return (
    <div className="welcome-container">
      <div className="branding-titlu animated-header">
        📚 <strong>BiblioSmart</strong> — Biblioteca ta digitală inteligentă
      </div>
      <div className="welcome-overlay"></div>

      <div className="welcome-content">
        <h1 className="welcome-title">Bun venit!</h1>
        <p className="welcome-subtitle">
          Descoperă, împrumută și bucură-te de cărți din confortul casei tale.
        </p>
        <div className="welcome-buttons">
          <button id="btnAuth" onClick={() => navigate("/login")}>
            Autentificare
          </button>
          <button id="btnCreareCont" onClick={() => navigate("/signup")}>
            Creare cont
          </button>
        </div>
      </div>

      {showDeletedMessage && (
        <div className="floating-success-stergere-cont">
          Contul a fost șters cu succes!
        </div>
      )}
    </div>
  );
}

export default Welcome;
