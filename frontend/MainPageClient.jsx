import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Importă pentru navigare
import "./style.css";

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

    // Fetch date pentru cărți și utilizator
    useEffect(() => {
        // Obține cărțile
        fetch("http://localhost:3000/carti-cu-rating")
            .then((response) => response.json())
            .then((data) => setCarti(data))
            .catch((error) => console.error("Eroare la obținerea cărților:", error));

        // Obține informațiile utilizatorului din localStorage sau altă sursă
        const pozaProfil = localStorage.getItem("pozaProfil") || "/images/default-avatar.jpg"; // Setează o valoare implicită
        setUserData({ pozaProfil });
        // Setează numele și prenumele utilizatorului din localStorage
        const nume = localStorage.getItem("nume");
        const prenume = localStorage.getItem("prenume");
        setUser({ nume, prenume });
    }, []);

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
    const filteredBooks = carti.filter((carte) =>
        carte.titlu.toLowerCase().includes(search.toLowerCase()) ||
        carte.autor.toLowerCase().includes(search.toLowerCase())
    );

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
                    <button className="nav-button">Explorează</button>
                    <button className="nav-button">Recomandate</button>
                    <button className="nav-button">Cărțile mele</button>
                    <button className="nav-button">Istoric</button>
                </div>

                <div className="right-buttons">
                     <p className="user-info">Bun venit, {user.nume} {user.prenume}!</p>
                    <button className="icon-button" onClick={() => navigate("/favorite")}>⭐</button>
                    <img
                        src={userData.pozaProfil && userData.pozaProfil !== "" ? userData.pozaProfil : "/images/default-avatar.jpg"} // Folosim o imagine implicită dacă poza nu există
                        alt="Poza de profil"
                        className="profile-img-small" // Aplicăm stilul pentru poza mică și rotundă
                        onClick={() => navigate("/profil-client")}
                    />
                </div>
            </header>

            {/* ======= Căutare ======= */}
            <div className="search-container">
                <input className="search-bar" type="text" placeholder="🔍 Căutare"
                    value={search} onChange={(e) => setSearch(e.target.value)}
                />
                <button className="filter-button">🔽</button>
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
                                <img src={carte.imagine} alt={carte.titlu} className="book-image" />
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