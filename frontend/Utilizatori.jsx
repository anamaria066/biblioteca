import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./style.css";

function Utilizatori() {
    const navigate = useNavigate();
    const [utilizatori, setUtilizatori] = useState([]);
    const [menuOpen, setMenuOpen] = useState(false);
    const [user, setUser] = useState({
        nume: "",
        prenume: ""
    });
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null); // pentru a păstra ID-ul utilizatorului de șters
    const [currentPage, setCurrentPage] = useState(1);
    const usersPerPage = 10;
    const [showPopupCod, setShowPopupCod] = useState(false);
    const [codImprumut, setCodImprumut] = useState("");
    const [showPopupConfirmare, setShowPopupConfirmare] = useState(false);
    const [mesajEroareCod, setMesajEroareCod] = useState("");
    const [detaliiImprumut, setDetaliiImprumut] = useState(null);

    // Fetch utilizatori din baza de date
    useEffect(() => {
        fetch("http://localhost:3000/conturi")
            .then(res => res.json())
            .then(data => {
                setUtilizatori(data);
            })
            .catch(error => console.error("Eroare la încărcarea utilizatorilor:", error));

        // Setează datele utilizatorului
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

    // Funcție pentru ștergerea utilizatorului
    const handleDelete = (id) => {
        fetch(`http://localhost:3000/sterge-cont/${id}`, {
            method: 'DELETE',
        })
            .then(res => res.json())
            .then(data => {
                if (data.message === 'Cont șters cu succes!') {
                    const loggedInUserId = localStorage.getItem("utilizator_id");
    
                    // Dacă utilizatorul șters este cel logat
                    if (String(id) === loggedInUserId) {
                        localStorage.clear(); // curăță toate datele
                        navigate("/", { replace: true }); // redirect către pagina de start
                        return;
                    }
    
                    // Dacă e alt utilizator, actualizează lista
                    setUtilizatori(prevUtilizatori =>
                        prevUtilizatori.filter(utilizator => utilizator.id !== id)
                    );
                    setShowConfirmModal(false);
                } else {
                    alert("Eroare la ștergerea utilizatorului!");
                    setShowConfirmModal(false);
                }
            })
            .catch(error => {
                console.error("Eroare la ștergerea utilizatorului:", error);
            });
    };

    // Funcție pentru confirmarea ștergerii
    const confirmDelete = (id) => {
        setUserToDelete(id);
        setShowConfirmModal(true);
    };

    // Funcție pentru anularea ștergerii
    const cancelDelete = () => {
        setShowConfirmModal(false);
        setUserToDelete(null);
    };

    // Calculul utilizatorilor de afișat pe baza paginii curente
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = utilizatori.slice(indexOfFirstUser, indexOfLastUser);

    // Funcții de navigare între pagini
    const nextPage = () => {
        if (currentPage < Math.ceil(utilizatori.length / usersPerPage)) {
            setCurrentPage(prevPage => prevPage + 1);
        }
    };

    const prevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(prevPage => prevPage - 1);
        }
    };

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
                    {/* Butoane de navigare */}
                    <button className="nav-button" onClick={() => navigate("/admin")}>Pagina Principală</button>
                    <button className="nav-button" onClick={() => navigate("/carti")}>Cărți</button>
                    <button className="nav-button" onClick={() => navigate("/utilizatori")}>Utilizatori</button>
                    <button className="nav-button" onClick={() => navigate("/imprumuturi")}>Împrumuturi</button>
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

            {/* ======= TABEL UTILIZATORI ======= */}
            <div className="user-table-container">
                <h2>Lista Utilizatorilor</h2>
                <table className="user-table">
                    <thead>
                        <tr>
                            <th>Tip</th>
                            <th>Nume</th>
                            <th>Prenume</th>
                            <th>Adresă e-mail</th>
                            <th>Istoric</th>
                            <th>Șterge utilizator</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentUsers.map((utilizator) => (
                            <tr key={utilizator.id}>
                                <td>{utilizator.tip === "administrator" ? "Admin" : "Client"}</td>
                                <td>{utilizator.nume}</td>
                                <td>{utilizator.prenume}</td>
                                <td>{utilizator.email}</td>
                                <td>
                                    <button className="istoric-button" onClick={() => alert("Funcția de istoric nu este implementată.")}>
                                        Istoric
                                    </button>
                                </td>
                                <td>
                                    <button
                                        className="delete-button"
                                        onClick={() => confirmDelete(utilizator.id)}
                                    >
                                        Șterge utilizator
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal de confirmare pentru ștergerea utilizatorului */}
            {showConfirmModal && (
                <div className="confirm-modal">
                    <div className="modal-content">
                        <h3>Confirmă ștergerea utilizatorului</h3>
                        <p>Vrei să ștergi acest utilizator?</p>
                        <button className="confirm-button" onClick={() => handleDelete(userToDelete)}>
                            Da, șterge
                        </button>
                        <button className="cancel-button" onClick={cancelDelete}>
                            Anulează
                        </button>
                    </div>
                </div>
            )}

            {/* Butoane de navigare pentru pagini */}
            <div className="pagination">
                <button onClick={prevPage} disabled={currentPage === 1}>
                    ◀
                </button>
                <span>
                    Pagina {currentPage} din {Math.ceil(utilizatori.length / usersPerPage)}
                </span>
                <button onClick={nextPage} disabled={currentPage === Math.ceil(utilizatori.length / usersPerPage)}>
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

export default Utilizatori;