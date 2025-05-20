import React, { useState } from "react";
import "./aspect/ForgotPasswordPopup.css";

function ForgotPasswordPopup({ onClose }) {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState(1);
  const [cod, setCod] = useState("");
  const [parolaNoua, setParolaNoua] = useState("");
  const [confirmaParola, setConfirmaParola] = useState("");
  const [mesaj, setMesaj] = useState("");

  const handleTrimiteCod = async () => {
    const res = await fetch("http://localhost:3000/trimite-cod-resetare", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (res.ok) setStep(2);
    else alert(data.message);
  };

  const handleVerificaCod = async () => {
    const res = await fetch("http://localhost:3000/verifica-cod-resetare", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, cod }),
    });
    if (res.ok) setStep(3);
    else {
      setMesaj("Cod invalid!");
      setTimeout(() => setMesaj(""), 3000);
    }
  };

  const handleSchimbaParola = async () => {
    if (parolaNoua !== confirmaParola) {
      setMesaj("Parolele nu coincid!");
      return;
    }

    const res = await fetch("http://localhost:3000/reseteaza-parola", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, parolaNoua }),
    });

    if (res.ok) {
      setMesaj("Parola schimbată cu succes!");
      setTimeout(onClose, 3000);
    } else {
      setMesaj("Eroare la resetare!");
    }
  };

  return (
    <div className="popup-overlay">
      <div className="popup">
        {step === 1 && (
          <>
            <h3>Introdu adresa de email</h3>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button onClick={handleTrimiteCod}>Trimite cod</button>
          </>
        )}

        {step === 2 && (
          <>
            <h3>Introdu codul primit</h3>
            <input
              type="text"
              placeholder="Cod"
              value={cod}
              onChange={(e) => setCod(e.target.value)}
            />
            <button onClick={handleVerificaCod}>Verifică cod</button>
          </>
        )}

        {step === 3 && (
          <>
            <h3>Schimbă parola</h3>
            <input
              type="password"
              placeholder="Parolă nouă"
              value={parolaNoua}
              onChange={(e) => setParolaNoua(e.target.value)}
            />
            <input
              type="password"
              placeholder="Confirmă parola"
              value={confirmaParola}
              onChange={(e) => setConfirmaParola(e.target.value)}
            />
            <div className="popup-buttons">
              <button onClick={handleSchimbaParola}>Confirmă</button>
              <button onClick={onClose}>Anulează</button>
            </div>
          </>
        )}

        {mesaj && <p className="popup-message">{mesaj}</p>}
      </div>
    </div>
  );
}

export default ForgotPasswordPopup;
