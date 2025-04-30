import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./style.css";

function AdaugaCarte() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [titlu, setTitlu] = useState("");
    const [autor, setAutor] = useState("");
    const [anPublicatie, setAnPublicatie] = useState("");
    const [descriere, setDescriere] = useState("");
    const [gen, setGen] = useState("Ficțiune");
    const [pret, setPret] = useState("");
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [successMessage, setSuccessMessage] = useState(false);
    const [menuOpen, setMenuOpen] = useState(null);
    const [showPopupCod, setShowPopupCod] = useState(false);
    const [codImprumut, setCodImprumut] = useState("");
    const [showPopupConfirmare, setShowPopupConfirmare] = useState(false);
    const [mesajEroareCod, setMesajEroareCod] = useState("");
    const [detaliiImprumut, setDetaliiImprumut] = useState(null);

    const [user, setUser] = useState({
        nume: "",
        prenume: "",
        pozaProfil: ""
    });

    useEffect(() => {
        const handleClickOutsideDropdown = (e) => {
            if (!e.target.closest('.dropdown') && !e.target.closest('.dropdown-menu')) {
                setMenuOpen(null); // Închide meniul
            }
        };
    
        document.addEventListener("mousedown", handleClickOutsideDropdown);
        return () => {
            document.removeEventListener("mousedown", handleClickOutsideDropdown);
        };
    }, []);

    useEffect(() => {
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
                .catch(err => console.error("Eroare la încărcarea datelor utilizatorului:", err));
        }
    }, []);

    const handleImageChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
        }
    };

    const handleConfirm = async () => {
        const formData = new FormData();
        formData.append("titlu", titlu);
        formData.append("autor", autor);
        formData.append("an_publicatie", anPublicatie);
        formData.append("descriere", descriere);
        formData.append("gen", gen);
        formData.append("pret", parseFloat(pret));
        if (file) {
            formData.append("imagine", file);
        }

        try {
            const res = await fetch("http://localhost:3000/adauga-carte-cu-upload", {
                method: "POST",
                body: formData
            });

            if (res.ok) {
                setSuccessMessage(true);
                setTimeout(() => {
                    setSuccessMessage(false);
                    navigate("/admin");
                }, 3000);
            } else {
                const data = await res.json();
                alert(data.message || "Eroare la adăugare.");
            }
        } catch (error) {
            console.error("Eroare:", error);
            alert("Eroare de rețea!");
        }
    };

    const handleCancel = () => {
        navigate("/admin");
    };

    const verificaCod = async () => {
        try {
            const res = await fetch(`http://localhost:3000/verifica-cod/${codImprumut}`);
            const data = await res.json();
    
            if (res.ok) {
                setDetaliiImprumut(data);
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
        <div className="adauga-carte-container">
            {/* ======= HEADER ======= */}
            <header className="header">
                <div className="nav-buttons">
                    <button className="nav-button" onClick={() => navigate("/admin")}>Pagina Principală</button>
                    <button className="nav-button" onClick={() => navigate("/carti")}>Cărți</button>
                    <button className="nav-button" onClick={() => navigate("/utilizatori")}>Utilizatori</button>
                    <div className="dropdown">
                    <button className="nav-button" onClick={() => setMenuOpen(menuOpen === 'imprumuturi' ? null : 'imprumuturi')}>
                        Împrumuturi...
                    </button>
                    {menuOpen === 'imprumuturi' && (
                        <div className="dropdown-menu show">
                        <button className="dropdown-item" onClick={() => navigate("/imprumuturi")}>Active</button>
                        <button className="dropdown-item" onClick={() => navigate("/istoric-imprumuturi")}>Istoric</button>
                        </div>
                    )}
                    </div>
                    <div className="dropdown">
                    <button className="nav-button" onClick={() => setMenuOpen(menuOpen === 'adauga' ? null : 'adauga')}>
                    Adaugă...
                </button>
                {menuOpen === 'adauga' && (
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

            {/* ======= FORMULAR ADĂUGARE ======= */}
            <div className="adauga-carte-content">
                <h2>Adaugă o carte nouă</h2>
                <div className="form-preview-wrapper">
                    {/* FORMULAR */}
                    <div className="formular">
                        <input type="text" placeholder="Titlu" value={titlu} onChange={e => setTitlu(e.target.value)} />
                        <input type="text" placeholder="Autor" value={autor} onChange={e => setAutor(e.target.value)} />
                        <input type="number" placeholder="An publicare" value={anPublicatie} onChange={e => setAnPublicatie(e.target.value)} />
                        <textarea placeholder="Descriere" value={descriere} onChange={e => setDescriere(e.target.value)} />
                        <select value={gen} onChange={e => setGen(e.target.value)}>
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
                        <input type="number" placeholder="Preț (RON)" value={pret} onChange={e => setPret(e.target.value)} />

                        <label>Alege imagine:</label>
                        <input type="file" accept="image/*" onChange={handleImageChange} />
                    </div>

                    {/* PREVIEW IMAGINE */}
                    <div className="preview-section">
                        <div className="preview-wrapper">
                            <img
                                src={preview || "/images/default-book.png"}
                                alt="Coperta"
                                className="preview-image-full"
                            />
                            {preview && (
                                <button
                                    className="remove-preview-btn"
                                    onClick={() => {
                                        setPreview(null);
                                        setFile(null);
                                    }}
                                    title="Șterge imaginea"
                                >
                                    X
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* BUTOANE */}
                <div className="form-buttons">
                    <button id="btnConfirmaCarte" onClick={handleConfirm}>Confirmă adăugare</button>
                    <button id="btnAnuleazaCarte" onClick={handleCancel}>Anulează</button>
                </div>
            </div>

            {successMessage && (
                <div className="floating-success">Carte adăugată cu succes!</div>
            )}

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

export default AdaugaCarte;