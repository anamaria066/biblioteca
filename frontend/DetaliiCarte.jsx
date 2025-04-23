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
    const [user, setUser] = useState({
        nume: "",
        prenume: "",
        pozaProfil: ""
    });
    const [mesajFavorit, setMesajFavorit] = useState("");
    const [afiseazaMesajFavorit, setAfiseazaMesajFavorit] = useState(false);
    const [showPopupImprumut, setShowPopupImprumut] = useState(false);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [zileIndisponibile, setZileIndisponibile] = useState([]);
    const [mesajImprumut, setMesajImprumut] = useState("");
    const [afiseazaMesajImprumut, setAfiseazaMesajImprumut] = useState(false);

    // ✅ Funcție pentru a încărca cartea, recenziile și favoritele
    const userId = localStorage.getItem("utilizator_id");

const fetchData = async () => {
    try {
        const carteRes = await fetch(`http://localhost:3000/carte/${id}`);
        const carteData = await carteRes.json();
        setCarte(carteData);

        const recenziiRes = await fetch(`http://localhost:3000/recenzii/${id}`);
        const recenziiData = await recenziiRes.json();
        setRecenzii(recenziiData);

        const favoriteRes = await fetch(`http://localhost:3000/favorite/${userId}`);
        const favoriteData = await favoriteRes.json();
        setEsteFavorita(favoriteData.some(fav => fav.id === parseInt(id)));

        // Obține datele utilizatorului din backend
        const profilRes = await fetch(`http://localhost:3000/profil/${userId}`);
        const profilData = await profilRes.json();
        setUser({
            nume: profilData.nume,
            prenume: profilData.prenume,
            pozaProfil: profilData.pozaProfil || "/images/default-avatar.jpg"
        });
    } catch (error) {
        console.error("Eroare la încărcarea datelor:", error);
    }
};

    useEffect(() => {
        fetchData();
        const incarcaZileIndisponibile = async () => {
            try {
                const res = await fetch(`http://localhost:3000/intervale-imprumut/${id}`);
                const data = await res.json();
    
                const toateZilele = [];
    
                data.forEach(imprumut => {
                    const start = new Date(imprumut.data_imprumut);
                    const end = new Date(imprumut.data_returnare);
                    const zile = [];
    
                    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                        zile.push(new Date(d).toISOString().slice(0, 10));
                    }
    
                    toateZilele.push(...zile);
                });
    
                setZileIndisponibile(toateZilele);
            } catch (error) {
                console.error("Eroare la încărcarea zilelor indisponibile:", error);
            }
        };
    
        if (showPopupImprumut) {
            incarcaZileIndisponibile();
        }
    }, [showPopupImprumut, id]);

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
                {"☆".repeat(emptyStars)}
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
                setMesajFavorit(data.message || (esteFavorita ? "Carte eliminată din favorite!" : "Carte adăugată la favorite!"));
                setAfiseazaMesajFavorit(true);
                setTimeout(() => setAfiseazaMesajFavorit(false), 3000);
            }
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

    const handleConfirmImprumut = async () => {
        if (!startDate || !endDate) {
            setMesajImprumut("Selectează ambele date!");
            afiseazaPopupTemporar();
            return;
        }
    
        // verificăm dacă se suprapune
        const suprapunere = zileIndisponibile.some(date => {
            return date >= startDate && date <= endDate;
        });
    
        if (suprapunere) {
            setMesajImprumut("Date selectate indisponibile!");
            afiseazaPopupTemporar();
            return;
        }
    
        // trimite request la server
        try {
            const res = await fetch("http://localhost:3000/creeaza-imprumut", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    utilizator_id: parseInt(utilizator_id),
                    carte_id: parseInt(id),
                    dataStart: startDate,
                    dataEnd: endDate
                })
            });
    
            const data = await res.json();
    
            setMesajImprumut(data.message);
            afiseazaPopupTemporar();
            setShowPopupImprumut(false);
            setStartDate("");
            setEndDate("");
        } catch (err) {
            setMesajImprumut("Eroare la trimiterea împrumutului!");
            afiseazaPopupTemporar();
        }
    };
    
    const afiseazaPopupTemporar = () => {
        setAfiseazaMesajImprumut(true);
        setTimeout(() => setAfiseazaMesajImprumut(false), 3000);
    };

    return (
        <div className="detalii-container">
            {/* ======= Header fixat sus ======= */}
            <header className="header">
                <div className="nav-buttons">
                    <button className="nav-button" onClick={() => navigate("/client")}>Explorează</button>
                    <button className="nav-button">Recomandate</button>
                    <button className="nav-button" onClick={() => navigate("/imprumuturi-curente")}>Împrumuturi curente</button>
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

            <div className="detalii-carte">
                <img
                    src={esteFavorita ? "/images/full_heart.png" : "/images/empy_heart.png"}
                    alt="Favorite"
                    className="icon-favorite"
                    onClick={handleFavorite}
                />
                <div className="detalii-text">
                    <h2>{carte.titlu}</h2>
                    <p><strong>Autor:</strong> {carte.autor}</p>
                    <p><strong>An publicare:</strong> {carte.an_publicatie}</p>
                    <p><strong>Gen:</strong> {carte.gen}</p>
                    <p><strong>Descriere:</strong> {carte.descriere}</p>
                    <p><strong>Rating:</strong> {renderStars(ratingMediu)} ({ratingMediu}/5)</p>

                    <button className="btn-recenzie" onClick={() => setShowPopup(true)}>Lasă o recenzie</button>
                    <button className="btnImprumuta" onClick={() => setShowPopupImprumut(true)}>Împrumută</button>
                    
                </div>
                <div className="detalii-imagine">
                    <img
                    src={
                        carte.imagine
                        ? (carte.imagine.startsWith("/uploads")
                            ? `http://localhost:3000${carte.imagine}`
                            : carte.imagine)
                        : "/images/default-book.png"
                    }
                    alt={carte.titlu}
                    className="coperta-mare"
                    />
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

            {afiseazaMesajFavorit && (
                <div className="floating-success">
                    {mesajFavorit}
                </div>
            )}

            {afiseazaMesajImprumut && (
            <div className={mesajImprumut.includes("succes") ? "floating-success" : "floating-error"}>
                {mesajImprumut}
            </div>
            )}
        {/*  */}
        {showPopupImprumut && (
        <div className="popup-imprumut">
            <div className="popup-content">
                <h3>Rezervare carte</h3>
                <label>De la:</label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />

                <label>Până la:</label>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />

                <div className="butoane-popup">
                    <button id="btnConfirmaImprumut" onClick={handleConfirmImprumut}>Confirmă</button>
                    <button id="btnAnuleazaImprumut" onClick={() => setShowPopupImprumut(false)}>Anulează</button>
                </div>

                <p className="info-indisponibil">Date indisponibile: {zileIndisponibile.length ? zileIndisponibile.join(", ") : "None"}</p>
            </div>
        </div>
    )}
    {/*  */}
        </div>
    );
}

export default DetaliiCarte;