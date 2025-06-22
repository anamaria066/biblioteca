import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import HeaderAdmin from "./HeaderAdmin";

import "../aspect/Exemplare.css";

function Exemplare() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exemplare, setExemplare] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCarteId, setSelectedCarteId] = useState(id);
  const [carte, setCarte] = useState(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState({
    nume: "",
    prenume: "",
  });
  const [editExemplarId, setEditExemplarId] = useState(null);
  const [newStare, setNewStare] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
  const dropdownRef = useRef(null);
  const [rowMenuOpen, setRowMenuOpen] = useState(null); // pentru 3 puncte
  const rowDropdownRefs = useRef({});
  const [showPopupCheltuiala, setShowPopupCheltuiala] = useState(false);
  const [tipCheltuiala, setTipCheltuiala] = useState(""); // "Reparatie" sau "Inlocuire"
  const [cheltuialaDetalii, setCheltuialaDetalii] = useState("");
  const [cheltuialaCost, setCheltuialaCost] = useState("");
  const [exemplarCurentId, setExemplarCurentId] = useState(null);
  const [popupRentabilitate, setPopupRentabilitate] = useState(null); // { numarImprumuturi, rentabilitate, eticheta }
  const [loadingRentabilitate, setLoadingRentabilitate] = useState(false);
  const [showCheltuialaError, setShowCheltuialaError] = useState(false);

  // Funcție pentru a încărca exemplarele și datele cărții
  const fetchData = async () => {
    try {
      // Obține exemplarele pentru cartea respectivă

      const exemplareRes = await fetch(
        `http://localhost:3000/exemplare/${selectedCarteId}`
      );
      const exemplareData = await exemplareRes.json();

      setExemplare(exemplareData);

      // Obține informațiile despre carte
      const carteRes = await fetch(
        `http://localhost:3000/carte/${selectedCarteId}`
      );
      const carteData = await carteRes.json();
      setCarte(carteData);

      setLoading(false);
    } catch (error) {
      console.error("Eroare la încărcarea datelor:", error);
    }
  };

  useEffect(() => {
    fetchData();
    const nume = localStorage.getItem("nume");
    const prenume = localStorage.getItem("prenume");
    const utilizator_id = localStorage.getItem("utilizator_id");

    const fetchProfil = async () => {
      try {
        const res = await fetch(
          `http://localhost:3000/profil/${utilizator_id}`
        );
        const data = await res.json();
        setUser({
          nume: data.nume,
          prenume: data.prenume,
          pozaProfil: data.pozaProfil
            ? `http://localhost:3000${data.pozaProfil}`
            : "/images/default-avatar.jpg",
        });
      } catch (error) {
        console.error("Eroare la preluarea profilului:", error);
      }
    };

    fetchProfil();
  }, [selectedCarteId]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Închide dropdown din tabel dacă e deschis și s-a dat click în afara lui
      if (
        rowMenuOpen &&
        rowDropdownRefs.current[rowMenuOpen] &&
        !rowDropdownRefs.current[rowMenuOpen].contains(event.target)
      ) {
        setRowMenuOpen(null);
      }

      // Închide dropdown din header dacă s-a dat click în afara dropdownRef
      if (
        menuOpen &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [rowMenuOpen, menuOpen]);

  // Dacă datele sunt încărcate
  if (loading) {
    return <p>Se încarcă...</p>;
  }

  const handleEditClick = (exemplar) => {
    setEditExemplarId(exemplar.id);
    setNewStare(exemplar.stare);
  };

  const handleConfirmEdit = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:3000/modifica-exemplar/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ stare: newStare }),
        }
      );

      if (response.ok) {
        const updated = exemplare.map((ex) =>
          ex.id === id ? { ...ex, stare: newStare } : ex
        );
        setExemplare(updated);
        setEditExemplarId(null);
      }
    } catch (error) {
      console.error("Eroare la actualizarea exemplarului:", error);
    }
  };

  const handleDeleteExemplar = async (id) => {
    try {
      const res = await fetch(`http://localhost:3000/sterge-exemplar/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setExemplare((prev) => prev.filter((ex) => ex.id !== id));
        setShowDeleteSuccess(true);
        setConfirmDeleteId(null);
        setTimeout(() => setShowDeleteSuccess(false), 3000);
      }
    } catch (error) {
      console.error("Eroare la ștergere exemplar:", error);
    }
  };

  const handleConfirmCheltuiala = async () => {
    if (!cheltuialaDetalii.trim() || !cheltuialaCost.trim()) {
      setShowCheltuialaError(true);
      setTimeout(() => setShowCheltuialaError(false), 5000);
      return;
    }

    try {
      // Actualizează starea exemplarului
      await fetch(
        `http://localhost:3000/modifica-exemplar/${exemplarCurentId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ stare: "bună" }),
        }
      );

      // Creează o înregistrare de cheltuială
      await fetch("http://localhost:3000/adauga-cheltuiala", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exemplar_id: exemplarCurentId,
          tip_cheltuiala: tipCheltuiala,
          cost_total: parseFloat(cheltuialaCost),
          detalii_suplimentare: cheltuialaDetalii,
        }),
      });

      fetchData();
      setShowPopupCheltuiala(false);
      setCheltuialaCost("");
      setCheltuialaDetalii("");
    } catch (error) {
      console.error("Eroare la înregistrarea cheltuielii:", error);
    }
  };

  const handleVeziDetalii = async (id) => {
    setLoadingRentabilitate(true);
    try {
      const res = await fetch(
        `http://localhost:3000/rentabilitate-exemplar/${id}`
      );
      const data = await res.json();
      setPopupRentabilitate({ id, ...data });
    } catch (err) {
      console.error("Eroare rentabilitate:", err);
    } finally {
      setLoadingRentabilitate(false);
    }
  };

  return (
    <div className="exemplare-container">
      {/* ======= HEADER ======= */}
      <HeaderAdmin />

      {/* Tabelul cu exemplare */}
      <div className="exemplare-subcontainer">
        <h2>
          Exemplare pentru cartea: {carte ? carte.titlu : "Se încarcă..."}
        </h2>

        {/* Tabelul cu exemplarele */}
        <table className="exemplare-table">
          <thead>
            <tr>
              <th>ID Exemplar</th>
              <th>Stare</th>
              <th>Cost Achiziție</th>
              <th>Disponibilitate</th>
              <th style={{ backgroundColor: "transparent" }}></th>
            </tr>
          </thead>
          <tbody>
            {exemplare.length === 0 ? (
              <tr className="empty-row">
                <td colSpan="6" className="empty-message">
                  Nu există exemplare pentru această carte.
                </td>
              </tr>
            ) : (
              exemplare.map((exemplar) => {
                const necesitaInlocuire =
                  exemplar.stare === "necesită înlocuire";

                return (
                  <tr
                    key={exemplar.id}
                    className={necesitaInlocuire ? "expired-row" : ""}
                  >
                    <td>{exemplar.id}</td>
                    <td>
                      {editExemplarId === exemplar.id ? (
                        <>
                          <select
                            className="select-stare"
                            value={newStare}
                            onChange={(e) => setNewStare(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleConfirmEdit(exemplar.id);
                              }
                            }}
                          >
                            <option value="bună">bună</option>
                            <option value="deteriorată">deteriorată</option>
                            <option value="necesită înlocuire">
                              necesită înlocuire
                            </option>
                          </select>
                        </>
                      ) : (
                        exemplar.stare
                      )}
                    </td>
                    <td>{exemplar.cost_achizitie} RON</td>
                    <td>{exemplar.status_disponibilitate}</td>
                    <td
                      className="dropdown-cell"
                      ref={(el) => (rowDropdownRefs.current[exemplar.id] = el)}
                    >
                      <div className="dropdown">
                        <button
                          className="dots-button"
                          onClick={() =>
                            setRowMenuOpen(
                              rowMenuOpen === exemplar.id ? null : exemplar.id
                            )
                          }
                        >
                          &#8942;
                        </button>
                        {rowMenuOpen === exemplar.id && (
                          <div className="dropdown-menu-exemplare show">
                            <button
                              className="dropdown-item"
                              onClick={() => {
                                handleEditClick(exemplar);
                                setRowMenuOpen(null);
                              }}
                            >
                              Editează
                            </button>

                            <button
                              className="dropdown-item"
                              onClick={() => {
                                handleVeziDetalii(exemplar.id);
                                setRowMenuOpen(null);
                              }}
                            >
                              Vezi detalii
                            </button>

                            {exemplar.status_disponibilitate !==
                              "împrumutat" && (
                              <button
                                className="dropdown-item"
                                onClick={() => {
                                  setConfirmDeleteId(exemplar.id);
                                  setRowMenuOpen(null);
                                }}
                              >
                                Șterge
                              </button>
                            )}

                            {exemplar.stare === "necesită înlocuire" && (
                              <button
                                className="dropdown-item"
                                onClick={() => {
                                  setTipCheltuiala("Inlocuire");
                                  setShowPopupCheltuiala(true);
                                  setExemplarCurentId(exemplar.id);
                                  setRowMenuOpen(null);
                                }}
                              >
                                Înlocuiește
                              </button>
                            )}

                            {exemplar.stare === "deteriorată" && (
                              <button
                                className="dropdown-item"
                                onClick={() => {
                                  setTipCheltuiala("Reparatie");
                                  setShowPopupCheltuiala(true);
                                  setExemplarCurentId(exemplar.id);
                                  setRowMenuOpen(null);
                                }}
                              >
                                Înregistrează reparație
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {confirmDeleteId && (
          <div className="confirm-modal">
            <div className="modal-content">
              <h3>Doriți ștergerea exemplarului?</h3>
              <div className="popup-buttons">
                <button
                  id="btnDa"
                  onClick={() => handleDeleteExemplar(confirmDeleteId)}
                >
                  Da
                </button>
                <button id="btnNu" onClick={() => setConfirmDeleteId(null)}>
                  Nu
                </button>
              </div>
            </div>
          </div>
        )}

        {showDeleteSuccess && (
          <div className="floating-success">Exemplarul a fost șters!</div>
        )}
      </div>

      {showPopupCheltuiala && (
        <div className="popup-cheltuiala">
          <div className="popup-adauga-cheltuiala-content">
            <h3>Formular {tipCheltuiala.toLowerCase()}</h3>

            <textarea
              placeholder="Detalii suplimentare"
              value={cheltuialaDetalii}
              onChange={(e) => setCheltuialaDetalii(e.target.value)}
            />

            <input
              type="number"
              placeholder="Cost total"
              value={cheltuialaCost}
              onChange={(e) => setCheltuialaCost(e.target.value)}
            />

            <div className="popup-buttons">
              <button onClick={handleConfirmCheltuiala}>Confirmă</button>
              <button onClick={() => setShowPopupCheltuiala(false)}>
                Anulează
              </button>
            </div>
          </div>
        </div>
      )}

      {popupRentabilitate && (
        <div className="popup-rentabilitate">
          <div className="rentabilitate-content">
            <h3>Rentabilitate exemplar ID: {popupRentabilitate.id}</h3>
            <p>
              Număr împrumuturi:{" "}
              <strong>{popupRentabilitate.numarImprumuturi}</strong>
            </p>
            <p>
              Rentabilitate: <strong>{popupRentabilitate.rentabilitate}</strong>{" "}
              ({popupRentabilitate.eticheta})
            </p>
            <div className="rentabilitate-button">
              <button onClick={() => setPopupRentabilitate(null)}>
                Închide
              </button>
            </div>
          </div>
        </div>
      )}

      {showCheltuialaError && (
        <div className="floating-error-cheltuiala">
          Completati toate câmpurile!
        </div>
      )}
    </div>
  );
}

export default Exemplare;
