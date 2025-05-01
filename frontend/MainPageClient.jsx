import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom"; // Importă pentru navigare
import "./aspect/MainPageClient.css";

function MainPageClient() {
    const [carti, setCarti] = useState([]);
    const [search, setSearch] = useState("");
    const [paginaCurenta, setPaginaCurenta] = useState(1);
    const cartiPerPagina = 12; // 2 rânduri x 6 coloane
    const [userData, setUserData] = useState({ pozaProfil: "" }); // Adaugă userData aici
    const navigate = useNavigate(); // Inițializează navigarea
    const [user, setUser] = useState({
            nume: "",
            prenume: ""
        });
    const [showFilterPopup, setShowFilterPopup] = useState(false);
    const [genSelectat, setGenSelectat] = useState("");
    const [anManual, setAnManual] = useState("");
    const [intervalSelectat, setIntervalSelectat] = useState("");
    const [filtruGen, setFiltruGen] = useState("");
    const [filtruAn, setFiltruAn] = useState("");
    const popupRef = useRef(null);
    const [filtruLimba, setFiltruLimba] = useState("");
    const [limbaSelectata, setLimbaSelectata] = useState("");

    // Fetch date pentru cărți și utilizator
    useEffect(() => {
        // Obține cărțile
        fetch("http://localhost:3000/carti-cu-rating")
            .then((response) => response.json())
            .then((data) => setCarti(data))
            .catch((error) => console.error("Eroare la obținerea cărților:", error));
    
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

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (popupRef.current && !popupRef.current.contains(event.target)) {
                setShowFilterPopup(false);
            }
        };
    
        if (showFilterPopup) {
            document.addEventListener("mousedown", handleClickOutside);
        }
    
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showFilterPopup]);

    // Funcție pentru generarea stelelor colorate în funcție de rating
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

    // Filtrare cărți după titlu sau autor
    const filteredBooks = carti.filter((carte) => {
        const matchesSearch =
            carte.titlu.toLowerCase().includes(search.toLowerCase()) ||
            carte.autor.toLowerCase().includes(search.toLowerCase());
    
        const matchesGen = filtruGen ? carte.gen === filtruGen : true;
        
        let matchesAn = true;
        const an = carte.an_publicatie;

        if (filtruAn?.type === "exact") {
            matchesAn = an === parseInt(filtruAn.value);
        } else if (filtruAn?.type === "interval") {
            switch (filtruAn.value) {
                case "lt1800": matchesAn = an < 1800; break;
                case "1800-1850": matchesAn = an >= 1800 && an <= 1850; break;
                case "1850-1900": matchesAn = an >= 1850 && an <= 1900; break;
                case "1900-1950": matchesAn = an >= 1900 && an <= 1950; break;
                case "1950-2000": matchesAn = an >= 1950 && an <= 2000; break;
                case "gt2000": matchesAn = an > 2000; break;
                default: matchesAn = true;
            }
        }

        const matchesLimba = filtruLimba ? carte.limba === filtruLimba : true;
    
        return matchesSearch && matchesGen && matchesAn && matchesLimba;
    });

    // Calculăm numărul total de pagini
    const numarTotalPagini = Math.ceil(filteredBooks.length / cartiPerPagina);

    // Selectăm cărțile pentru pagina curentă
    const indexStart = (paginaCurenta - 1) * cartiPerPagina;
    const cartiAfisate = filteredBooks.slice(indexStart, indexStart + cartiPerPagina);

    // Funcții pentru navigarea între pagini
    const paginaAnterioara = () => {
        if (paginaCurenta > 1) setPaginaCurenta(paginaCurenta - 1);
    };

    const paginaUrmatoare = () => {
        if (paginaCurenta < numarTotalPagini) setPaginaCurenta(paginaCurenta + 1);
    };

    // ✅ Funcție care redirecționează către pagina de detalii când se face click pe o carte
    const handleClick = (id) => {
        navigate(`/detalii/${id}`);
    };

    const spatiiGoale = cartiPerPagina - cartiAfisate.length;
    const cartiComplete = [...cartiAfisate, ...Array(spatiiGoale).fill(null)];

    return (
        <div className="main-container">
            {/* ======= Header fixat sus ======= */}
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

            {showFilterPopup && (
            <div className="popup-filtru" ref={popupRef}>
                <h4>Filtrează cărțile</h4>
                <select value={genSelectat} onChange={(e) => setGenSelectat(e.target.value)}>
                <option value="Ficțiune">Ficțiune</option>
                            <option value="Non-ficțiune">Non-ficțiune</option>
                            <option value="Poezie">Poezie</option>
                            <option value="Dezvoltare personală">Dezvoltare personală</option>
                            <option value="Copii">Copii</option>
                            <option value="Crimă">Crimă</option>
                            <option value="Mister">Mister</option>
                            <option value="Distopie">Distopie</option>
                            <option value="Aventură">Aventură</option>
                            <option value="Fantasy">Fantasy</option>
                            <option value="Psihologic">Psihologic</option>
                            <option value="Filosofie">Filosofie</option>
                            <option value="Economie">Economie</option>
                </select>

                <label>Limba:</label>
                <select value={limbaSelectata} onChange={(e) => setLimbaSelectata(e.target.value)}>
                    <option value="">Toate</option>
                    <option value="română">Română</option>
                    <option value="engleză">Engleză</option>
                    <option value="franceză">Franceză</option>
                </select>

                <label>An exact:</label>
                <input
                    type="number"
                    placeholder="Ex: 1999"
                    value={anManual}
                    onChange={(e) => setAnManual(e.target.value)}
                    className="input-an"
                />

                <label>Interval:</label>
                <select value={intervalSelectat} onChange={(e) => setIntervalSelectat(e.target.value)}>
                    <option value="">Selectează</option>
                    <option value="lt1800">&lt; 1800</option>
                    <option value="1800-1850">1800 - 1850</option>
                    <option value="1850-1900">1850 - 1900</option>
                    <option value="1900-1950">1900 - 1950</option>
                    <option value="1950-2000">1950 - 2000</option>
                    <option value="gt2000">&gt; 2000</option>
                </select>

                <div className="butoane-filtru">
                <button onClick={() => {
                    setFiltruGen(genSelectat);
                    setFiltruLimba(limbaSelectata);
                    if (anManual) {
                        setFiltruAn({ type: "exact", value: anManual });
                    } else if (intervalSelectat) {
                        setFiltruAn({ type: "interval", value: intervalSelectat });
                    } else {
                        setFiltruAn(null);
                    }
                    setPaginaCurenta(1); // Reset pagină la 1 dacă aplici filtre
                    setShowFilterPopup(false);
                }}>Aplică</button>

                <button onClick={() => {
                    setGenSelectat("");
                    setFiltruGen("");
                    setAnManual("");
                    setIntervalSelectat("");
                    setFiltruAn("");
                    setFiltruLimba("");
                    setLimbaSelectata("");  
                    setPaginaCurenta(1);
                    setShowFilterPopup(false);
                }}>Șterge</button>
            </div>
            </div>
        )}

            {/* ======= Căutare ======= */}
            <div className="search-container">
                <input className="search-bar" type="text" placeholder="🔍 Căutare"
                    value={search} onChange={(e) => setSearch(e.target.value)}
                />
                <img
                    src="/images/filter.png"
                    alt="Filtru"
                    className="filter-icon"
                    onClick={() => setShowFilterPopup(prev => !prev)}
                />
            </div>

            {/* ======= Afișarea cărților ======= */}
            <div className="book-grid">
                {cartiComplete.map((carte, index) => (
                    <div 
                        className={`book-card ${carte ? "" : "hidden"}`} 
                        key={index} 
                        onClick={carte ? () => handleClick(carte.id) : null} // Asigură clic doar pe cărți valide
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
                ))}
            </div>

            {/* ======= Butoane pentru paginare ======= */}
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

export default MainPageClient;