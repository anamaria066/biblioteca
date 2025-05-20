import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../aspect/HeaderClient.css"; // asigură-te că ai creat acest fișier

const HeaderClient = () => {
  const [user, setUser] = useState({
    nume: "",
    prenume: "",
    pozaProfil: "/images/default-avatar.jpg",
  });

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

  return (
    <header className="header-client">
      <div className="nav-buttons-client">
        <button
          className="nav-button-client"
          onClick={() => navigate("/client")}
        >
          Explorează
        </button>
        <button
          className="nav-button-client"
          onClick={() => navigate("/recomandate")}
        >
          Recomandate
        </button>
        <button
          className="nav-button-client"
          onClick={() => navigate("/imprumuturi-curente")}
        >
          Împrumuturi curente
        </button>
        <button
          className="nav-button-client"
          onClick={() => navigate("/istoric")}
        >
          Istoric
        </button>
      </div>

      <div className="right-buttons">
        <p className="user-info-client">
          Bun venit, {user.nume} {user.prenume}!
        </p>
        <img
          src="/images/white_bookmark.png"
          alt="Favorite"
          className="icon-button favorite-icon"
          onClick={() => navigate("/favorite")}
        />
        <img
          src={user.pozaProfil}
          alt="Poza de profil"
          className="profile-img-small-client"
          onClick={() => navigate("/profil-client")}
        />
      </div>
    </header>
  );
};

export default HeaderClient;
