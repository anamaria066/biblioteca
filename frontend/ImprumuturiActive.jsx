import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./style.css";

function ImprumuturiActive() {
    const navigate = useNavigate();
    const [cartiImprumutate, setCartiImprumutate] = useState([]);
    const [user, setUser] = useState({
        nume: "",
        prenume: "",
        pozaProfil: ""
    });

    // Paginare
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10;

    useEffect(() => {
        const userId = localStorage.getItem("utilizator_id");

        if (userId) {
            // Obține datele utilizatorului
            fetch(`http://localhost:3000/profil/${userId}`)
                .then(res => res.json())
                .then(data => {
                    setUser({
                        nume: data.nume,
                        prenume: data.prenume,
                        pozaProfil: data.pozaProfil || "/images/default-avatar.jpg"
                    });
                });

            // Obține împrumuturile curente
            fetch(`http://localhost:3000/imprumuturi-curente-utilizator/${userId}`)
                .then(res => res.json())
                .then(data => setCartiImprumutate(data))
                .catch(err => console.error("Eroare la încărcarea împrumuturilor:", err));
        }
    }, []);

    // Paginare logică
    const indexOfLast = currentPage * rowsPerPage;
    const indexOfFirst = indexOfLast - rowsPerPage;
    const currentRows = cartiImprumutate.slice(indexOfFirst, indexOfLast);

    const nextPage = () => {
        if (currentPage < Math.ceil(cartiImprumutate.length / rowsPerPage)) {
            setCurrentPage(prev => prev + 1);
        }
    };

    const prevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(prev => prev - 1);
        }
    };

    return (
        <div className="admin-container">
            {/* ======= HEADER ======= */}
            <header className="header">
                <div className="nav-buttons">
                    <button className="nav-button" onClick={() => navigate("/client")}>Explorează</button>
                    <button className="nav-button">Recomandate</button>
                    <button className="nav-button" onClick={() => navigate("/imprumuturi-active")}>Împrumuturi active</button>
                    <button className="nav-button" onClick={() => navigate("/istoric")}>Istoric</button>
                </div>

                <div className="right-buttons">
                     <p className="user-info">Bun venit, {user.nume} {user.prenume}!</p>
                    <button className="icon-button" onClick={() => navigate("/favorite")}>⭐</button>
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

            {/* ======= TABEL CĂRȚI ÎMPRUMUTATE ======= */}
            <div className="user-table-container">
                <h2>Împrumuturile mele active</h2>
                <table className="user-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Titlu</th>
                            <th>Autor</th>
                            <th>Data Împrumut</th>
                            <th>Data Returnare</th>
                            <th>Acțiune</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentRows.length === 0 ? (
                            <tr className="empty-row">
                                <td colSpan="6" className="empty-message">
                                    Nu ai cărți împrumutate momentan.
                                </td>
                            </tr>
                        ) : (
                            currentRows.map((carte, index) => (
                                <tr key={carte.id}>
                                    <td>{indexOfFirst + index + 1}</td>
                                    <td>{carte.titlu}</td>
                                    <td>{carte.autor}</td>
                                    <td>{new Date(carte.dataImprumut).toLocaleDateString()}</td>
                                    <td>{new Date(carte.dataReturnare).toLocaleDateString()}</td>
                                    <td>
                                        <button className="btnPrelungeste" onClick={() => console.log("Prelungire termen")}>
                                            Prelungește
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                {/* Navigare pagini */}
                <div className="pagination">
                    <button onClick={prevPage} disabled={currentPage === 1}>◀</button>
                    <span>
                        Pagina {currentPage} din {Math.max(1, Math.ceil(cartiImprumutate.length / rowsPerPage))}
                    </span>
                    <button
                        onClick={nextPage}
                        disabled={currentPage === Math.max(1, Math.ceil(cartiImprumutate.length / rowsPerPage))}
                    >
                        ▶
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ImprumuturiActive;