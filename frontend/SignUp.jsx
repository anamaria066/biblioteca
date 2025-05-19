import { useNavigate } from "react-router-dom";
import { useState } from "react";
import "./aspect/SignUp.css";

function SignUp() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    accessKey: "",
  });
  const [error, setError] = useState("");
  const [hasAccessKey, setHasAccessKey] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCheckboxChange = () => {
    setHasAccessKey(!hasAccessKey);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password || !form.confirmPassword) {
      setError("Toate câmpurile sunt obligatorii!");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Parolele nu corespund!");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/sign-up", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nume: form.firstName,
          prenume: form.lastName,
          email: form.email,
          parola: form.password,
          accessKey: hasAccessKey ? form.accessKey : null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setError(""); // Clear any previous error
        setTimeout(() => {
          navigate("/"); // Redirecționează către ruta de bază după crearea contului
        }, 1000); //  un delay înainte de redirecționare
      } else {
        setError(data.message); // Afișează mesajul de eroare din răspuns
      }
    } catch (err) {
      setError("Eroare de rețea!");
    }
  };

  return (
    <div className="signup-wrapper">
      <div className="signup-left">
        <img
          src="../images/background12.jpg"
          alt="library"
          className="signup-background-img"
        />
        <div className="signup-quote">
          „Cititul este mijlocul prin care cineva poate gândi cu mintea
          altcuiva.”
          <br />— Arthur Schopenhauer
        </div>
      </div>

      <div className="signup-right">
        <div className="signup-container-new">
          <h2>Crează un cont</h2>
          <form onSubmit={handleSubmit} className="signup-form-new">
            <div className="signup-box">
              <input
                type="text"
                name="firstName"
                placeholder="Nume"
                value={form.firstName}
                onChange={handleChange}
                className="signup-input"
              />
              <input
                type="text"
                name="lastName"
                placeholder="Prenume"
                value={form.lastName}
                onChange={handleChange}
                className="signup-input"
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                className="signup-input"
              />
              <input
                type="password"
                name="password"
                placeholder="Parolă"
                value={form.password}
                onChange={handleChange}
                className="signup-input"
              />
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirmare parolă"
                value={form.confirmPassword}
                onChange={handleChange}
                className="signup-input"
              />

              <div className="checkbox-container">
                <input
                  type="checkbox"
                  id="accessKeyCheckbox"
                  checked={hasAccessKey}
                  onChange={handleCheckboxChange}
                />
                <label htmlFor="accessKeyCheckbox">Am cheie de acces</label>
              </div>

              {hasAccessKey && (
                <input
                  type="text"
                  name="accessKey"
                  placeholder="Introduceți cheia de acces"
                  value={form.accessKey}
                  onChange={handleChange}
                  className="signup-input"
                />
              )}

              <button id="btnCreazaCont" type="submit">
                Crează cont
              </button>
            </div>
          </form>
          {error && <p className="error-message">{error}</p>}
        </div>
      </div>
    </div>
  );
}

export default SignUp;
