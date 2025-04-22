import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./style.css";
import { useLocation } from "react-router-dom";

function DetaliiCarteAdmin() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [carte, setCarte] = useState(null);
    const [recenzii, setRecenzii] = useState([]);
    const [showPopup, setShowPopup] = useState(false);
    const [mesaj, setMesaj] = useState("");
    const [menuOpen, setMenuOpen] = useState(false);
    const [user, setUser] = useState({
            nume: "",
            prenume: ""
        });

    const [showAddExemplarPopup, setShowAddExemplarPopup] = useState(false);
    const [stareExemplar, setStareExemplar] = useState("bună");
    const [costAchizitie, setCostAchizitie] = useState("");
    const [dataAchizitie, setDataAchizitie] = useState(new Date().toISOString().split("T")[0]); // format YYYY-MM-DD
    const [showExemplarSuccess, setShowExemplarSuccess] = useState(false);
    const [showEditSuccess, setShowEditSuccess] = useState(false);
    const location = useLocation();
    useEffect(() => {
        if (location.state?.showSuccessMessage) {
            setShowEditSuccess(true);
            const timer = setTimeout(() => setShowEditSuccess(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [location.state]);

    // Funcție pentru a încărca cartea și recenziile
    const fetchData = async () => {
        try {
            const carteRes = await fetch(`http://localhost:3000/carte/${id}`);
            const carteData = await carteRes.json();
            setCarte(carteData);

            const recenziiRes = await fetch(`http://localhost:3000/recenzii/${id}`);
            const recenziiData = await recenziiRes.json();
            setRecenzii(recenziiData);
        } catch (error) {
            console.error("Eroare la încărcarea datelor:", error);
        }
    };

    useEffect(() => {
        fetchData();

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
    }, [id]);

    // Șterge cartea
    const handleDelete = async () => {
        try {
            const response = await fetch(`http://localhost:3000/sterge-carte/${id}`, {
                method: "DELETE",
            });
            const data = await response.json();
            if (response.ok) {
                navigate("/carti", {
                    state: { showDeleteSuccess: true }
                });
            } else {
                setMesaj(data.message || "Eroare la ștergerea cărții!");
            }
        } catch (error) {
            console.error("Eroare la ștergerea cărții:", error);
            setMesaj("Eroare de rețea!");
        }
    };


    // Vezi exemplare
    const handleViewExemplare = () => {
        navigate(`/exemplare/${id}`); // Navighează la pagina cu exemplarele cărții
    };

    const confirmDelete = () => {
        setShowPopup(true); // Afișează pop-up-ul de confirmare
    };

    const cancelDelete = () => {
        setShowPopup(false); // Închide pop-up-ul fără a face nimic
    };

    if (!carte) {
        return <p>Se încarcă...</p>;
    }

    const handleAddExemplar = async () => {
        const cost = parseFloat(costAchizitie) || 0;
    
        try {
            const exemplarNou = {
                carte_id: id,
                stare: stareExemplar,
                cost_achizitie: cost,
                data_achizitie: new Date(dataAchizitie)
            };
    
            const response = await fetch("http://localhost:3000/adauga-exemplar", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(exemplarNou)
            });
    
            const data = await response.json();
    
            if (response.ok) {
                setShowAddExemplarPopup(false);
                setCostAchizitie("");
                setShowExemplarSuccess(true);
                setTimeout(() => setShowExemplarSuccess(false), 3000);
            } else {
                alert(data.message || "Eroare la adăugarea exemplarului.");
            }
        } catch (error) {
            console.error("Eroare la adăugare exemplar:", error);
            alert("Eroare de rețea!");
        }
    };

    return (
        <div className="detalii-container">
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

            <div className="detalii-carte">
                <div className="detalii-text">
                    <h2>{carte.titlu}</h2>
                    <p><strong>Autor:</strong> {carte.autor}</p>
                    <p><strong>An publicare:</strong> {carte.an_publicatie}</p>
                    <p><strong>Gen:</strong> {carte.gen}</p>
                    <p><strong>Descriere:</strong> {carte.descriere}</p>

                    {/* Butoane de gestionare */}
                    <button className="btnDelete" onClick={confirmDelete}>Șterge cartea</button>
                    <button className="btnEdit" onClick={() => navigate(`/editeaza-carte/${id}`)}>Editează</button>
                    <button className="btnExemplare" onClick={handleViewExemplare}>Vezi exemplare</button>
                    <button className="btnAdaugaExemplar" onClick={() => setShowAddExemplarPopup(true)}>Adaugă exemplar</button>
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

            {/* Pop-up pentru confirmarea ștergerii */}
            {showPopup && (
                <div className="confirm-modal">
                    <div className="modal-content">
                        <h3>Confirmați ștergerea cărții?</h3>
                        <p>Odată ștearsă, cartea nu va mai fi disponibilă!</p>
                        <button className="confirm-button" onClick={handleDelete}>Da, șterge cartea</button>
                        <button className="cancel-button" onClick={cancelDelete}>Anulează</button>
                    </div>
                </div>
            )}

            {/* Recenziile */}
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


            {/*  */}
            {showAddExemplarPopup && (
                <div className="popup-overlay">
                    <div className="popup">
                        <h3>Adaugă exemplar</h3>

                        <label>Stare:</label>
                        <select value={stareExemplar} onChange={(e) => setStareExemplar(e.target.value)}>
                            <option value="bună">bună</option>
                            <option value="deteriorată">deteriorată</option>
                            <option value="necesită înlocuire">necesită înlocuire</option>
                        </select>

                        <label>Cost achiziție:</label>
                        <input
                            type="number"
                            value={costAchizitie}
                            onChange={(e) => setCostAchizitie(e.target.value)}
                            placeholder="Ex: 45.00"
                        />
                        <label>Data achiziției:</label>
                        <input
                            type="date"
                            value={dataAchizitie}
                            onChange={(e) => setDataAchizitie(e.target.value)}
                        />

                        <div className="popup-buttons">
                            <button id="btnConfirmaExemplar" onClick={handleAddExemplar}>Confirmă</button>
                            <button id="btnAnuleazaExemplar" onClick={() => setShowAddExemplarPopup(false)}>Anulează</button>
                        </div>
                    </div>
                </div>
            )}
            {/*  */}
            
            {showExemplarSuccess && (
                <div className="floating-success">Exemplarul a fost adăugat cu succes!</div>
            )}

            {showEditSuccess && (
                <div className="floating-success">Modificări salvate!</div>
            )}

        </div>
    );
}

export default DetaliiCarteAdmin;