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
    const [showPopupCod, setShowPopupCod] = useState(false);
    const [codImprumut, setCodImprumut] = useState("");
    const [showPopupConfirmare, setShowPopupConfirmare] = useState(false);
    const [mesajEroareCod, setMesajEroareCod] = useState("");
    const [detaliiImprumut, setDetaliiImprumut] = useState(null);

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

        const verificaCod = async () => {
            try {
                const res = await fetch(`http://localhost:3000/verifica-cod/${codImprumut}`);
                const data = await res.json();
        
                if (res.ok) {
                    setDetaliiImprumut(data); // conține titlu, exemplar_id etc.
                    setShowPopupCod(false);
                    setShowPopupConfirmare(true);
                } else {
                    setMesajEroareCod("Cod invalid!");
                    setTimeout(() => setMesajEroareCod(""), 3000);
                }
            } catch (err) {
                console.error("Eroare verificare cod:", err);
                setMesajEroareCod("Eroare de rețea!");
                setTimeout(() => setMesajEroareCod(""), 3000);
            }
        };
    
        const finalizeazaImprumut = async () => {
            try {
                const res = await fetch(`http://localhost:3000/finalizeaza-imprumut/${codImprumut}`, {
                    method: "PUT"
                });
        
                if (res.ok) {
                    setShowPopupConfirmare(false);
                    setCodImprumut("");
                    setDetaliiImprumut(null);
                } else {
                    alert("Eroare la activarea împrumutului!");
                }
            } catch (err) {
                console.error("Eroare activare:", err);
            }
        };
    

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
                                <button className="dropdown-item" onClick={() => setShowPopupCod(true)}>Împrumut</button>
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
                            <th>Adresa e-mail</th> 
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
                                <td>{imprumut.emailUtilizator}</td> 
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

            {/* ====== POPUP COD ÎMPRUMUT ====== */}
            {showPopupCod && (
                <div className="popup-overlay-cod">
                    <div className="popup-content">
                        <p>Introduceți cod împrumut:</p>
                        <input
                            id="inputCod"
                            type="text"
                            value={codImprumut}
                            onChange={(e) => setCodImprumut(e.target.value)}
                            maxLength={6}
                        />
                        <div className="popup-buttons">
                            <button id="btnOkCod" onClick={verificaCod}>OK</button>
                            <button id="btnAnuleazaCod" onClick={() => setShowPopupCod(false)}>Anulează</button>
                        </div>
                    </div>
                    {mesajEroareCod && (
                        <div className="floating-error">
                            {mesajEroareCod}
                        </div>
                    )}
                </div>
            )}

            {/* ====== POPUP CONFIRMARE IMPRUMUT ====== */}
            {showPopupConfirmare && detaliiImprumut && (
                <div className="popup-overlay-confirmare">
                    <div className="popup-content">
                        <p><strong>Cod corect!</strong></p>
                        <p>A se elibera cartea: <strong>{detaliiImprumut.titlu}</strong>, exemplarul ID <strong>{detaliiImprumut.exemplar_id}</strong></p>
                        <div className="popup-buttons">
                            <button id="btnEfectuat" onClick={finalizeazaImprumut}>Efectuat</button>
                            <button id="btnAnuleaza" onClick={() => setShowPopupConfirmare(false)}>Anulează</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Imprumuturi;