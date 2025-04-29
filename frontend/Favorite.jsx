import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./style.css";

function Favorite() {
    const [favorite, setFavorite] = useState([]);
    const utilizator_id = localStorage.getItem('utilizator_id');
    const navigate = useNavigate();
    const [user, setUser] = useState({
                nume: "",
                prenume: ""
            });

    // Fetch pentru cărțile favorite
    useEffect(() => {
        fetch(`http://localhost:3000/favorite/${utilizator_id}`)
            .then(res => res.json())
            .then(data => setFavorite(data))
            .catch(error => console.error("Eroare la încărcarea favoritelor:", error));
        

        // Obține datele utilizatorului din baza de date
        const userId = localStorage.getItem("utilizator_id");
        if (userId) {
            fetch(`http://localhost:3000/profil/${userId}`)
                .then((res) => res.json())
                .then((data) => {
                    setUser({
                        nume: data.nume,
                        prenume: data.prenume,
                        pozaProfil: data.pozaProfil || "/images/default-avatar.jpg"
                    });
                })
                .catch((err) => console.error("Eroare la obținerea profilului:", err));
        }
    }, []);

    // ✅ Funcție pentru generarea stelelor colorate în funcție de rating
    const renderStars = (rating) => {
        const maxStars = 5;
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.3 && rating % 1 <= 0.7;
        const emptyStars = maxStars - fullStars - (hasHalfStar ? 1 : 0);
    
        return (
            <span className="rating-stars">
                {"★".repeat(fullStars)}
                {hasHalfStar && <span className="half-star">★</span>}
                {"☆".repeat(emptyStars)}
            </span>
        );
    };

    return (
        <div className="favorite-container">
            {/* ✅ Header-ul fix de sus */}
            <header className="header">
                <div className="nav-buttons">
                    <button className="nav-button" onClick={() => navigate("/client")}>Explorează</button>
                    <button className="nav-button" onClick={() => navigate("/recomandate")}>Recomandate</button>
                    <button className="nav-button" onClick={() => navigate("/imprumuturi-active")}>Împrumuturi active</button>
                    <button className="nav-button" onClick={() => navigate("/istoric")}>Istoric</button>
                </div>

                <div className="right-buttons">
                     <p className="user-info">Bun venit, {user.nume} {user.prenume}!</p>
                     <img
                        src="/images/favorite.png"
                        alt="Favorite"
                        className="icon-button favorite-icon"
                        onClick={() => navigate("/favorite")}
                    />
                    <img
                    src={
                        user.pozaProfil
                            ? user.pozaProfil.startsWith("/uploads")
                                ? `http://localhost:3000${user.pozaProfil}`
                                : user.pozaProfil
                            : "/images/default-avatar.jpg"
                    }
                    alt="Poza de profil"
                    className="profile-img-small"
                    onClick={() => navigate("/profil-client")}
                    />
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