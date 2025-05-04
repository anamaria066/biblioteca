import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./aspect/HeaderAdmin.css";

const HeaderAdmin = () => {
  const [user, setUser] = useState({
    nume: "",
    prenume: "",
    pozaProfil: "/images/default-avatar.jpg",
  });

  const [menuOpen, setMenuOpen] = useState(null);
  const [showPopupCod, setShowPopupCod] = useState(false);

  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userId = localStorage.getItem("utilizator_id");
    if (userId) {
      fetch(`http://localhost:3000/profil/${userId}`)
        .then((res) => res.json())
        .then((data) => {
          setUser({
            nume: data.nume,
            prenume: data.prenume,
            pozaProfil: data.pozaProfil
              ? data.pozaProfil.startsWith("/uploads")
                ? `http://localhost:3000${data.pozaProfil}`
                : data.pozaProfil
              : "/images/default-avatar.jpg",
          });
        })
        .catch((err) => console.error("Eroare la obținerea profilului:", err));
    }
  }, []);

  // 🔄 Închide meniul când se face click în afara dropdown-urilor
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setMenuOpen(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="header">
      <div className="nav-buttons" ref={dropdownRef}>
        <button className="nav-button" onClick={() => navigate("/admin")}>
          Pagina Principală
        </button>
        <button className="nav-button" onClick={() => navigate("/carti")}>
          Cărți
        </button>
        <button className="nav-button" onClick={() => navigate("/utilizatori")}>
          Utilizatori
        </button>

        <div className="dropdown">
          <button
            className="nav-button"
            onClick={() =>
              setMenuOpen(menuOpen === "imprumuturi" ? null : "imprumuturi")
            }
          >
            Împrumuturi...
          </button>
          {menuOpen === "imprumuturi" && (
            <div className="dropdown-menu show">
              <button
                className="dropdown-item"
                onClick={() => navigate("/imprumuturi")}
              >
                Active
              </button>
              <button
                className="dropdown-item"
                onClick={() => navigate("/istoric-imprumuturi")}
              >
                Istoric
              </button>
            </div>
          )}
        </div>

        <div className="dropdown">
          <button
            className="nav-button"
            onClick={() => setMenuOpen(menuOpen === "adauga" ? null : "adauga")}
          >
            Adaugă...
          </button>
          {menuOpen === "adauga" && (
            <div className="dropdown-menu show">
              <button
                className="dropdown-item"
                onClick={() => navigate("/adauga-carte")}
              >
                Carte
              </button>
              <button
                className="dropdown-item"
                onClick={() => setShowPopupCod(true)}
              >
                Împrumut
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="right-buttons">
        <p className="user-info">
          Bun venit, {user.nume} {user.prenume}!
        </p>
        <img
          src={user.pozaProfil}
          alt="Poza de profil"
          className="profile-img-small"
          onClick={() => navigate("/profil-admin")}
        />
      </div>

      {showPopupCod && (
        <div className="popup-overlay-cod">
          <div className="popup-content">
            <p>Introduceți cod împrumut:</p>
            <input
              id="inputCod"
              type="text"
              maxLength={6}
              placeholder="123456"
            />
            <div className="popup-buttons">
              <button id="btnOkCod">OK</button>
              <button
                id="btnAnuleazaCod"
                onClick={() => setShowPopupCod(false)}
              >
                Anulează
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default HeaderAdmin;
