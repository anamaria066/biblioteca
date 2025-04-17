import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./style.css";

function ProfilAdmin() {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [userData, setUserData] = useState({
        nume: "",
        prenume: "",
        email: "",
        dataCreare: "",
        pozaProfil: "",
        numarRecenzii: 0
    });

    const [pozaSelectata, setPozaSelectata] = useState(null);
    const [previewPoza, setPreviewPoza] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [newName, setNewName] = useState("");
    const [newPrenume, setNewPrenume] = useState("");
    const [newEmail, setNewEmail] = useState("");
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [menuOpen, setMenuOpen] = useState(false);

    const userId = localStorage.getItem("utilizator_id");

    useEffect(() => {
        fetch(`http://localhost:3000/profil/${userId}`)
            .then(res => res.json())
            .then(data => {
                const dateParts = data.dataCreare?.split("T")[0].split("-");
                const formattedDataCreare = dateParts?.length === 3
                    ? `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`
                    : "Data necunoscută";

                setUserData({
                    nume: data.nume,
                    prenume: data.prenume,
                    email: data.email,
                    dataCreare: formattedDataCreare,
                    numarRecenzii: data.numarRecenzii,
                    pozaProfil: data.pozaProfil || "/images/default-avatar.jpg"
                });
            })
            .catch(error => {
                console.error("Eroare la obținerea datelor profilului:", error);
                setErrorMessage("Eroare la încărcarea datelor utilizatorului.");
            });
    }, [userId]);

    //temporar
    // useEffect(() => {
    //     if (previewPoza) {
    //         console.log("✅ previewPoza actualizat:", previewPoza);
    //     }
    // }, [previewPoza]);

    const handleEditProfile = () => {
        setIsEditing(true);
        setNewName(userData.nume);
        setNewPrenume(userData.prenume);
        setNewEmail(userData.email);
    };

    const handleSaveProfileChanges = () => {
        if (newName && newPrenume && newEmail) {
            setUserData(prev => ({
                ...prev,
                nume: newName,
                prenume: newPrenume,
                email: newEmail
            }));
            setIsEditing(false);
            localStorage.setItem("nume", newName);
            localStorage.setItem("prenume", newPrenume);
            localStorage.setItem("email", newEmail);
        } else {
            setErrorMessage("Toate câmpurile trebuie completate!");
        }
    };

    const handleChangePassword = () => {
        if (oldPassword === "parolaVeche") {
            localStorage.setItem("parola", newPassword);
            setIsChangingPassword(false);
            setErrorMessage("");
            alert("Parola a fost schimbată cu succes!");
        } else {
            setErrorMessage("Parola veche este greșită.");
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // console.log("Fișier selectat:", file.name);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewPoza(reader.result);
                setPozaSelectata(file);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSelectPoza = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleConfirmPoza = () => {
        const formData = new FormData();
        formData.append("poza", pozaSelectata);

        fetch(`http://localhost:3000/upload-poza/${userId}`, {
            method: "POST",
            body: formData
        })
            .then(res => res.json())
            .then(data => {
                if (data.pozaProfil) {
                    setUserData(prev => ({
                        ...prev,
                        pozaProfil: data.pozaProfil
                    }));
                    localStorage.setItem("pozaProfil", data.pozaProfil);
                }
                setPreviewPoza(null);
                setPozaSelectata(null);
            })
            .catch(err => console.error("Eroare la upload poză:", err));
    };

    const handleCancelPoza = () => {
        setPreviewPoza(null);
        setPozaSelectata(null);
    };

    const handleDeletePicture = () => {
        localStorage.removeItem("pozaProfil");
        setUserData(prev => ({
            ...prev,
            pozaProfil: "/images/default-avatar.jpg"
        }));
        alert("Poza a fost ștearsă!");
    };

    const handleCloseChangePassword = () => {
        setIsChangingPassword(false);
        setErrorMessage("");
    };

    const pozaAfisata = previewPoza
    ? previewPoza
    : userData.pozaProfil && userData.pozaProfil !== ""
        ? userData.pozaProfil.startsWith("/uploads")
            ? `http://localhost:3000${userData.pozaProfil}`
            : userData.pozaProfil
        : "/images/default-avatar.jpg";

    return (
        <div className="profil-container">
            {/* ======= HEADER ======= */}
            <header className="header">
                <div className="nav-buttons">
                    <button className="nav-button" onClick={() => navigate("/admin")}>Pagina Principală</button>
                    <button className="nav-button" onClick={() => navigate("/carti")}>Cărți</button>
                    <button className="nav-button" onClick={() => navigate("/utilizatori")}>Utilizatori</button>
                    <button className="nav-button" onClick={() => navigate("/inregistreaza-imprumut")}>Înregistrează Împrumut</button>
                    <div className="dropdown">
                        <button className="nav-button" onClick={() => setMenuOpen(!menuOpen)}>Adaugă...</button>
                        {menuOpen && (
                            <div className="dropdown-menu">
                                <button className="dropdown-item" onClick={() => navigate("/adauga-cheltuiala")}>Cheltuială</button>
                                <button className="dropdown-item" onClick={() => navigate("/adauga-carte")}>Carte</button>
                            </div>
                        )}
                    </div>
                </div>
                <div className="right-buttons">
                    <p className="user-info">Bun venit, {userData.nume} {userData.prenume}!</p>
                    <img
                        src={pozaAfisata}
                        alt="Poza de profil"
                        className="profile-img-small"
                        onClick={() => navigate("/profil-admin")}
                    />
                </div>
            </header>

            <div className="profil-content">
            <div className="poza-cu-butoane">
                <div className="profile-picture">
                    <img
                        src={pozaAfisata}
                        alt="Poza profil"
                        className="profile-img"
                    />
                </div>

                {previewPoza && (
                    <div className="butoane-previzualizare">
                        <button id="btnConfirmaPoza" onClick={handleConfirmPoza}>Confirmă poza</button>
                        <button id="btnAnuleazaPoza" onClick={handleCancelPoza}>Anulează</button>
                    </div>
                )}
            </div>
                <div className="profile-details">
                    <div className="informatii-basic">
                        <h2>{userData.nume} {userData.prenume}</h2>
                        <p>{userData.numarRecenzii} recenzii</p>
                        <p>{userData.email}</p>
                        <p>Cont creat la: {userData.dataCreare}</p>
                    </div>

                    {isEditing ? (
                        <>
                            <input
                                type="text"
                                value={newName}
                                onChange={e => setNewName(e.target.value)}
                                placeholder="Nume"
                            />
                            <input
                                type="text"
                                value={newPrenume}
                                onChange={e => setNewPrenume(e.target.value)}
                                placeholder="Prenume"
                            />
                            <input
                                type="email"
                                value={newEmail}
                                onChange={e => setNewEmail(e.target.value)}
                                placeholder="Email"
                            />
                            <button id="btnsalveazaModificarile" onClick={handleSaveProfileChanges}>
                                Salvează modificările
                            </button>
                        </>
                    ) : (
                        <>
                            <button id="btnEditProfil" onClick={handleEditProfile}>Editează profilul</button>
                            <button id="btnSchimbaParola" onClick={() => setIsChangingPassword(true)}>Schimbă parola</button>
                            <button id={userData.pozaProfil !== "/images/default-avatar.jpg" ? "btnSchimbaPoza" : "btnAdaugaPoza"} onClick={handleSelectPoza}>
                                {userData.pozaProfil !== "/images/default-avatar.jpg" ? "Schimbă poza" : "Adaugă poză"}
                            </button>
                            {userData.pozaProfil !== "/images/default-avatar.jpg" && (
                                <button id="btnStergePoza" onClick={handleDeletePicture}>Șterge poza</button>
                            )}
                            <button id="btnDelogare" onClick={() => {
                                localStorage.clear();
                                navigate("/", { replace: true });
                            }}>
                                Deloghează-te
                            </button>
                        </>
                    )}

                    <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        style={{ display: "none" }}
                        onChange={handleFileChange}
                    />
                </div>
            </div>

            {isChangingPassword && (
                <div className="popup-overlay">
                    <div className="popup">
                        <h3>Schimbă parola</h3>
                        <input
                            type="password"
                            placeholder="Parola veche"
                            value={oldPassword}
                            onChange={e => setOldPassword(e.target.value)}
                        />
                        <input
                            type="password"
                            placeholder="Parola nouă"
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                        />
                        <button onClick={handleChangePassword}>Confirmă schimbarea</button>
                        <button onClick={handleCloseChangePassword}>Anulează</button>
                        {errorMessage && <p className="error-message">{errorMessage}</p>}
                    </div>
                </div>
            )}
        </div>
    );
}

export default ProfilAdmin;