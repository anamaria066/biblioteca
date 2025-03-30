import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./style.css";

function Exemplare() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [exemplare, setExemplare] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCarteId, setSelectedCarteId] = useState(id);
    const [carte, setCarte] = useState(null);
    const [loading, setLoading] = useState(true);
    const [menuOpen, setMenuOpen] = useState(false);
    const [user, setUser] = useState({
        nume: "",
        prenume: ""
    });

    // Funcție pentru a încărca exemplarele și datele cărții
    const fetchData = async () => {
        try {
            // Obține exemplarele pentru cartea respectivă
            
            const exemplareRes = await fetch(`http://localhost:3000/exemplare/${selectedCarteId}`);
            const exemplareData = await exemplareRes.json();
            
            setExemplare(exemplareData);

            // Obține informațiile despre carte
            const carteRes = await fetch(`http://localhost:3000/carte/${selectedCarteId}`);
            const carteData = await carteRes.json();
            setCarte(carteData);

            setLoading(false);
        } catch (error) {
            console.error("Eroare la încărcarea datelor:", error);
        }
    };

    useEffect(() => {
        fetchData();
        // Setează numele și prenumele utilizatorului din localStorage
        const nume = localStorage.getItem("nume");
        const prenume = localStorage.getItem("prenume");
        setUser({ nume, prenume });
    }, [selectedCarteId]);



    // Dacă datele sunt încărcate
    if (loading) {
        return <p>Se încarcă...</p>;
    }

    return (
        <div className="exemplare-container">
            {/* ======= HEADER ======= */}
            <header className="header">
                <div className="nav-buttons">
                    {/* Butoane de navigare */}
                    <button className="nav-button" onClick={() => navigate("/admin")}>Pagina Principală</button>
                    <button className="nav-button" onClick={() => navigate("/carti")}>Cărți</button>
                    <button className="nav-button" onClick={() => navigate("/utilizatori")}>Utilizatori</button>
                    <button className="nav-button" onClick={() => navigate("/inregistreaza-imprumut")}>Înregistrează Împrumut</button>
                    <div className="dropdown">
                        {/* Meniul dropdown */}
                        <button className="nav-button" onClick={() => {
                            setMenuOpen(!menuOpen);
                        }}>
                            Adaugă...
                        </button>
                        {menuOpen && (
                            <div className="dropdown-menu show">
                                <button className="dropdown-item">Cheltuială</button>
                                <button className="dropdown-item">Carte</button>
                            </div>
                        )}
                    </div>
                </div>
                <div className="right-buttons">
                    <p className="user-info">Bun venit, {user.nume} {user.prenume}!</p>
                    <img
                        src={user.pozaProfil || "/images/default-avatar.jpg"}  // Dacă nu există poza de profil, se va folosi una implicită
                        alt="Poza de profil"
                        className="profile-img-small" // Aplicăm stilul pentru poza mică și rotundă
                        onClick={() => navigate("/profil-admin")}
                    />
                </div>
            </header>

            {/* Tabelul cu exemplare */}
            <div className="exemplare-content">
                <h2>Exemplare pentru cartea: {carte ? carte.titlu : 'Se încarcă...'}</h2>

                {/* Tabelul cu exemplarele */}
                <table className="exemplare-table">
                    <thead>
                        <tr>
                            <th>ID Exemplar</th>
                            <th>Stare</th>
                            <th>Cost Achiziție</th>
                            <th>Status Disponibilitate</th>
                        </tr>
                    </thead>
                    <tbody>
                        {exemplare.length === 0 ? (
                            <tr>
                                <td colSpan="4">Nu există exemplare pentru această carte.</td>
                            </tr>
                        ) : (
                            exemplare.map((exemplar) => (
                                <tr key={exemplar.id}>
                                    <td>{exemplar.id}</td>
                                    <td>{exemplar.stare}</td>
                                    <td>{exemplar.cost_achizitie} RON</td>
                                    <td>{exemplar.status_disponibilitate}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Exemplare;