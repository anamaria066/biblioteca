import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../aspect/Favorite.css";
import HeaderClient from "./HeaderClient";
import ChatWidget from "../chatbot/ChatWidget";

function Favorite() {
  const [favorite, setFavorite] = useState([]);
  const utilizator_id = localStorage.getItem("utilizator_id");
  const navigate = useNavigate();
  const [user, setUser] = useState({
    nume: "",
    prenume: "",
  });

  // Fetch pentru cărțile favorite
  useEffect(() => {
    fetch(`http://localhost:3000/favorite/${utilizator_id}`)
      .then((res) => res.json())
      .then((data) => setFavorite(data))
      .catch((error) =>
        console.error("Eroare la încărcarea favoritelor:", error)
      );

    // Obține datele utilizatorului din baza de date
    const userId = localStorage.getItem("utilizator_id");
    if (userId) {
      fetch(`http://localhost:3000/profil/${userId}`)
        .then((res) => res.json())
        .then((data) => {
          setUser({
            nume: data.nume,
            prenume: data.prenume,
            pozaProfil: data.pozaProfil || "/images/default-avatar.jpg",
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
      <HeaderClient />

      <h2 className="titluFavorite">Cărți favorite</h2>

      <div className="book-grid">
        {favorite.length === 0 ? (
          <p className="lipsaFavorite">Nu ai cărți favorite încă!</p>
        ) : (
          favorite.map((carte) => (
            <div
              key={carte.id}
              className="book-card"
              onClick={() => navigate(`/detalii/${carte.id}`)}
            >
              <img
                src={carte.imagine}
                alt={carte.titlu}
                className="book-image"
              />
              <p className="book-title">
                {carte.titlu} - {carte.autor}
              </p>
              <p className="book-rating">{renderStars(carte.rating)}</p>{" "}
              {/* ✅ Afișare rating */}
            </div>
          ))
        )}
      </div>
      <ChatWidget />
    </div>
  );
}

export default Favorite;
