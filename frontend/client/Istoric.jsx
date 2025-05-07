import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../aspect/Istoric.css";
import HeaderClient from "./HeaderClient";
import ChatWidget from "../chatbot/ChatWidget";

function Istoric() {
  const [user, setUser] = useState({ nume: "", prenume: "", pozaProfil: "" });
  const [istoric, setIstoric] = useState([]);
  const [paginaCurenta, setPaginaCurenta] = useState(1);
  const navigate = useNavigate();
  const rowsPerPage = 10;

  useEffect(() => {
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
        });

      fetch(`http://localhost:3000/imprumuturi-utilizator/${userId}`)
        .then((res) => res.json())
        .then((data) => setIstoric(data))
        .catch((err) =>
          console.error("Eroare la încărcarea istoricului:", err)
        );
    }
  }, []);

  const indexOfLast = paginaCurenta * rowsPerPage;
  const indexOfFirst = indexOfLast - rowsPerPage;
  const currentRows = istoric.slice(indexOfFirst, indexOfLast);

  const nextPage = () => {
    if (paginaCurenta < Math.ceil(istoric.length / rowsPerPage)) {
      setPaginaCurenta((prev) => prev + 1);
    }
  };

  const prevPage = () => {
    if (paginaCurenta > 1) {
      setPaginaCurenta((prev) => prev - 1);
    }
  };

  return (
    <div className="admin-container">
      {/* ======= HEADER CLIENT ======= */}
      <HeaderClient />

      {/* ======= TABEL ISTORIC ÎMPRUMUTURI ======= */}
      <div className="user-table-container">
        <h2>Istoric Împrumuturi</h2>
        <table className="user-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Titlu</th>
              <th>Autor</th>
              <th>Data Împrumut</th>
              <th>Data Returnare</th>
            </tr>
          </thead>
          <tbody>
            {currentRows.length === 0 ? (
              <tr className="empty-row">
                <td colSpan="5" className="empty-message">
                  Nu există împrumuturi finalizate.
                </td>
              </tr>
            ) : (
              currentRows.map((carte, index) => (
                <tr key={carte.id}>
                  <td>{indexOfFirst + index + 1}</td>
                  <td>{carte.titlu}</td>
                  <td>{carte.autor}</td>
                  <td>{new Date(carte.dataImprumut).toLocaleDateString()}</td>
                  <td>{new Date(carte.dataReturnare).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Navigare paginare */}
        <div className="pagination">
          <button onClick={prevPage} disabled={paginaCurenta === 1}>
            ◀
          </button>
          <span>
            Pagina {paginaCurenta} din{" "}
            {Math.max(1, Math.ceil(istoric.length / rowsPerPage))}
          </span>
          <button
            onClick={nextPage}
            disabled={paginaCurenta === Math.ceil(istoric.length / rowsPerPage)}
          >
            ▶
          </button>
        </div>
      </div>
      <ChatWidget />
    </div>
  );
}

export default Istoric;
