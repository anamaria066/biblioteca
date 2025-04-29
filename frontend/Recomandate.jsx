import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./style.css";

function Recomandate() {
    const [carti, setCarti] = useState([]);
    const [paginaCurenta, setPaginaCurenta] = useState(1);
    const cartiPerPagina = 12;
    const navigate = useNavigate();
    const [user, setUser] = useState({
        nume: "",
        prenume: "",
        pozaProfil: ""
    });

    useEffect(() => {
        const userId = localStorage.getItem("utilizator_id");

        if (userId) {
            // Obține profilul utilizatorului
            fetch(`http://localhost:3000/profil/${userId}`)
                .then(res => res.json())
                .then(data => {
                    setUser({
                        nume: data.nume,
                        prenume: data.prenume,
                        pozaProfil: data.pozaProfil || "/images/default-avatar.jpg"
                    });
                });

            // Obține cărțile recomandate
            fetch(`http://localhost:3000/recomandari/${userId}`)
                .then(res => res.json())
                .then(data => setCarti(data))
                .catch(err => console.error("Eroare la obținerea recomandărilor:", err));
        }
    }, []);

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

    const numarTotalPagini = Math.ceil(carti.length / cartiPerPagina);
    const indexStart = (paginaCurenta - 1) * cartiPerPagina;
    const cartiAfisate = carti.slice(indexStart, indexStart + cartiPerPagina);
    const spatiiGoale = cartiPerPagina - cartiAfisate.length;
    const cartiComplete = [...cartiAfisate, ...Array(spatiiGoale).fill(null)];

    const paginaAnterioara = () => {
        if (paginaCurenta > 1) setPaginaCurenta(paginaCurenta - 1);
    };

    const paginaUrmatoare = () => {
        if (paginaCurenta < numarTotalPagini) setPaginaCurenta(paginaCurenta + 1);
    };

    const handleClick = (id) => {
        navigate(`/detalii/${id}`);
    };

    return (
        <div className="main-container">
            {/* ======= HEADER ======= */}
            <header className="header">
                <div className="nav-buttons">
                    <button className="nav-button" onClick={() => navigate("/client")}>Explorează</button>
                    <button className="nav-button" onClick={() => navigate("/recomandate")}>Recomandate</button>
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
                            user.pozaProfil?.startsWith("/uploads")
                                ? `http://localhost:3000${user.pozaProfil}`
                                : user.pozaProfil || "/images/default-avatar.jpg"
                        }
                        alt="Poza de profil"
                        className="profile-img-small"
                        onClick={() => navigate("/profil-client")}
                    />
                </div>
            </header>

            <div className="titluRecomandate">Cărți recomandate pentru tine</div>

            <div className="book-grid">
                {carti.length === 0 ? (
                    <p className="lipsaFavorite">Nu am găsit recomandări momentan.</p>
                ) : (
                    cartiComplete.map((carte, index) => (
                        <div
                            key={index}
                            className={`book-card ${carte ? "" : "hidden"}`}
                            onClick={carte ? () => handleClick(carte.id) : null}
                        >
                            {carte && (
                                <>
                                    <img
                                        src={
                                            carte.imagine?.startsWith("/uploads")
                                                ? `http://localhost:3000${carte.imagine}`
                                                : carte.imagine
                                        }
                                        alt={carte.titlu}
                                        className="book-image"
                                    />
                                    <p className="book-title">{carte.titlu} - {carte.autor}</p>
                                    <p className="book-rating">{renderStars(carte.rating)}</p>
                                </>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* ======= Paginare ======= */}
            <div className="pagination-container">
                <button className="pagination-button" onClick={paginaAnterioara} disabled={paginaCurenta === 1}>
                    ◀
                </button>
                <span className="pagina-info">Pagina {paginaCurenta} din {numarTotalPagini}</span>
                <button className="pagination-button" onClick={paginaUrmatoare} disabled={paginaCurenta === numarTotalPagini}>
                    ▶
                </button>
            </div>
        </div>
    );
}

export default Recomandate;