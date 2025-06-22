import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../aspect/IstoricUtilizator.css";
import HeaderAdmin from "./HeaderAdmin";

function IstoricUtilizator() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [imprumuturi, setImprumuturi] = useState([]);
  const [paginaCurenta, setPaginaCurenta] = useState(1);
  const randuriPePagina = 10;

  useEffect(() => {
    fetch(`http://localhost:3000/istoric-utilizator/${id}`)
      .then((res) => res.json())
      .then((data) => setImprumuturi(data))
      .catch((err) =>
        console.error("Eroare la încărcarea istoricului utilizatorului:", err)
      );
  }, [id]);

  const totalPagini = Math.ceil(imprumuturi.length / randuriPePagina);
  const indexStart = (paginaCurenta - 1) * randuriPePagina;
  const imprumuturiAfisate = imprumuturi.slice(
    indexStart,
    indexStart + randuriPePagina
  );

  return (
    <div className="istoric-imprumuturi-admin-container">
      <HeaderAdmin />
      <div className="istoric-imprumuturi-admin-subcontainer">
        <h2>Istoric Împrumuturi Utilizator</h2>
        <table className="istoric-imp-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Nume</th>
              <th>Email</th>
              <th>Carte</th>
              <th>Data Împrumut</th>
              <th>Data Returnare</th>
              <th>Taxa de întârziere</th>
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
              imprumuturiAfisate.map((imp, index) => (
                <tr key={imp.id}>
                  <td>{indexStart + index + 1}</td>
                  <td>
                    {imp.numeUtilizator} {imp.prenumeUtilizator}
                  </td>
                  <td>{imp.emailUtilizator}</td>
                  <td>{imp.titluCarte}</td>
                  <td>{new Date(imp.dataImprumut).toLocaleDateString()}</td>
                  <td>{new Date(imp.dataReturnare).toLocaleDateString()}</td>
                  <td>{imp.taxa}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="pagination-container-istoric">
        {paginaCurenta > 1 && (
          <button
            className="pagination-prev"
            onClick={() => setPaginaCurenta(paginaCurenta - 1)}
          >
            &laquo;
          </button>
        )}

        {Array.from({ length: totalPagini }, (_, i) => i + 1)
          .filter((pagina) => {
            if (totalPagini <= 5) return true;
            if (
              pagina === 1 ||
              pagina === totalPagini ||
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

        {paginaCurenta < totalPagini && (
          <button
            className="pagination-next"
            onClick={() => setPaginaCurenta(paginaCurenta + 1)}
          >
            &raquo;
          </button>
        )}
      </div>
    </div>
  );
}

export default IstoricUtilizator;
