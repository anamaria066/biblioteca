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
    <div className="istoric-client-container">
      {/* ======= HEADER CLIENT ======= */}
      <HeaderClient />

      {/* ======= TABEL ISTORIC ÎMPRUMUTURI ======= */}
      <div className="istoric-client-subcontainer">
        <h2>Istoric Împrumuturi</h2>
        <table className="istoric-client-table">
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
        <div className="pagination-container-istoric">
          {paginaCurenta > 1 && (
            <button
              className="pagination-prev"
              onClick={() => setPaginaCurenta(paginaCurenta - 1)}
            >
              &laquo;
            </button>
          )}

          {Array.from(
            { length: Math.ceil(istoric.length / rowsPerPage) },
            (_, i) => i + 1
          )
            .filter((pagina) => {
              const total = Math.ceil(istoric.length / rowsPerPage);
              if (total <= 5) return true;
              if (
                pagina === 1 ||
                pagina === total ||
                Math.abs(pagina - paginaCurenta) <= 1
              )
                return true;
              if (pagina === paginaCurenta - 2 || pagina === paginaCurenta + 2)
                return "dots";
              return false;
            })
            .map((pagina, i, arr) => {
              if (pagina === "dots") {
                return (
                  <span key={`dots-${i}`} className="pagination-dots">
                    ...
                  </span>
                );
              }

              // Evită dublarea punctelor
              if (
                i > 0 &&
                typeof pagina === "number" &&
                typeof arr[i - 1] === "number" &&
                pagina - arr[i - 1] > 1
              ) {
                return (
                  <React.Fragment key={pagina}>
                    <span className="pagination-dots">...</span>
                    <button
                      className={`pagination-number ${
                        pagina === paginaCurenta ? "active" : ""
                      }`}
                      onClick={() => setPaginaCurenta(pagina)}
                    >
                      {pagina}
                    </button>
                  </React.Fragment>
                );
              }

              return (
                <button
                  key={pagina}
                  className={`pagination-number ${
                    pagina === paginaCurenta ? "active" : ""
                  }`}
                  onClick={() => setPaginaCurenta(pagina)}
                >
                  {pagina}
                </button>
              );
            })}

          {paginaCurenta < Math.ceil(istoric.length / rowsPerPage) && (
            <button
              className="pagination-next"
              onClick={() => setPaginaCurenta(paginaCurenta + 1)}
            >
              &raquo;
            </button>
          )}
        </div>
      </div>
      <ChatWidget />
    </div>
  );
}

export default Istoric;
