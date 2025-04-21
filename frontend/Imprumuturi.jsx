import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./style.css";

function Imprumuturi() {
    const navigate = useNavigate();
    const [imprumuturi, setImprumuturi] = useState([]);
    const [menuOpen, setMenuOpen] = useState(false);
    const [user, setUser] = useState({
        nume: "",
        prenume: "",
        pozaProfil: ""
    });
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10;

    useEffect(() => {
        fetch("http://localhost:3000/imprumuturi")
            .then(res => res.json())
            .then(data => setImprumuturi(data))
            .catch(error => console.error("Eroare la încărcarea împrumuturilor:", error));

            const userId = localStorage.getItem("utilizator_id");
            if (userId) {
                fetch(`http://localhost:3000/profil/${userId}`)
                    .then(res => res.json())
                    .then(data => {
                        setUser({
                            nume: data.nume,
                            prenume: data.prenume,
                            pozaProfil: data.pozaProfil || "/images/default-avatar.jpg"
                        });
                    })
                    .catch(err => {
                        console.error("Eroare la obținerea datelor utilizatorului:", err);
                    });
            }
    }, []);

    const indexOfLast = currentPage * rowsPerPage;
    const indexOfFirst = indexOfLast - rowsPerPage;
    const currentRows = imprumuturi.slice(indexOfFirst, indexOfLast);

    const nextPage = () => {
        if (currentPage < Math.ceil(imprumuturi.length / rowsPerPage)) {
            setCurrentPage(prevPage => prevPage + 1);
        }
    };

    const prevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(prevPage => prevPage - 1);
        }
    };

    //sa se inchida meniul dropdown din cadrul header-ului
          useEffect(() => {
            const handleClickOutsideDropdown = (e) => {
                if (!e.target.closest('.dropdown') && !e.target.closest('.dropdown-menu')) {
                    setMenuOpen(false);
                }
            };
            document.addEventListener("mousedown", handleClickOutsideDropdown);
            return () => document.removeEventListener("mousedown", handleClickOutsideDropdown);
        }, []);

    return (
        <div className="admin-container">
            {/* ======= HEADER ======= */}
            <header className="header">
                <div className="nav-buttons">
                    <button className="nav-button" onClick={() => navigate("/admin")}>Pagina Principală</button>
                    <button className="nav-button" onClick={() => navigate("/carti")}>Cărți</button>
                    <button className="nav-button" onClick={() => navigate("/utilizatori")}>Utilizatori</button>
                    <button className="nav-button" onClick={() => navigate("/imprumuturi")}>Împrumuturi</button>
                    <div className="dropdown">
                        <button className="nav-button" onClick={() => setMenuOpen(!menuOpen)}>
                            Adaugă...
                        </button>
                        {menuOpen && (
                            <div className="dropdown-menu show">
                                <button className="dropdown-item">Cheltuială</button>
                                <button className="dropdown-item" onClick={() => navigate("/adauga-carte")}>Carte</button>
                            </div>
                        )}
                    </div>
                </div>
                <div className="right-buttons">
                    <p className="user-info">Bun venit, {user.nume} {user.prenume}!</p>
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
                    onClick={() => navigate("/profil-admin")}
                    />
                </div>
            </header>

            {/* ======= TABEL ÎMPRUMUTURI ======= */}
            <div className="user-table-container">
                <h2>Împrumuturi Active</h2>
                <table className="user-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Utilizator</th>
                            <th>Carte</th>
                            <th>Data Împrumut</th>
                            <th>Data Returnare</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentRows.length === 0 ? (
                            <tr className="empty-row">
                            <td colSpan="5" className="empty-message">
                                Niciun împrumut activ
                            </td>
                            </tr>
                        ) : (
                            currentRows.map((imprumut, index) => (
                            <tr key={imprumut.id}>
                                <td>{indexOfFirst + index + 1}</td>
                                <td>{imprumut.numeUtilizator}</td>
                                <td>{imprumut.titluCarte}</td>
                                <td>{new Date(imprumut.dataImprumut).toLocaleDateString()}</td>
                                <td>{new Date(imprumut.dataReturnare).toLocaleDateString()}</td>
                            </tr>
                            ))
                        )}
                        </tbody>
                </table>
            </div>

            {/* Buton de adăugare */}
            <button
                 className="btnInregistreazaImprumut"
                onClick={() => console.log("Butonul de adăugare a fost apăsat.")}>+</button>

            {/* Navigare pagini */}
            <div className="pagination">
                <button onClick={prevPage} disabled={currentPage === 1}>◀</button>
                <span>
                    Pagina {currentPage} din {Math.max(1, Math.ceil(imprumuturi.length / rowsPerPage))}
                </span>
                <button
                    onClick={nextPage}
                    disabled={currentPage === Math.max(1, Math.ceil(imprumuturi.length / rowsPerPage))}
                >
                    ▶
                </button>
            </div>
        </div>
    );
}

export default Imprumuturi;