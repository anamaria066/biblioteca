import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./style.css";

function ProfilAdmin() {
    const navigate = useNavigate();
    const [userData, setUserData] = useState({
        nume: "",
        prenume: "",
        email: "",
        dataCreare: "",
        pozaProfil: "",
        numarRecenzii: 0
    });
    const [isEditing, setIsEditing] = useState(false);
    const [newName, setNewName] = useState("");
    const [newPrenume, setNewPrenume] = useState("");
    const [newEmail, setNewEmail] = useState("");
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [menuOpen, setMenuOpen] = useState(false); // Adăugat useState pentru a gestiona meniul dropdown
    const userId = localStorage.getItem("utilizator_id"); // ID-ul utilizatorului

    useEffect(() => {
        // Preluăm informațiile utilizatorului din API
        fetch(`http://localhost:3000/profil/${userId}`)
            .then(res => res.json())
            .then(data => {
                // Log pentru a vedea exact ce returnează serverul
                console.log("Răspuns de la server:", data);
    
                // Verificăm ce conținem în dataCreare
                const dataCreare = data.dataCreare;
    
                let formattedDataCreare = "Data necunoscută";
    
                if (dataCreare) {
                    // Log pentru a verifica formatul datei
                    console.log("Data creării:", dataCreare);
    
                    // Verificăm dacă data este într-un format valid (de obicei: "2025-03-25T08:00:00Z")
                    const dateParts = dataCreare.split("T")[0].split("-"); // Obținem doar partea de dată (YYYY-MM-DD)
                    
                    if (dateParts.length === 3) {
                        // Extragem ziua, luna și anul
                        const [year, month, day] = dateParts;
    
                        // Formatăm data în DD/MM/YYYY
                        formattedDataCreare = `${day.padStart(2, "0")}/${month.padStart(2, "0")}/${year}`;
                    }
                }
    
                setUserData({
                    nume: data.nume,
                    prenume: data.prenume,
                    email: data.email,
                    dataCreare: formattedDataCreare, // Data formatată
                    numarRecenzii: data.numarRecenzii,
                    // Setează imaginea de profil doar dacă există, altfel folosește una implicită
                    pozaProfil: data.pozaProfil || "/images/default-avatar.jpg"
                });
            })
            .catch(error => {
                console.error("Eroare la obținerea datelor profilului:", error);
                setErrorMessage("Eroare la încărcarea datelor utilizatorului.");
            });
    }, [userId]);

    const handleEditProfile = () => {
        setIsEditing(true);
        setNewName(userData.nume);
        setNewPrenume(userData.prenume);
        setNewEmail(userData.email);
    };

    const handleSaveProfileChanges = () => {
        if (newName && newPrenume && newEmail) {
            setUserData(prevData => ({
                ...prevData,
                nume: newName,
                prenume: newPrenume,
                email: newEmail
            }));
            setIsEditing(false);
            // Poți salva în backend sau în localStorage modificările
            localStorage.setItem("nume", newName);
            localStorage.setItem("prenume", newPrenume);
            localStorage.setItem("email", newEmail);
        } else {
            setErrorMessage("Toate câmpurile trebuie completate!");
        }
    };

    const handleChangePassword = () => {
        if (oldPassword === "parolaVeche") { // Verifică parola veche (de exemplu, cu backend-ul)
            // Actualizează parola în backend sau localStorage
            localStorage.setItem("parola", newPassword); // Ex: actualizează parola
            setIsChangingPassword(false);
            setErrorMessage("");
            alert("Parola a fost schimbată cu succes!");
        } else {
            setErrorMessage("Parola veche este greșită.");
        }
    };

    const handleCloseChangePassword = () => {
        setIsChangingPassword(false);
        setErrorMessage("");
    };

    const handlePictureChange = () => {
        // Logica pentru a adăuga/șterge poza dintr-un folder local
        alert("Poza a fost schimbată!");
    };

    const handleDeletePicture = () => {
        // Logica pentru a șterge poza de profil
        localStorage.removeItem("pozaProfil");
        setUserData(prevData => ({
            ...prevData,
            pozaProfil: "/images/default-avatar.jpg" // Poza va fi resetată la una implicită
        }));
        alert("Poza a fost ștearsă!");
    };

    return (
        <div className="profil-container">
            {/* ======= HEADER ======= */}
            <header className="header">
                <div className="nav-buttons">
                    <button className="nav-button">Explorează</button>
                    <button className="nav-button">Recomandate</button>
                    <button className="nav-button">Cărțile mele</button>
                    <button className="nav-button">Istoric</button>
                </div>

                <div className="right-buttons">
                <p className="user-info">Bun venit, {userData.nume} {userData.prenume}!</p>
                <button className="icon-button" onClick={() => navigate("/favorite")}>⭐</button>
                <img
                        src={userData.pozaProfil || "/images/default-avatar.jpg"}  // Dacă nu există poza de profil, se va folosi una implicită
                        alt="Poza de profil"
                        className="profile-img-small" // Aplicăm stilul pentru poza mică și rotundă
                    />
                </div>
            </header>

            {/* ======= CONȚINUT PROFIIL ======= */}
            <div className="profil-content">
                    <div className="profile-picture">
                    <img
                        src={userData.pozaProfil && userData.pozaProfil !== "" ? userData.pozaProfil : "/images/default-avatar.jpg"}
                        alt="Poza profil"
                        className="profile-img"
                        onClick={() => alert("Schimbă sau șterge poza")}
                    />
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
                                <button onClick={handleSaveProfileChanges}>Salvează modificările</button>
                            </>
                        ) : (
                            <>
                                <button id="btnEditProfil" onClick={handleEditProfile}>Editează profilul</button>
                                <button id="btnSchimbaParola" onClick={() => setIsChangingPassword(true)}>Schimbă parola</button>
                                {userData.pozaProfil !== "/images/default-avatar.jpg" ? (
                                <>
                                    <button id="btnStergePoza" onClick={handleDeletePicture}>Șterge poza</button>
                                    <button id="btnSchimbaPoza" onClick={handlePictureChange}>Schimbă poza</button>
                                </>
                            ) : (
                                <button id="btnAdaugaPoza" onClick={handlePictureChange}>Adaugă poză</button>
                            )}
                            </>
                        )}
                    </div>
            </div>

            {/* ======= POPUP REAL pentru schimbarea parolei (fereastra flotantă) ======= */}
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