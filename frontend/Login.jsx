import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./style.css";

function Login() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        email: "",
        password: "",
    });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.email || !form.password) {
            setError('Te rugăm să completezi toate câmpurile!');
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: form.email,
                    parola: form.password
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setError('');  // Clear error message on successful login
                // Redirecționare în funcție de tipul de utilizator
                setTimeout(() => {
                    if (data.tip === 'client') {
                        navigate('/client');
                    } else if (data.tip === 'administrator') {
                        navigate('/admin');
                    }
                }, 1000); // Optional, for slight delay before navigation
            } else {
                setError(data.message); // Set error message if response is not OK
            }
        } catch (err) {
            setError('Eroare de rețea!');
        }
    };

    return (
        <div className="login-container">
            <h1>Login</h1>
            <form onSubmit={handleSubmit} className="login-form">
                <div className="login-box">
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={form.email}
                        onChange={handleChange}
                        className="login-input"
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder="Parolă"
                        value={form.password}
                        onChange={handleChange}
                        className="login-input"
                    />
                    <button id="btnLogin" type="submit">Logare</button>
                </div>
                {error && <p className="error-message">{error}</p>}
            </form>
            <div className="forgot-password-link">
                <a href="/forgot-password">Ai uitat parola?</a>
            </div>
        </div>
    );
}

export default Login;
