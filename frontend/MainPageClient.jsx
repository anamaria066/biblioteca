import React, { useEffect, useState } from "react";
import './style.css';

function MainPageClient() {
    const [carti, setCarti] = useState([]);
    const [search, setSearch] = useState("");

    // Fetch cărțile din backend
    useEffect(() => {
        fetch("http://localhost:3000/carti-cu-rating")
            .then((response) => response.json())
            .then((data) => setCarti(data))
            .catch((error) => console.error("Eroare la obținerea cărților:", error));
    }, []);

    // Funcție pentru generarea stelelor de rating
    // Funcție pentru generarea stelelor colorate în funcție de rating
    const renderStars = (rating) => {
    const maxStars = 5; // Folosim un sistem de rating pe 5 stele
    const fullStars = Math.round((rating / 10) * maxStars); // Convertim ratingul de 10 în 5 stele

    return [...Array(maxStars)].map((_, index) => (
        <span key={index} className={index < fullStars ? "star-filled" : "star-empty"}>
            ★
        </span>
    ));
};

    // Filtrare cărți după titlu sau autor
    const filteredBooks = carti.filter((carte) =>
        carte.titlu.toLowerCase().includes(search.toLowerCase()) ||
        carte.autor.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="main-container">
            {/* ======= Header fixat sus ======= */}
            <header className="header">
                {/* Butoanele de navigare */}
                <div className="nav-buttons">
                    <button className="nav-button">Explorează</button>
                    <button className="nav-button">Recomandate</button>
                    <button className="nav-button">Cărțile mele</button>
                    <button className="nav-button">Istoric</button>
                </div>

                {/* Butoanele din dreapta */}
                <div className="right-buttons">
                    <button className="icon-button">⭐</button>
                    <button className="icon-button">👤</button>
                </div>
            </header>

            {/* ======= Căutare ======= */}
            <div className="search-container">
                <input className="search-bar" type="text" placeholder="🔍 Căutare" value={search} onChange={(e) => setSearch(e.target.value)}
                />
                <button className="filter-button">🔽</button> {/* Pâlnia de filtrare */}
            </div>

            {/* ======= Afișarea cărților ======= */}
            <div className="book-grid">
                {filteredBooks.map((carte) => (
                    <div className="book-card" key={carte.id}>
                        <img src={carte.imagine} alt={carte.titlu} className="book-image" />
                        <p className="book-title">{carte.titlu} - {carte.autor}</p>
                        <p className="book-rating">{renderStars(carte.rating)}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default MainPageClient;