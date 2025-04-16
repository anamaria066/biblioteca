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

    // Fetch utilizatori din baza de date
    useEffect(() => {
        fetch("http://localhost:3000/conturi")
            .then(res => res.json())
            .then(data => {
                setUtilizatori(data);
            })
            .catch(error => console.error("Eroare la încărcarea utilizatorilor:", error));

        // Setează numele și prenumele utilizatorului din localStorage
        const nume = localStorage.getItem("nume");
        const prenume = localStorage.getItem("prenume");
        setUser({ nume, prenume });
    }, []);

    // Funcție pentru ștergerea utilizatorului
    const handleDelete = (id) => {
        fetch(`http://localhost:3000/sterge-cont/${id}`, {
            method: 'DELETE',
        })
            .then(res => res.json())
            .then(data => {
                if (data.message === 'Cont șters cu succes!') {
                    // Reîncarcă utilizatorii
                    setUtilizatori(prevUtilizatori => prevUtilizatori.filter(utilizator => utilizator.id !== id));
                    setShowConfirmModal(false); // Închide pop-up-ul după ștergere
                } else {
                    alert("Eroare la ștergerea utilizatorului!");
                    setShowConfirmModal(false); // Închide pop-up-ul dacă există o eroare
                }
            })
            .catch(error => console.error("Eroare la ștergerea utilizatorului:", error));
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

            {/* ======= TABEL UTILIZATORI ======= */}
            <div className="user-table-container">
                <h2>Lista Utilizatorilor</h2>
                <table className="user-table">
                    <thead>
                        <tr>
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
        </div>
    );
}

export default Utilizatori;