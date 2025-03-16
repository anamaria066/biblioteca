import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./style.css";

function DetaliiCarte() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [carte, setCarte] = useState(null);
    const [recenzii, setRecenzii] = useState([]);
    const [showAllRecenzii, setShowAllRecenzii] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [recenzie, setRecenzie] = useState({ rating: "", comentariu: "" });
    const [mesaj, setMesaj] = useState("");
    const [esteFavorita, setEsteFavorita] = useState(false);
    const utilizator_id = localStorage.getItem('utilizator_id');

    // ✅ Funcție pentru a încărca cartea, recenziile și favoritele
    const fetchData = async () => {
        try {
            const carteRes = await fetch(`http://localhost:3000/carte/${id}`);
            const carteData = await carteRes.json();
            setCarte(carteData);

            const recenziiRes = await fetch(`http://localhost:3000/recenzii/${id}`);
            const recenziiData = await recenziiRes.json();
            setRecenzii(recenziiData);

            const favoriteRes = await fetch(`http://localhost:3000/favorite/${utilizator_id}`);
            const favoriteData = await favoriteRes.json();
            setEsteFavorita(favoriteData.some(fav => fav.id === parseInt(id)));
        } catch (error) {
            console.error("Eroare la încărcarea datelor:", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    // ✅ Calcularea rating-ului mediu
    const calculeazaRatingMediu = () => {
        if (recenzii.length === 0) return 0;
        const sumaRatinguri = recenzii.reduce((sum, recenzie) => sum + parseFloat(recenzie.rating), 0);
        return (sumaRatinguri / recenzii.length).toFixed(1);
    };

    // ✅ Generare stele corecte (inclusiv jumătăți)
    const renderStars = (rating) => {
    const maxStars = 5;
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.3 && rating % 1 <= 0.7;
    const emptyStars = maxStars - fullStars - (hasHalfStar ? 1 : 0);

    return (
        <span className="rating-stars">
            {"★".repeat(fullStars)}
            {hasHalfStar && <span className="half-star">★</span>}
            {"★".repeat(emptyStars)}
        </span>
    );
};

    // ✅ Adăugare/ștergere carte din favorite
    const handleFavorite = async () => {
        const url = esteFavorita ? "/sterge-favorite" : "/adauga-favorite";
        const method = esteFavorita ? "DELETE" : "POST";

        try {
            const response = await fetch(`http://localhost:3000${url}`, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ utilizator_id, carte_id: id })
            });

            const data = await response.json();
            if (response.ok) {
                setEsteFavorita(!esteFavorita);
            }
            alert(data.message);
        } catch (error) {
            console.error("Eroare:", error);
        }
    };

    // ✅ Trimitere recenzie
    const handleSubmitRecenzie = async (e) => {
        e.preventDefault();

        const nota = parseFloat(recenzie.rating);
        if (isNaN(nota) || nota < 0 || nota > 5 || !recenzie.comentariu) {
            setMesaj("Te rugăm să completezi toate câmpurile și să alegi un rating valid!");
            return;
        }

        try {
            const response = await fetch("http://localhost:3000/adauga-recenzie", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    carte_id: id,
                    rating: nota,
                    comentariu: recenzie.comentariu,
                    utilizator_id
                }),
            });

            const data = await response.json();
            if (response.ok) {
                setMesaj("Recenzia a fost adăugată cu succes!");
                setTimeout(() => {
                    setShowPopup(false);
                    setMesaj("");
                    setRecenzie({ rating: "", comentariu: "" });
                    fetchData();
                }, 1000);
            } else {
                setMesaj(data.message || "Eroare la adăugarea recenziei!");
            }
        } catch (err) {
            setMesaj("Eroare de rețea!");
        }
    };

    const ratingMediu = calculeazaRatingMediu();

    if (!carte) {
        return <p>Se încarcă...</p>;
    }

    return (
        <div className="detalii-container">
            <header className="header">
                <div className="nav-buttons">
                    <button className="nav-button">Explorează</button>
                    <button className="nav-button">Recomandate</button>
                    <button className="nav-button">Cărțile mele</button>
                    <button className="nav-button">Istoric</button>
                </div>
                <div className="right-buttons">
                    <button className="icon-button" onClick={() => navigate("/favorite")}>⭐</button>
                    <button className="icon-button">👤</button>
                </div>
            </header>

            <div className="detalii-carte">
                <div className="detalii-text">
                    <h2>{carte.titlu}</h2>
                    <p><strong>Autor:</strong> {carte.autor}</p>
                    <p><strong>An publicare:</strong> {carte.an_publicatie}</p>
                    <p><strong>Gen:</strong> {carte.gen}</p>
                    <p><strong>Preț:</strong> {carte.pret} RON</p>
                    <p><strong>Descriere:</strong> {carte.descriere}</p>
                    <p><strong>Rating:</strong> {renderStars(ratingMediu)} ({ratingMediu}/5)</p>

                    <button className="btn-recenzie" onClick={() => setShowPopup(true)}>Lasă o recenzie</button>
                    <button className={`btn-favorite ${esteFavorita ? "favorita" : ""}`} onClick={handleFavorite}>
                        {esteFavorita ? "💖 Favorită" : "🤍 Adaugă la favorite"}
                    </button>
                </div>
                <div className="detalii-imagine">
                    <img src={carte.imagine} alt={carte.titlu} className="coperta-mare" />
                </div>
            </div>

            {/* ✅ Recenziile sunt PĂSTRATE complet */}
            <div className="recenzii-container">
                <h3>Recenzii</h3>

                {recenzii.length === 0 ? (
                    <p className="fara-recenzii">Nu există recenzii momentan!</p>
                ) : (
                    <div className="recenzii-box">
                        {recenzii.map((recenzie, index) => (
                            <div className="recenzie-card" key={index}>
                                <p><strong>{recenzie.Utilizator.nume} {recenzie.Utilizator.prenume}, Nota: {recenzie.rating}/5 ⭐</strong></p>
                                <p className="recenzie-text">{recenzie.comentariu}</p>
                                <p><small>Data: {new Date(recenzie.data_recenzie).toLocaleDateString()}</small></p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default DetaliiCarte;