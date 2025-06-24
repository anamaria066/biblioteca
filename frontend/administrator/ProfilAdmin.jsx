import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../aspect/ProfilAdmin.css";
import HeaderAdmin from "./HeaderAdmin";

function ProfilAdmin() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [userData, setUserData] = useState({
    nume: "",
    prenume: "",
    email: "",
    dataCreare: "",
    pozaProfil: "",
    numarRecenzii: 0,
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
  const [menuOpen, setMenuOpen] = useState(null);
  const [pozaMareDropdownDeschis, setPozaMareDropdownDeschis] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showFloatingMessage, setShowFloatingMessage] = useState(false);
  const [showFloatingError, setShowFloatingError] = useState(false);
  const [floatingErrorMessage, setFloatingErrorMessage] = useState("");
  const [showPopupCod, setShowPopupCod] = useState(false);
  const [codImprumut, setCodImprumut] = useState("");
  const [showPopupConfirmare, setShowPopupConfirmare] = useState(false);
  const [mesajEroareCod, setMesajEroareCod] = useState("");
  const [detaliiImprumut, setDetaliiImprumut] = useState(null);
  const [showDeletePopup, setShowDeletePopup] = useState(false);

  const userId = localStorage.getItem("utilizator_id");

  useEffect(() => {
    fetch(`http://localhost:3000/profil/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        const dateParts = data.dataCreare?.split("T")[0].split("-");
        const formattedDataCreare =
          dateParts?.length === 3
            ? `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`
            : "Data necunoscută";

        setUserData({
          nume: data.nume,
          prenume: data.prenume,
          email: data.email,
          dataCreare: formattedDataCreare,
          numarRecenzii: data.numarRecenzii,
          pozaProfil: data.pozaProfil || "/images/default-avatar.jpg",
        });
      })
      .catch((error) => {
        console.error("Eroare la obținerea datelor profilului:", error);
        setErrorMessage("Eroare la încărcarea datelor utilizatorului.");
      });
  }, [userId]);

  //sa se inchida meniul dropdown din cadrul pozei de profil
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        !e.target.closest(".profile-img") &&
        !e.target.closest(".dropdown-poza-mare")
      ) {
        setPozaMareDropdownDeschis(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  //sa se inchida meniul dropdown din cadrul header-ului
  useEffect(() => {
    const handleClickOutsideDropdown = (e) => {
      if (
        !e.target.closest(".dropdown") &&
        !e.target.closest(".dropdown-menu")
      ) {
        setMenuOpen(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutsideDropdown);
    return () =>
      document.removeEventListener("mousedown", handleClickOutsideDropdown);
  }, []);

  const handleEditProfile = () => {
    setIsEditing(true);
    setNewName(userData.nume);
    setNewPrenume(userData.prenume);
    setNewEmail(userData.email);
  };

  const handleSaveProfileChanges = async () => {
    if (newName && newPrenume && newEmail) {
      try {
        const res = await fetch(
          `http://localhost:3000/modifica-profil/${userId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              nume: newName,
              prenume: newPrenume,
              email: newEmail,
            }),
          }
        );

        if (res.ok) {
          setUserData((prev) => ({
            ...prev,
            nume: newName,
            prenume: newPrenume,
            email: newEmail,
          }));
          localStorage.setItem("nume", newName);
          localStorage.setItem("prenume", newPrenume);
          localStorage.setItem("email", newEmail);
          setIsEditing(false);
          setShowFloatingMessage(true);
          setTimeout(() => setShowFloatingMessage(false), 3000);
        } else {
          const data = await res.json();
          alert(data.message || "Eroare la actualizare.");
        }
      } catch (err) {
        alert("Eroare de rețea.");
      }
    } else {
      setErrorMessage("Toate câmpurile trebuie completate!");
    }
  };

  const handleChangePassword = async () => {
    try {
      const res = await fetch(
        `http://localhost:3000/schimba-parola/${userId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            parolaVeche: oldPassword,
            parolaNoua: newPassword,
          }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        setIsChangingPassword(false);
        setOldPassword("");
        setNewPassword("");
        setShowFloatingMessage(true);
        setTimeout(() => setShowFloatingMessage(false), 3000);
      } else {
        setOldPassword("");
        setNewPassword("");
        setShowFloatingError(true);
        setFloatingErrorMessage(data.message || "Eroare la schimbarea parolei");
        setTimeout(() => setShowFloatingError(false), 3000);
      }
    } catch (err) {
      setFloatingErrorMessage("Eroare de rețea!");
      setShowFloatingError(true);
      setTimeout(() => setShowFloatingError(false), 3000);
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
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.pozaProfil) {
          setUserData((prev) => ({
            ...prev,
            pozaProfil: data.pozaProfil,
          }));
        }
        setPreviewPoza(null);
        setPozaSelectata(null);
      })
      .catch((err) => console.error("Eroare la upload poză:", err));
  };

  const handleCancelPoza = () => {
    setPreviewPoza(null);
    setPozaSelectata(null);
  };

  const handleDeletePicture = () => {
    localStorage.removeItem("pozaProfil");

    setPreviewPoza(null);
    setPozaSelectata(null);

    fetch(`http://localhost:3000/sterge-poza/${userId}`, {
      method: "POST",
    })
      .then((res) => res.json())
      .then(() => {
        setUserData((prev) => ({
          ...prev,
          pozaProfil: "",
        }));
        setPozaMareDropdownDeschis(false);
        setSuccessMessage("Poza de profil a fost ștearsă cu succes!");
        setShowSuccessPopup(true);
      })
      .catch((err) => {
        console.error("Eroare la ștergerea pozei din backend:", err);
      });
  };

  const handleCloseChangePassword = () => {
    setIsChangingPassword(false);
    setErrorMessage("");
    setOldPassword("");
    setNewPassword("");
  };

  const handleDeleteAccount = async () => {
    try {
      const res = await fetch(`http://localhost:3000/sterge-cont/${userId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        localStorage.clear();
        setShowDeletePopup(false);
        navigate("/", { state: { showDeletedMessage: true } });
      } else {
        const data = await res.json();
        alert(data.message || "Eroare la ștergerea contului.");
      }
    } catch (err) {
      console.error("Eroare la ștergerea contului:", err);
      alert("Eroare de rețea!");
    }
  };

  const verificaCod = async () => {
    try {
      const res = await fetch(
        `http://localhost:3000/verifica-cod/${codImprumut}`
      );
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
      const res = await fetch(
        `http://localhost:3000/finalizeaza-imprumut/${codImprumut}`,
        {
          method: "PUT",
        }
      );

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

  const pozaAfisata = previewPoza
    ? previewPoza
    : userData.pozaProfil && userData.pozaProfil !== ""
    ? userData.pozaProfil.startsWith("/uploads")
      ? `http://localhost:3000${userData.pozaProfil}`
      : userData.pozaProfil
    : "/images/default-avatar.jpg";

  return (
    <div className="profil-container-admin">
      {/* ======= HEADER ======= */}
      <HeaderAdmin />

      <div className="profil-content-admin">
        <div className="poza-cu-butoane">
          <div className="profile-picture-admin">
            <img
              src={pozaAfisata}
              alt="Poza profil"
              className="profile-img"
              onClick={() => {
                if (userData.pozaProfil !== "/images/default-avatar.jpg") {
                  setPozaMareDropdownDeschis((prev) => !prev);
                }
              }}
            />

            {pozaMareDropdownDeschis &&
              userData.pozaProfil !== "/images/default-avatar.jpg" && (
                <div className="dropdown-poza-admin">
                  <button onClick={handleSelectPoza}>Schimbă poza</button>
                  <button onClick={handleDeletePicture}>Șterge poza</button>
                </div>
              )}
          </div>

          {previewPoza && (
            <div className="butoane-previzualizare">
              <button id="btnConfirmaPoza" onClick={handleConfirmPoza}>
                Confirmă poza
              </button>
              <button id="btnAnuleazaPoza" onClick={handleCancelPoza}>
                Anulează
              </button>
            </div>
          )}
        </div>
        <div className="profile-details">
          <div className="informatii-basic">
            {isEditing ? (
              <>
                <input
                  id="inputNume"
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Nume"
                  className="input-edit"
                />
                <input
                  id="inputPrenume"
                  type="text"
                  value={newPrenume}
                  onChange={(e) => setNewPrenume(e.target.value)}
                  placeholder="Prenume"
                  className="input-edit"
                />
                <input
                  id="inputMail"
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="Email"
                  className="input-edit"
                />
                <p>Cont creat la: {userData.dataCreare}</p>
              </>
            ) : (
              <>
                <h2>
                  {userData.nume} {userData.prenume}
                </h2>
                <p>{userData.email}</p>
                <p>Cont creat la: {userData.dataCreare}</p>
              </>
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
        </div>

        <div className="zona-butoane-profil">
          {isEditing ? (
            <>
              <button
                id="btnsalveazaModificarile"
                onClick={handleSaveProfileChanges}
              >
                Salvează modificările
              </button>
              <button
                id="btnAnuleazaModificarile"
                onClick={() => setIsEditing(false)}
              >
                Anulează
              </button>
            </>
          ) : (
            <>
              <button id="btnEditProfil" onClick={handleEditProfile}>
                Editează profilul
              </button>
              <button
                id="btnSchimbaParola"
                onClick={() => setIsChangingPassword(true)}
              >
                Schimbă parola
              </button>
              <button
                id="btnDelogare"
                onClick={() => {
                  localStorage.clear();
                  navigate("/", { replace: true });
                }}
              >
                Deloghează-te
              </button>
              {pozaAfisata.includes("/images/default-avatar.jpg") &&
                !previewPoza && (
                  <button id="btnAdaugaPoza" onClick={handleSelectPoza}>
                    Adaugă poză
                  </button>
                )}
            </>
          )}

          <button id="btnStergeCont" onClick={() => setShowDeletePopup(true)}>
            Șterge cont
          </button>
        </div>
      </div>

      {isChangingPassword && (
        <div className="popup-overlay-schimba-parola">
          <div className="popup-schimba-parola">
            <h3>Schimbă parola</h3>
            <input
              type="password"
              placeholder="Parola veche"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
            />
            <input
              type="password"
              placeholder="Parola nouă"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <div className="popup-buttons-schimba-parola">
              <button
                id="btnConfirmaSchimbParola"
                onClick={handleChangePassword}
              >
                Confirmă schimbarea
              </button>
              <button
                id="btnAnuleazaSchimbParola"
                onClick={handleCloseChangePassword}
              >
                Anulează
              </button>
            </div>
            {errorMessage && <p className="error-message">{errorMessage}</p>}
          </div>
        </div>
      )}

      {showSuccessPopup && (
        <div className="popup-overlay">
          <div className="popup">
            <p>{successMessage}</p>
            <button
              id="confirmStergerePfp"
              onClick={() => setShowSuccessPopup(false)}
            >
              OK
            </button>
          </div>
        </div>
      )}

      {showFloatingMessage && (
        <div className="floating-success-modificare-profil">
          Modificări salvate!
        </div>
      )}
      {showFloatingMessage && (
        <div className="floating-success-modificare-profil">
          Parola schimbată cu succes!
        </div>
      )}

      {showFloatingError && (
        <div className="floating-error-modificare-profil">
          {floatingErrorMessage}
        </div>
      )}

      {showDeletePopup && (
        <div className="popup-overlay-stergere-cont">
          <div className="popup">
            <p>
              Confirmați ștergerea contului? Această acțiune este ireversibilă!
            </p>
            <button id="confirmaStergereCont" onClick={handleDeleteAccount}>
              Confirmă
            </button>
            <button
              id="anuleazaStergereCont"
              onClick={() => setShowDeletePopup(false)}
            >
              Anulează
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfilAdmin;
