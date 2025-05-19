import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./aspect/Login.css";

function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

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
          <a href="/forgot-password" className="forgot-link">
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
    </div>
  );
}

export default Login;
