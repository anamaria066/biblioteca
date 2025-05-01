import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import './aspect/Welcome.css';

function Welcome() {
    const navigate = useNavigate();
    const location = useLocation();
    const [showDeletedMessage, setShowDeletedMessage] = useState(false);

    useEffect(() => {
        if (location.state?.showDeletedMessage) {
            setShowDeletedMessage(true);

            // Ascunde după 3 secunde
            const timer = setTimeout(() => setShowDeletedMessage(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [location.state]);

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

            {showDeletedMessage && (
                <div className="floating-success">Contul a fost șters cu succes!</div>
            )}
        </div>
    );
};

export default Welcome;