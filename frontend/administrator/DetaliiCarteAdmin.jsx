import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../aspect/DetaliiCarteAdmin.css";
import { useLocation } from "react-router-dom";
import HeaderAdmin from "./HeaderAdmin";

function DetaliiCarteAdmin() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [carte, setCarte] = useState(null);
  const [recenzii, setRecenzii] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [mesaj, setMesaj] = useState("");
  const [menuOpen, setMenuOpen] = useState(null);
  const [cartiSimilare, setCartiSimilare] = useState([]);
  const [user, setUser] = useState({
    nume: "",
    prenume: "",
  });

  const [showAddExemplarPopup, setShowAddExemplarPopup] = useState(false);
  const [stareExemplar, setStareExemplar] = useState("bună");
  const [costAchizitie, setCostAchizitie] = useState("");
  const [dataAchizitie, setDataAchizitie] = useState(
    new Date().toISOString().split("T")[0]
  ); // format YYYY-MM-DD
  const [showExemplarSuccess, setShowExemplarSuccess] = useState(false);
  const [showEditSuccess, setShowEditSuccess] = useState(false);
  const [showExemplarError, setShowExemplarError] = useState(false);
  const location = useLocation();
  useEffect(() => {
    if (location.state?.showSuccessMessage) {
      setShowEditSuccess(true);
      const timer = setTimeout(() => setShowEditSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  // Funcție pentru a încărca cartea și recenziile
  const fetchData = async () => {
    try {
      const carteRes = await fetch(`http://localhost:3000/carte/${id}`);
      const carteData = await carteRes.json();
      setCarte(carteData);

      const recenziiRes = await fetch(`http://localhost:3000/recenzii/${id}`);
      const recenziiData = await recenziiRes.json();
      setRecenzii(recenziiData);
    } catch (error) {
      console.error("Eroare la încărcarea datelor:", error);
    }
  };

  const calculeazaRatingMediu = () => {
    if (recenzii.length === 0) return 0;
    const sumaRatinguri = recenzii.reduce(
      (sum, recenzie) => sum + parseFloat(recenzie.rating),
      0
    );
    return (sumaRatinguri / recenzii.length).toFixed(1);
  };

  const renderStars = (rating) => {
    const maxStars = 5;
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.3 && rating % 1 <= 0.7;
    const emptyStars = maxStars - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <span className="rating-stars">
        {"★".repeat(fullStars)}
        {hasHalfStar && <span className="half-star">★</span>}
        {"☆".repeat(emptyStars)}
      </span>
    );
  };

  const ratingMediu = calculeazaRatingMediu();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        !e.target.closest(".dropdown") &&
        !e.target.closest(".dropdown-menu")
      ) {
        setMenuOpen(null); // închide meniul
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    fetch(`http://localhost:3000/carti-similare/${id}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("Cărți similare primite din backend:", data);
        setCartiSimilare(data);
      })
      .catch((err) => console.error("Eroare la cărți similare:", err));
  }, [id]);

  useEffect(() => {
    fetchData();

    // Setează datele utilizatorului
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
  }, [id]);

  // Șterge cartea
  const handleDelete = async () => {
    try {
      const response = await fetch(`http://localhost:3000/sterge-carte/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (response.ok) {
        navigate("/carti", {
          state: { showDeleteSuccess: true },
        });
      } else {
        setMesaj(data.message || "Eroare la ștergerea cărții!");
      }
    } catch (error) {
      console.error("Eroare la ștergerea cărții:", error);
      setMesaj("Eroare de rețea!");
    }
  };

  // Vezi exemplare
  const handleViewExemplare = () => {
    navigate(`/exemplare/${id}`); // Navighează la pagina cu exemplarele cărții
  };

  const confirmDelete = () => {
    setShowPopup(true); // Afișează pop-up-ul de confirmare
  };

  const cancelDelete = () => {
    setShowPopup(false); // Închide pop-up-ul fără a face nimic
  };

  if (!carte) {
    return <p>Se încarcă...</p>;
  }

  const handleAddExemplar = async () => {
    if (!stareExemplar || !costAchizitie || !dataAchizitie) {
      setShowExemplarError(true);
      setTimeout(() => setShowExemplarError(false), 5000);
      return;
    }

    const cost = parseFloat(costAchizitie) || 0;

    try {
      const exemplarNou = {
        carte_id: id,
        stare: stareExemplar,
        cost_achizitie: cost,
        data_achizitie: new Date(dataAchizitie),
      };

      const response = await fetch("http://localhost:3000/adauga-exemplar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(exemplarNou),
      });

      const data = await response.json();

      if (response.ok) {
        setShowAddExemplarPopup(false);
        setCostAchizitie("");
        setShowExemplarSuccess(true);
        setTimeout(() => setShowExemplarSuccess(false), 3000);
      } else {
        alert(data.message || "Eroare la adăugarea exemplarului.");
      }
    } catch (error) {
      console.error("Eroare la adăugare exemplar:", error);
      alert("Eroare de rețea!");
    }
  };

  return (
    <div className="detalii-container-admin">
      {/* ======= HEADER ======= */}
      <HeaderAdmin />

      <div className="columns-admin">
        <div className="left-column-admin">
          <div className="detalii-imagine-admin">
            <img
              src={
                carte.imagine?.startsWith("/uploads")
                  ? `http://localhost:3000${carte.imagine}`
                  : carte.imagine || "/images/default-book.png"
              }
              alt={carte.titlu}
              className="coperta-mare-admin"
            />
          </div>
          <div className="wrapper-butoane-admin">
            <div className="buton-row">
              <button className="btnDelete" onClick={confirmDelete}>
                Șterge cartea
              </button>
              <button
                className="btnEdit"
                onClick={() => navigate(`/editeaza-carte/${id}`)}
              >
                Editează
              </button>
            </div>
            <div className="buton-row">
              <button className="btnExemplare" onClick={handleViewExemplare}>
                Vezi exemplare
              </button>
              <button
                className="btnAdaugaExemplar"
                onClick={() => setShowAddExemplarPopup(true)}
              >
                Adaugă exemplar
              </button>
            </div>
          </div>
        </div>

        <div className="right-column-admin">
          <div className="detalii-carte-admin">
            <h2>{carte.titlu}</h2>
            <p>
              <strong>Autor:</strong> {carte.autor}
            </p>
            <p>
              <strong>Rating:</strong> {renderStars(ratingMediu)} ({ratingMediu}
              /5)
            </p>
            <p>
              <strong>An publicare:</strong> {carte.an_publicatie}
            </p>
            <p>
              <strong>Limba:</strong> {carte.limba}
            </p>
            <p>
              <strong>Gen:</strong> {carte.gen}
            </p>
            <p>
              <strong>Descriere:</strong> {carte.descriere}
            </p>
          </div>

          <div className="recenzii-container-admin">
            <h3>Recenzii</h3>
            {recenzii.length === 0 ? (
              <p className="fara-recenzii-admin">
                Nu există recenzii momentan!
              </p>
            ) : (
              <div className="recenzii-box-admin">
                {recenzii.map((recenzie, index) => (
                  <div className="recenzie-card-admin" key={index}>
                    <p id="detalii-utilizator-recenzie">
                      {recenzie.Utilizator.nume} {recenzie.Utilizator.prenume},
                      Nota: {recenzie.rating}/5 ⭐
                    </p>
                    <p className="recenzie-text">{recenzie.comentariu}</p>
                    <p>
                      <small>
                        Data:{" "}
                        {new Date(recenzie.data_recenzie).toLocaleDateString()}
                      </small>
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {cartiSimilare.length > 0 && (
            <div className="carti-similare-section">
              <h3>Te-ar putea interesa și...</h3>
              <div className="carti-similare-grid">
                {cartiSimilare.map((carte) => (
                  <div
                    key={carte.id}
                    className="book-card-similare"
                    onClick={() => navigate(`/detalii/${carte.id}`)}
                  >
                    <img
                      src={
                        carte.imagine?.startsWith("/uploads")
                          ? `http://localhost:3000${carte.imagine}`
                          : carte.imagine
                      }
                      alt={carte.titlu}
                      className="book-image-client"
                    />
                    <p className="book-title-client">
                      {carte.titlu} - {carte.autor}
                    </p>
                    <div className="book-spacer"></div>
                    <p className="book-rating">{renderStars(carte.rating)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Pop-up pentru confirmarea ștergerii */}
      {showPopup && (
        <div className="popup-confirma-stergere">
          <div className="content-confirma-stergere">
            <h3>Confirmați ștergerea cărții?</h3>
            <p>Odată ștearsă, cartea nu va mai fi disponibilă!</p>
            <button className="confirm-sterge-carte" onClick={handleDelete}>
              Da, șterge cartea
            </button>
            <button className="cancel-sterge-carte" onClick={cancelDelete}>
              Anulează
            </button>
          </div>
        </div>
      )}

      {/*  */}
      {showAddExemplarPopup && (
        <div className="popup-overlay">
          <div className="popup-adauga-exemplar">
            <h3>Adaugă exemplar</h3>

            <label>Stare:</label>
            <select
              value={stareExemplar}
              onChange={(e) => setStareExemplar(e.target.value)}
            >
              <option value="bună">bună</option>
              <option value="deteriorată">deteriorată</option>
              <option value="necesită înlocuire">necesită înlocuire</option>
            </select>

            <label>Cost achiziție:</label>
            <input
              type="number"
              value={costAchizitie}
              onChange={(e) => setCostAchizitie(e.target.value)}
              placeholder="Ex: 45.00"
            />
            <label>Data achiziției:</label>
            <input
              type="date"
              value={dataAchizitie}
              onChange={(e) => setDataAchizitie(e.target.value)}
            />

            <div className="popup-buttons">
              <button id="btnConfirmaExemplar" onClick={handleAddExemplar}>
                Confirmă
              </button>
              <button
                id="btnAnuleazaExemplar"
                onClick={() => setShowAddExemplarPopup(false)}
              >
                Anulează
              </button>
            </div>
          </div>
        </div>
      )}
      {/*  */}

      {showExemplarSuccess && (
        <div className="floating-success-adauga-exemplar">
          Exemplarul a fost adăugat cu succes!
        </div>
      )}

      {showEditSuccess && (
        <div className="floating-success-modificari">Modificări salvate!</div>
      )}

      {showExemplarError && (
        <div className="floating-error-adauga-exemplar">
          Introduceți toate datele exemplarului!
        </div>
      )}
    </div>
  );
}

export default DetaliiCarteAdmin;
