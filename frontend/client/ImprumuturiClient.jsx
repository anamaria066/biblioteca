import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../aspect/ImprumuturiClient.css";
import HeaderClient from "./HeaderClient";
import ChatWidget from "../chatbot/ChatWidget";

function ImprumuturiClient() {
  const navigate = useNavigate();
  const [cartiImprumutate, setCartiImprumutate] = useState([]);
  const [user, setUser] = useState({
    nume: "",
    prenume: "",
    pozaProfil: "",
  });
  const [showPopupConfirmare, setShowPopupConfirmare] = useState(false);
  const [idDeAnulat, setIdDeAnulat] = useState(null);
  const [showPopupSucces, setShowPopupSucces] = useState(false);
  const [showPopupPrelungire, setShowPopupPrelungire] = useState(false);
  const [imprumutSelectat, setImprumutSelectat] = useState(null);
  const [dataNouaFinal, setDataNouaFinal] = useState("");
  const [zileIndisponibile, setZileIndisponibile] = useState([]);
  const [mesajPrelungire, setMesajPrelungire] = useState("");
  const [succesPrelungire, setSuccesPrelungire] = useState(false);
  const [taxaCalculata, setTaxaCalculata] = useState(0);
  const [imprumutCuTaxa, setImprumutCuTaxa] = useState(null);
  const [paginaCurenta, setPaginaCurenta] = useState(1);
  const randuriPerPagina = 10;
  const [randSelectat, setRandSelectat] = useState(null);
  const dropdownRef = useRef(null);
  const [dropdownPosition, setDropdownPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const userId = localStorage.getItem("utilizator_id");

    if (userId) {
      // Obține datele utilizatorului
      fetch(`http://localhost:3000/profil/${userId}`)
        .then((res) => res.json())
        .then((data) => {
          setUser({
            nume: data.nume,
            prenume: data.prenume,
            pozaProfil: data.pozaProfil || "/images/default-avatar.jpg",
          });
        });

      // Obține împrumuturile curente
      fetch(`http://localhost:3000/imprumuturi-curente-utilizator/${userId}`)
        .then((res) => res.json())
        .then((data) => setCartiImprumutate(data))
        .catch((err) =>
          console.error("Eroare la încărcarea împrumuturilor:", err)
        );
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setRandSelectat(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Calculăm numărul total de pagini
  const numarTotalPagini = Math.ceil(
    cartiImprumutate.length / randuriPerPagina
  );

  // Selectăm cărțile pentru pagina curentă
  const indexStart = (paginaCurenta - 1) * randuriPerPagina;

  // Funcții pentru navigarea între pagini
  const paginaAnterioara = () => {
    if (paginaCurenta > 1) setPaginaCurenta(paginaCurenta - 1);
  };

  const paginaUrmatoare = () => {
    if (paginaCurenta < numarTotalPagini) setPaginaCurenta(paginaCurenta + 1);
  };

  const deschidePopupConfirmare = (id) => {
    setIdDeAnulat(id);
    setShowPopupConfirmare(true);
  };

  const anuleazaImprumut = async () => {
    try {
      const res = await fetch(
        `http://localhost:3000/anuleaza-imprumut/${idDeAnulat}`,
        {
          method: "DELETE",
        }
      );

      const data = await res.json();

      if (res.ok) {
        // reîncarcă lista de împrumuturi
        const userId = localStorage.getItem("utilizator_id");
        const updated = await fetch(
          `http://localhost:3000/imprumuturi-curente-utilizator/${userId}`
        );
        const json = await updated.json();
        setCartiImprumutate(json);

        // afișează succes
        setShowPopupConfirmare(false);
        setShowPopupSucces(true);
        setTimeout(() => setShowPopupSucces(false), 3000);
      } else {
        alert(data.message || "Eroare la anulare!");
      }
    } catch (err) {
      console.error("Eroare la anularea împrumutului:", err);
      alert("Eroare de rețea!");
    }
  };

  const inchidePopup = () => {
    setShowPopupConfirmare(false);
  };

  const deschidePopupPrelungire = async (imprumut) => {
    try {
      const res = await fetch(
        `http://localhost:3000/intervale-imprumut/${imprumut.exemplarId}`
      );
      const data = await res.json();

      const toateZilele = [];
      data.forEach((impr) => {
        if (impr.id !== imprumut.id) {
          const start = new Date(impr.data_imprumut);
          const end = new Date(impr.data_returnare);
          for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            toateZilele.push(new Date(d).toISOString().slice(0, 10));
          }
        }
      });

      setZileIndisponibile(toateZilele);
      setImprumutSelectat(imprumut);
      setDataNouaFinal(imprumut.dataReturnare.slice(0, 10));
      setShowPopupPrelungire(true);
    } catch (err) {
      console.error("Eroare la încărcarea zilelor ocupate:", err);
    }
  };

  const deschidePopupTaxa = (imprumut) => {
    const azi = new Date();
    const dataReturnare = new Date(imprumut.dataReturnare);

    const aziNormalizat = new Date(
      azi.getFullYear(),
      azi.getMonth(),
      azi.getDate()
    );
    const returnareNormalizata = new Date(
      dataReturnare.getFullYear(),
      dataReturnare.getMonth(),
      dataReturnare.getDate()
    );

    if (aziNormalizat > returnareNormalizata && imprumut.status === "activ") {
      const timeDiff = aziNormalizat.getTime() - returnareNormalizata.getTime();
      const diferentaZile = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
      const taxa = diferentaZile * 5;

      setImprumutCuTaxa({ ...imprumut, taxa });
    }
  };

  const confirmaPrelungire = async () => {
    const dataStart = imprumutSelectat.dataImprumut.slice(0, 10);
    const dataEnd = dataNouaFinal;

    if (dataEnd <= dataStart) {
      setMesajPrelungire("Data de sfârșit trebuie să fie după cea de început!");
      setSuccesPrelungire(false);
      return;
    }

    // ✅ Verificare durată maximă
    const startDateObj = new Date(dataStart);
    const endDateObj = new Date(dataEnd);
    const durataPrelungire = Math.ceil(
      (endDateObj - new Date(imprumutSelectat.dataReturnare)) /
        (1000 * 60 * 60 * 24)
    );

    if (durataPrelungire > 7) {
      setMesajPrelungire("Limita maxima de prelungire este 7 zile!");
      setSuccesPrelungire(false);
      return;
    }

    const suprapunere = zileIndisponibile.some(
      (date) => date >= dataStart && date <= dataEnd
    );
    if (suprapunere) {
      setMesajPrelungire("Interval indisponibil!");
      setSuccesPrelungire(false);
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:3000/modifica-imprumut/${imprumutSelectat.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data_returnare: dataEnd }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        setShowPopupPrelungire(false);
        setMesajPrelungire("Prelungire realizată cu succes!");
        setSuccesPrelungire(true);

        const userId = localStorage.getItem("utilizator_id");
        const updated = await fetch(
          `http://localhost:3000/imprumuturi-curente-utilizator/${userId}`
        );
        const json = await updated.json();
        setCartiImprumutate(json);

        setTimeout(() => setMesajPrelungire(""), 3000);
      } else {
        setMesajPrelungire(data.message || "Eroare la prelungire!");
        setSuccesPrelungire(false);
      }
    } catch (err) {
      console.error("Eroare la prelungire:", err);
      setMesajPrelungire("Eroare de rețea!");
      setSuccesPrelungire(false);
    }
  };

  const indexOfFirst = (paginaCurenta - 1) * randuriPerPagina;
  const indexOfLast = indexOfFirst + randuriPerPagina;
  const currentRows = cartiImprumutate.slice(indexOfFirst, indexOfLast);

  return (
    <div className="imprumuturile-mele-container">
      {/* ======= HEADER ======= */}
      <HeaderClient />

      {/* ======= TABEL CĂRȚI ÎMPRUMUTATE ======= */}
      <div className="imprumuturile-mele-subcontainer">
        <h2>Împrumuturile mele curente</h2>
        <table className="imprumuturi-curente-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Titlu</th>
              <th>Autor</th>
              <th>Data Împrumut</th>
              <th>Data Returnare</th>
              {currentRows.length > 0 && <th>Status</th>}
              {/* <th>Actiune</th> */}
            </tr>
          </thead>
          <tbody>
            {currentRows.length === 0 ? (
              <tr className="empty-row">
                <td colSpan="6" className="empty-message">
                  Nu aveți împrumuturi active sau în așteptare.
                </td>
              </tr>
            ) : (
              currentRows.map((carte, index) => (
                <tr
                  key={carte.id}
                  onClick={(e) => {
                    setRandSelectat(carte.id);
                    setDropdownPosition({ x: e.clientX, y: e.clientY });
                  }}
                  className={(() => {
                    const azi = new Date();
                    const dataReturnare = new Date(carte.dataReturnare);
                    const aziNormalizat = new Date(
                      azi.getFullYear(),
                      azi.getMonth(),
                      azi.getDate()
                    );
                    const returnareNormalizata = new Date(
                      dataReturnare.getFullYear(),
                      dataReturnare.getMonth(),
                      dataReturnare.getDate()
                    );

                    return aziNormalizat > returnareNormalizata &&
                      carte.status === "activ"
                      ? "expired-row"
                      : "";
                  })()}
                >
                  <td>{indexOfFirst + index + 1}</td>
                  <td>{carte.titlu}</td>
                  <td>{carte.autor}</td>
                  <td>{new Date(carte.dataImprumut).toLocaleDateString()}</td>
                  <td>{new Date(carte.dataReturnare).toLocaleDateString()}</td>
                  <td>{carte.status}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* POPUP CONFIRMARE ANULARE */}
        {showPopupConfirmare && (
          <div className="popup-overlay-confirmare">
            <div className="popup-confirmare-anulare">
              <p>Sunteți sigur că doriți anularea împrumutului?</p>
              <div className="popup-buttons-anulare">
                <button id="btnDa" onClick={anuleazaImprumut}>
                  DA
                </button>
                <button id="btnNu" onClick={inchidePopup}>
                  NU
                </button>
              </div>
            </div>
          </div>
        )}

        {/* POPUP SUCCES */}
        {showPopupSucces && (
          <div className="floating-success-anulare">
            Anulare efectuată cu succes!
          </div>
        )}

        {/* Navigare pagini */}
        <div className="pagination-container-imprumuturile-mele">
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
        {randSelectat && (
          <div
            ref={dropdownRef}
            className="dropdown-actiuni"
            style={{
              position: "absolute",
              top: dropdownPosition.y + window.scrollY,
              left: dropdownPosition.x,
              zIndex: 1000,
            }}
          >
            {(() => {
              const carte = currentRows.find((c) => c.id === randSelectat);
              if (!carte) return null;

              return (
                <>
                  {carte.status === "în așteptare" && (
                    <button onClick={() => deschidePopupConfirmare(carte.id)}>
                      Anulează
                    </button>
                  )}
                  {carte.status === "activ" &&
                    new Date() > new Date(carte.dataReturnare) && (
                      <button onClick={() => deschidePopupTaxa(carte)}>
                        Vezi taxa
                      </button>
                    )}
                  {carte.status === "activ" &&
                    new Date() <= new Date(carte.dataReturnare) && (
                      <button onClick={() => deschidePopupPrelungire(carte)}>
                        Prelungește
                      </button>
                    )}
                </>
              );
            })()}
          </div>
        )}
      </div>

      {showPopupPrelungire && (
        <div className="popup-prelungire">
          <div className="popup-content">
            <h3>Prelungire Împrumut</h3>
            <p>
              <strong>Data început:</strong>{" "}
              {imprumutSelectat.dataImprumut.slice(0, 10)}
            </p>
            <label>Noua dată de returnare:</label>
            <input
              type="date"
              value={dataNouaFinal}
              onChange={(e) => setDataNouaFinal(e.target.value)}
              min={imprumutSelectat.dataImprumut.slice(0, 10)}
            />
            <p className="info-indisponibil">
              Zile indisponibile:{" "}
              {zileIndisponibile.length ? zileIndisponibile.join(", ") : "None"}
            </p>
            <div className="popup-buttons">
              <button id="btnConfirmaPrelungire" onClick={confirmaPrelungire}>
                Confirmă
              </button>
              <button
                id="btnAnuleazaPrelungire"
                onClick={() => setShowPopupPrelungire(false)}
              >
                Anulează
              </button>
            </div>
          </div>
        </div>
      )}

      {mesajPrelungire && (
        <div
          className={
            succesPrelungire
              ? "floating-success-prelungire"
              : "floating-error-prelungire"
          }
        >
          {mesajPrelungire}
        </div>
      )}

      {imprumutCuTaxa && (
        <div
          className="popup-overlay-taxa"
          onClick={() => setImprumutCuTaxa(null)}
        >
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <h3>Împrumut expirat</h3>
            <p>
              Taxa de întârziere pentru <strong>{imprumutCuTaxa.titlu}</strong>:
              <br />
              <strong>{imprumutCuTaxa.taxa} lei</strong>
            </p>
            <p>A fi achitată la momentul returului!</p>
          </div>
        </div>
      )}
      <ChatWidget />
    </div>
  );
}

export default ImprumuturiClient;
