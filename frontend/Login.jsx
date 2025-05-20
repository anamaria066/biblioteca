import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./aspect/Login.css";

function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [popupReset, setPopupReset] = useState(false);
  const [emailReset, setEmailReset] = useState("");
  const [codTrimis, setCodTrimis] = useState("");
  const [codIntrodus, setCodIntrodus] = useState("");
  const [verificat, setVerificat] = useState(false);
  const [parolaNoua, setParolaNoua] = useState("");
  const [confirmaParola, setConfirmaParola] = useState("");
  const [mesaj, setMesaj] = useState(null);
  const popupRef = useRef();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        setPopupReset(false);
        setVerificat(false);
      }
    };

    if (popupReset) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [popupReset]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError("Te rugăm să completezi toate câmpurile!");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, parola: form.password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("utilizator_id", data.id);
        localStorage.setItem("token", data.token);
        localStorage.setItem("nume", data.nume);
        localStorage.setItem("prenume", data.prenume);

        setTimeout(() => {
          if (data.tip === "client") navigate("/client");
          else if (data.tip === "administrator") navigate("/admin");
        }, 300);
      } else {
        setError(data.message);
      }
    } catch {
      setError("Eroare de rețea!");
    }
  };

  const handleTrimiteCod = async () => {
    if (!emailReset) return;
    try {
      const res = await fetch("http://localhost:3000/trimite-cod-resetare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailReset }),
      });
      const data = await res.json();
      if (res.ok) {
        setMesaj({ text: "Cod trimis pe email!", tip: "succes" });
      } else {
        setMesaj({ text: data.message, tip: "eroare" });
      }
    } catch {
      setMesaj({ text: "Eroare la trimitere!", tip: "eroare" });
    }
    setTimeout(() => setMesaj(null), 4000);
  };

  const handleVerificaCod = async () => {
    try {
      const res = await fetch("http://localhost:3000/verifica-cod-resetare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailReset, cod: codIntrodus }),
      });
      const data = await res.json();
      if (res.ok) {
        setVerificat(true);
        setMesaj({ text: "Cod validat cu succes!", tip: "succes" });
      } else {
        setMesaj({ text: "Cod invalid!", tip: "eroare" });
      }
    } catch {
      setMesaj({ text: "Eroare server!", tip: "eroare" });
    }
    setTimeout(() => setMesaj(null), 3000);
  };

  const handleConfirmaParola = async () => {
    if (parolaNoua !== confirmaParola) {
      setMesaj({ text: "Parolele nu coincid!", tip: "eroare" });
      setTimeout(() => setMesaj(null), 3000);
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/resetare-parola", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailReset, parolaNoua }),
      });
      const data = await res.json();
      if (res.ok) {
        setMesaj({ text: "Parola schimbată cu succes!", tip: "succes" });
        setTimeout(() => {
          setPopupReset(false);
          setVerificat(false);
        }, 3000);
      } else {
        setMesaj({ text: data.message, tip: "eroare" });
      }
    } catch {
      setMesaj({ text: "Eroare server!", tip: "eroare" });
    }
    setTimeout(() => setMesaj(null), 3000);
  };

  return (
    <div className="login-wrapper">
      <div className="login-left">
        <div className="login-container-new">
          <h2>Bine ai revenit!</h2>
          <form onSubmit={handleSubmit} className="login-form-new">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
            />
            <input
              type="password"
              name="password"
              placeholder="Parolă"
              value={form.password}
              onChange={handleChange}
            />
            <button type="submit">Logare</button>
          </form>
          <a onClick={() => setPopupReset(true)} className="forgot-link">
            Ai uitat parola?
          </a>
          {error && <p className="error-message">{error}</p>}
        </div>
      </div>
      <div className="login-right">
        <img
          src="../images/background9.jpg"
          alt="library"
          className="login-background-img"
        />
        <div className="login-quote">
          „O cameră fără cărți este ca un trup fără suflet.”
          <br />— Cicero
        </div>
      </div>

      {popupReset && (
        <div className="popup-overlay-cod">
          <div className="popup-content-sch-parola" ref={popupRef}>
            {!verificat ? (
              <>
                <p>Introdu adresa de email:</p>
                <input
                  type="email"
                  value={emailReset}
                  onChange={(e) => setEmailReset(e.target.value)}
                  placeholder="email@exemplu.com"
                />
                <button onClick={handleTrimiteCod}>Trimite cod</button>

                <input
                  type="text"
                  placeholder="Introdu codul"
                  maxLength={5}
                  value={codIntrodus}
                  onChange={(e) => setCodIntrodus(e.target.value)}
                />
                <button onClick={handleVerificaCod}>Verifică cod</button>
              </>
            ) : (
              <>
                <p>Setează o parolă nouă:</p>
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
                <div className="btns-sch-parola">
                  <button id="btnConfirmaSchPsw" onClick={handleConfirmaParola}>
                    Confirmă
                  </button>
                  <button
                    id="btnAnuleazaSchPsw"
                    onClick={() => setPopupReset(false)}
                  >
                    Anulează
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {mesaj && (
        <div
          className={
            mesaj.tip === "succes"
              ? "floating-success-sch-parola"
              : "floating-error-sch-parola"
          }
        >
          {mesaj.text}
        </div>
      )}
    </div>
  );
}

export default Login;
