import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./aspect/IstoricImprumuturiAdmin.css";
import HeaderAdmin from "./HeaderAdmin";

function IstoricImprumuturiAdmin() {
  const navigate = useNavigate();
  const [imprumuturi, setImprumuturi] = useState([]);
  const [user, setUser] = useState({
    nume: "",
    prenume: "",
    pozaProfil: "",
  });
  const [menuOpen, setMenuOpen] = useState(null);

  useEffect(() => {
    fetch("http://localhost:3000/imprumuturi-incheiate") // Endpoint-ul pentru împrumuturi încheiate
      .then((res) => res.json())
      .then((data) => setImprumuturi(data))
      .catch((error) =>
        console.error("Eroare la încărcarea istoricului:", error)
      );

    const userId = localStorage.getItem("utilizator_id");
    if (userId) {
      fetch(`http://localhost:3000/profil/${userId}`)
        .then((res) => res.json())
        .then((data) => {
          setUser({
            nume: data.nume,
            prenume: data.prenume,
            pozaProfil: data.pozaProfil || "/images/default-avatar.jpg",
          });
        })
        .catch((err) => console.error("Eroare profil:", err));
    }
  }, []);

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

  return (
    <div className="admin-container">
      {/* Header */}
      <HeaderAdmin />

      {/* Tabel */}
      <div className="user-table-container">
        <h2>Istoric Împrumuturi</h2>
        <table className="user-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Utilizator</th>
              <th>Email</th>
              <th>Carte</th>
              <th>Data Împrumut</th>
              <th>Data Returnare</th>
            </tr>
          </thead>
          <tbody>
            {imprumuturi.length === 0 ? (
              <tr>
                <td colSpan="6" className="empty-message">
                  Niciun împrumut finalizat
                </td>
              </tr>
            ) : (
              imprumuturi.map((imp, index) => (
                <tr key={imp.id}>
                  <td>{index + 1}</td>
                  <td>{imp.numeUtilizator}</td>
                  <td>{imp.emailUtilizator}</td>
                  <td>{imp.titluCarte}</td>
                  <td>{new Date(imp.dataImprumut).toLocaleDateString()}</td>
                  <td>{new Date(imp.dataReturnare).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default IstoricImprumuturiAdmin;
