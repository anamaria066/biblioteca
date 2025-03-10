import React from 'react';
import { useNavigate } from "react-router-dom";
import './style.css'

function Welcome() {
    const navigate = useNavigate();
    return (
        <div>
            <div className="header-image">
                    <img src="/images/library.jpg" alt="Library" />
            </div>
            <div className="welcome-box">
                <h2 id='titluWelcome'>Bun venit în biblioteca online!</h2>
                <button id='btnAuth' onClick={() => navigate('/login')}>Autentificare</button>
                <button id='btnCreareCont' onClick={() => navigate('/signup')}>Creare cont</button>
            </div>
        </div>
    );
};

export default Welcome;