import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../aspect/Recomandate.css";
import HeaderClient from "./HeaderClient";
import ChatWidget from "../chatbot/ChatWidget";

function Recomandate() {
  const [carti, setCarti] = useState([]);
  const [paginaCurenta, setPaginaCurenta] = useState(1);
  const cartiPerPagina = 12;
  const navigate = useNavigate();
  const [user, setUser] = useState({
    nume: "",
    prenume: "",
    pozaProfil: "",
  });

  useEffect(() => {
    const userId = localStorage.getItem("utilizator_id");

    if (userId) {
      // Obține profilul utilizatorului
      fetch(`http://localhost:3000/profil/${userId}`)
        .then((res) => res.json())
        .then((data) => {
          setUser({
            nume: data.nume,
            prenume: data.prenume,
            pozaProfil: data.pozaProfil || "/images/default-avatar.jpg",
          });
        });

      // Obține cărțile recomandate din DB
      fetch(`http://localhost:3000/recomandari-db/${userId}`)
        .then((res) => res.json())
        .then((data) => setCarti(data))
        .catch((err) =>
          console.error("Eroare la obținerea recomandărilor din DB:", err)
        );
    }
  }, []);

  const renderStars = (rating) => {
    const maxStars = 5;
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.3 && rating % 1 <= 0.7;
    const emptyStars = maxStars - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <span className="rating-stars-recomandate">
        {"★".repeat(fullStars)}
        {hasHalfStar && <span className="half-star-recomandate">★</span>}
        {"☆".repeat(emptyStars)}
      </span>
    );
  };

  const numarTotalPagini = Math.ceil(carti.length / cartiPerPagina);
  const indexStart = (paginaCurenta - 1) * cartiPerPagina;
  const cartiAfisate = carti.slice(indexStart, indexStart + cartiPerPagina);
  const spatiiGoale = cartiPerPagina - cartiAfisate.length;
  const cartiComplete = [...cartiAfisate, ...Array(spatiiGoale).fill(null)];
  const scorMaxim = Math.max(1, ...carti.map((c) => c?.scor || 0));

  const paginaAnterioara = () => {
    if (paginaCurenta > 1) setPaginaCurenta(paginaCurenta - 1);
  };

  const paginaUrmatoare = () => {
    if (paginaCurenta < numarTotalPagini) setPaginaCurenta(paginaCurenta + 1);
  };

  const handleClick = (id) => {
    navigate(`/detalii/${id}`);
  };

  return (
    <div className="main-container-recomandate">
      {/* ======= HEADER ======= */}
      <HeaderClient />

      <div className="titluRecomandate">Cărți recomandate pentru tine</div>

      <div className="book-grid-recomandate">
        {carti.length === 0 ? (
          <p className="lipsaFavorite">Nu am găsit recomandări momentan.</p>
        ) : (
          cartiComplete.map((carte, index) => (
            <div
              key={index}
              className={`book-card-recomandate ${carte ? "" : "hidden"}`}
              onClick={carte ? () => handleClick(carte.id) : null}
            >
              {carte && (
                <>
                  <img
                    src={
                      carte.imagine?.startsWith("/uploads")
                        ? `http://localhost:3000${carte.imagine}`
                        : carte.imagine
                    }
                    alt={carte.titlu}
                    className="book-image"
                  />
                  <p className="book-title-recomandate">
                    {carte.titlu} - {carte.autor}
                  </p>
                  <div className="book-spacer"></div>
                  <p className="book-rating">{renderStars(carte.rating)}</p>
                  <p className="book-score">
                    Compatibilitate:{" "}
                    {Math.round((carte.scor / scorMaxim) * 100)}%
                  </p>
                </>
              )}
            </div>
          ))
        )}
      </div>

      {/* ======= Paginare ======= */}
      <div className="pagination-container-recomandate">
        {paginaCurenta > 1 && (
          <button
            className="pagination-prev"
            onClick={() => setPaginaCurenta(paginaCurenta - 1)}
          >
            &laquo;
          </button>
        )}

        {Array.from({ length: numarTotalPagini }, (_, i) => i + 1)
          .filter((pagina) => {
            if (numarTotalPagini <= 5) return true;
            if (
              pagina === 1 ||
              pagina === numarTotalPagini ||
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

        {paginaCurenta < numarTotalPagini && (
          <button
            className="pagination-next"
            onClick={() => setPaginaCurenta(paginaCurenta + 1)}
          >
            &raquo;
          </button>
        )}
      </div>
      <ChatWidget />
    </div>
  );
}

export default Recomandate;
