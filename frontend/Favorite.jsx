import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./style.css";

function Favorite() {
    const [favorite, setFavorite] = useState([]);
    const utilizator_id = localStorage.getItem('utilizator_id');
    const navigate = useNavigate();

    // Fetch pentru cărțile favorite
    useEffect(() => {
        fetch(`http://localhost:3000/favorite/${utilizator_id}`)
            .then(res => res.json())
            .then(data => setFavorite(data))
            .catch(error => console.error("Eroare la încărcarea favoritelor:", error));
    }, []);

    // ✅ Funcție pentru generarea stelelor colorate în funcție de rating
    const renderStars = (rating) => {
        const maxStars = 5;
        const fullStars = Math.round(rating); // Rotunjire la cel mai apropiat întreg

        return [...Array(maxStars)].map((_, index) => (
            <span key={index} className={index < fullStars ? "star-filled" : "star-empty"}>
                ★
            </span>
        ));
    };

    return (
        <div className="favorite-container">
            {/* ✅ Header-ul fix de sus */}
            <header className="header">
                <div className="nav-buttons">
                    <button className="nav-button" onClick={() => navigate("/")}>Explorează</button>
                    <button className="nav-button">Recomandate</button>
                    <button className="nav-button">Cărțile mele</button>
                    <button className="nav-button">Istoric</button>
                </div>
                <div className="right-buttons">
                    <button className="icon-button" onClick={() => navigate("/favorite")}>⭐</button>
                    <button className="icon-button">👤</button>
                </div>
            </header>

            <h2 className="titluFavorite">Cărți favorite</h2>

            <div className="book-grid">
                {favorite.length === 0 ? (
                    <p className="lipsaFavorite">Nu ai cărți favorite încă!</p>
                ) : (
                    favorite.map(carte => (
                        <div 
                            key={carte.id} 
                            className="book-card" 
                            onClick={() => navigate(`/detalii/${carte.id}`)}
                        >
                            <img src={carte.imagine} alt={carte.titlu} className="book-image" />
                            <p className="book-title">{carte.titlu} - {carte.autor}</p>
                            <p className="book-rating">{renderStars(carte.rating)}</p> {/* ✅ Afișare rating */}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default Favorite;