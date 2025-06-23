import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../aspect/Imprumuturi.css";
import HeaderAdmin from "./HeaderAdmin";

function Imprumuturi() {
  const navigate = useNavigate();
  const [imprumuturi, setImprumuturi] = useState([]);
  const [menuOpen, setMenuOpen] = useState(null);
  const [user, setUser] = useState({
    nume: "",
    prenume: "",
    pozaProfil: "",
  });
  const [paginaCurenta, setPaginaCurenta] = useState(1);
  const randuriPePagina = 10;
  const [showPopupCod, setShowPopupCod] = useState(false);
  const [codImprumut, setCodImprumut] = useState("");
  const [showPopupConfirmare, setShowPopupConfirmare] = useState(false);
  const [mesajEroareCod, setMesajEroareCod] = useState("");
  const [detaliiImprumut, setDetaliiImprumut] = useState(null);
  const [showPopupFinalizare, setShowPopupFinalizare] = useState(false);
  const [detaliiFinalizare, setDetaliiFinalizare] = useState(null);
  const [stareExemplar, setStareExemplar] = useState("bună");
  const [showPopupSucces, setShowPopupSucces] = useState(false);
  const [mesajSucces, setMesajSucces] = useState("");
  const [taxaIntarziere, setTaxaIntarziere] = useState(0);

  useEffect(() => {
    fetch("http://localhost:3000/imprumuturi")
      .then((res) => res.json())
      .then((data) => setImprumuturi(data))
      .catch((error) =>
        console.error("Eroare la încărcarea împrumuturilor:", error)
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
        .catch((err) => {
          console.error("Eroare la obținerea datelor utilizatorului:", err);
        });
    }
  }, []);

  const totalPagini = Math.ceil(imprumuturi.length / randuriPePagina);
  const indexStart = (paginaCurenta - 1) * randuriPePagina;
  const currentRows = imprumuturi.slice(
    indexStart,
    indexStart + randuriPePagina
  );

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

  const confirmaFinalizare = async () => {
    if (!detaliiFinalizare) return;

    try {
      await fetch(
        `http://localhost:3000/finalizeaza-returnare/${detaliiFinalizare.idImprumut}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            stareExemplar: stareExemplar, // 🔥 trimitem starea aleasă din dropdown
          }),
        }
      );

      // Dacă merge cu succes:
      setShowPopupFinalizare(false);
      setDetaliiFinalizare(null);
      setTaxaIntarziere(0);
      setStareExemplar("bună");

      setMesajSucces("Împrumut finalizat cu succes!");
      setShowPopupSucces(true);
      setTimeout(() => setShowPopupSucces(false), 3000);

      // Reîncărcăm împrumuturile
      fetch("http://localhost:3000/imprumuturi")
        .then((res) => res.json())
        .then((data) => setImprumuturi(data))
        .catch((error) =>
          console.error("Eroare la reîncărcare împrumuturi:", error)
        );
    } catch (error) {
      console.error("Eroare la finalizarea împrumutului:", error);
      alert("A apărut o eroare la finalizare!");
    }
  };

  return (
    <div className="imprumuturi-container">
      {/* ======= HEADER ======= */}
      <HeaderAdmin />

      {/* ======= TABEL ÎMPRUMUTURI ======= */}
      <div className="imprumuturi-subcontainer">
        <h2>Împrumuturi Active</h2>
        <table className="imprumuturi-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Utilizator</th>
              <th>Adresa e-mail</th>
              <th>Carte</th>
              <th>Data Împrumut</th>
              <th>Data Returnare</th>
              <th>Acțiune</th>
            </tr>
          </thead>
          <tbody>
            {currentRows.length === 0 ? (
              <tr className="empty-row">
                <td colSpan="7" className="empty-message">
                  Niciun împrumut activ
                </td>
              </tr>
            ) : (
              currentRows.map((imprumut, index) => (
                <tr
                  key={imprumut.id}
                  className={
                    new Date() > new Date(imprumut.dataReturnare)
                      ? "expired-row"
                      : ""
                  }
                >
                  <td>{indexStart + index + 1}</td>
                  <td>{imprumut.numeUtilizator}</td>
                  <td>{imprumut.emailUtilizator}</td>
                  <td>{imprumut.titluCarte}</td>
                  <td>
                    {new Date(imprumut.dataImprumut).toLocaleDateString()}
                  </td>
                  <td>
                    {new Date(imprumut.dataReturnare).toLocaleDateString()}
                  </td>
                  <td>
                    <button
                      id="btnFinalizeazaImprumut"
                      onClick={() => {
                        const azi = new Date();
                        const dataReturnare = new Date(imprumut.dataReturnare);

                        const aziNormalizat = new Date(
                          azi.getFullYear(),
                          azi.getMonth(),
                          azi.getDate()
                        );
                        const dataReturnareNormalizata = new Date(
                          dataReturnare.getFullYear(),
                          dataReturnare.getMonth(),
                          dataReturnare.getDate()
                        );

                        let taxa = 0;
                        if (aziNormalizat > dataReturnareNormalizata) {
                          const diffTime =
                            aziNormalizat - dataReturnareNormalizata;
                          const zileIntarziere = Math.ceil(
                            diffTime / (1000 * 60 * 60 * 24)
                          );
                          taxa = zileIntarziere * 5; // 5 lei pe zi
                        }

                        setDetaliiFinalizare({
                          idImprumut: imprumut.id,
                          exemplarId: imprumut.exemplarId,
                        });
                        setTaxaIntarziere(taxa);
                        setShowPopupFinalizare(true);
                      }}
                    >
                      Finalizează Împrumut
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="pagination-container-imprumuturi-admin">
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

      {/* ====== POPUP COD ÎMPRUMUT ====== */}
      {showPopupCod && (
        <div className="popup-overlay-cod">
          <div className="popup-content">
            <p>Introduceți cod împrumut:</p>
            <input
              id="inputCod"
              type="text"
              value={codImprumut}
              onChange={(e) => setCodImprumut(e.target.value)}
              maxLength={6}
            />
            <div className="popup-buttons">
              <button id="btnOkCod" onClick={verificaCod}>
                OK
              </button>
              <button
                id="btnAnuleazaCod"
                onClick={() => setShowPopupCod(false)}
              >
                Anulează
              </button>
            </div>
          </div>
          {mesajEroareCod && (
            <div className="floating-error">{mesajEroareCod}</div>
          )}
        </div>
      )}

      {/* ====== POPUP CONFIRMARE IMPRUMUT ====== */}
      {showPopupConfirmare && detaliiImprumut && (
        <div className="popup-overlay-confirmare">
          <div className="popup-content">
            <p>
              <strong>Cod corect!</strong>
            </p>
            <p>
              A se elibera cartea: <strong>{detaliiImprumut.titlu}</strong>,
              exemplarul ID <strong>{detaliiImprumut.exemplar_id}</strong>
            </p>
            <div className="popup-buttons">
              <button id="btnEfectuat" onClick={finalizeazaImprumut}>
                Efectuat
              </button>
              <button
                id="btnAnuleaza"
                onClick={() => setShowPopupConfirmare(false)}
              >
                Anulează
              </button>
            </div>
          </div>
        </div>
      )}

      {showPopupFinalizare && detaliiFinalizare && (
        <div className="popup-overlay-finalizare">
          <div className="finalizare-content">
            <h3>Selectează starea exemplarului returnat:</h3>
            <select
              value={stareExemplar}
              onChange={(e) => setStareExemplar(e.target.value)}
            >
              <option value="bună">Bună</option>
              <option value="deteriorată">Deteriorată</option>
              <option value="necesită înlocuire">Necesită înlocuire</option>
            </select>
            {taxaIntarziere > 0 && (
              <p
                style={{ marginTop: "10px", color: "red", fontWeight: "bold" }}
              >
                Taxa de întârziere: {taxaIntarziere} lei
              </p>
            )}
            <div className="popup-buttons">
              <button id="btnConfirmaFinalizare" onClick={confirmaFinalizare}>
                Confirmă
              </button>
              <button
                id="btnAnuleazaFinalizare"
                onClick={() => setShowPopupFinalizare(false)}
              >
                Anulează
              </button>
            </div>
          </div>
        </div>
      )}

      {showPopupSucces && (
        <div className="floating-success-finalizare">{mesajSucces}</div>
      )}
    </div>
  );
}

export default Imprumuturi;
