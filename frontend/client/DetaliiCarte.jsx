import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../aspect/DetaliiCarte.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import HeaderClient from "./HeaderClient";
import ChatWidget from "../chatbot/ChatWidget";

function DetaliiCarte() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [carte, setCarte] = useState(null);
  const [recenzii, setRecenzii] = useState([]);
  const [showAllRecenzii, setShowAllRecenzii] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [recenzie, setRecenzie] = useState({ rating: "", comentariu: "" });
  const [mesaj, setMesaj] = useState("");
  const [esteFavorita, setEsteFavorita] = useState(false);
  const utilizator_id = localStorage.getItem("utilizator_id");
  const [user, setUser] = useState({
    nume: "",
    prenume: "",
    pozaProfil: "",
  });
  const [mesajFavorit, setMesajFavorit] = useState("");
  const [afiseazaMesajFavorit, setAfiseazaMesajFavorit] = useState(false);
  const [showPopupImprumut, setShowPopupImprumut] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [zileIndisponibile, setZileIndisponibile] = useState([]);
  const [mesajImprumut, setMesajImprumut] = useState("");
  const [afiseazaMesajImprumut, setAfiseazaMesajImprumut] = useState(false);
  const [esteSucces, setEsteSucces] = useState(false);
  const [cartiSimilare, setCartiSimilare] = useState([]);

  // ✅ Funcție pentru a încărca cartea, recenziile și favoritele
  const userId = localStorage.getItem("utilizator_id");

  const fetchData = async () => {
    try {
      const carteRes = await fetch(`http://localhost:3000/carte/${id}`);
      const carteData = await carteRes.json();
      setCarte(carteData);

      const recenziiRes = await fetch(`http://localhost:3000/recenzii/${id}`);
      const recenziiData = await recenziiRes.json();
      setRecenzii(recenziiData);

      const favoriteRes = await fetch(
        `http://localhost:3000/favorite/${userId}`
      );
      const favoriteData = await favoriteRes.json();
      setEsteFavorita(favoriteData.some((fav) => fav.id === parseInt(id)));

      // Obține datele utilizatorului din backend
      const profilRes = await fetch(`http://localhost:3000/profil/${userId}`);
      const profilData = await profilRes.json();
      setUser({
        nume: profilData.nume,
        prenume: profilData.prenume,
        pozaProfil: profilData.pozaProfil || "/images/default-avatar.jpg",
      });
    } catch (error) {
      console.error("Eroare la încărcarea datelor:", error);
    }
  };

  useEffect(() => {
    document.body.classList.add("no-scroll");

    return () => {
      document.body.classList.remove("no-scroll");
    };
  }, []);

  useEffect(() => {
    fetchData();

    const incarcaZileIndisponibile = async () => {
      try {
        const res = await fetch(
          `http://localhost:3000/intervale-imprumut-carte/${id}`
        );
        const data = await res.json();

        // 🆕 Extragem imprumuturi și totalExemplare
        const { imprumuturi, totalExemplare } = data;

        const zileCounter = {}; // 🆕 contor pentru zile

        imprumuturi.forEach((imprumut) => {
          const start = new Date(imprumut.data_imprumut);
          const end = new Date(imprumut.data_returnare);

          for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const day = d.toISOString().slice(0, 10); // format "yyyy-mm-dd"
            zileCounter[day] = (zileCounter[day] || 0) + 1; // incrementăm
          }
        });

        // 🆕 selectăm doar zilele în care toate exemplarele sunt ocupate
        const zileIndisponibile = Object.keys(zileCounter).filter(
          (day) => zileCounter[day] >= totalExemplare
        );

        setZileIndisponibile(zileIndisponibile);
      } catch (error) {
        console.error("Eroare la încărcarea zilelor indisponibile:", error);
      }
    };

    if (showPopupImprumut) {
      incarcaZileIndisponibile();
    }
  }, [showPopupImprumut, id]);

  useEffect(() => {
    fetch(`http://localhost:3000/carti-similare/${id}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("Cărți similare primite din backend:", data);
        setCartiSimilare(data);
      })
      .catch((err) => console.error("Eroare la cărți similare:", err));
  }, [id]);

  // ✅ Calcularea rating-ului mediu
  const calculeazaRatingMediu = () => {
    if (recenzii.length === 0) return 0;
    const sumaRatinguri = recenzii.reduce(
      (sum, recenzie) => sum + parseFloat(recenzie.rating),
      0
    );
    return (sumaRatinguri / recenzii.length).toFixed(1);
  };

  // ✅ Generare stele corecte (inclusiv jumătăți)
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

  // ✅ Adăugare/ștergere carte din favorite
  const handleFavorite = async () => {
    const url = esteFavorita ? "/sterge-favorite" : "/adauga-favorite";
    const method = esteFavorita ? "DELETE" : "POST";

    try {
      const response = await fetch(`http://localhost:3000${url}`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ utilizator_id, carte_id: id }),
      });

      const data = await response.json();
      if (response.ok) {
        setEsteFavorita(!esteFavorita);
        setMesajFavorit(
          data.message ||
            (esteFavorita
              ? "Carte eliminată din favorite!"
              : "Carte adăugată la favorite!")
        );
        setAfiseazaMesajFavorit(true);
        setTimeout(() => setAfiseazaMesajFavorit(false), 3000);
      }
    } catch (error) {
      console.error("Eroare:", error);
    }
  };

  // ✅ Trimitere recenzie
  const handleSubmitRecenzie = async (e) => {
    e.preventDefault();

    const nota = parseFloat(recenzie.rating);
    if (isNaN(nota) || nota < 0 || nota > 5 || !recenzie.comentariu) {
      setMesaj(
        "Te rugăm să completezi toate câmpurile și să alegi un rating valid!"
      );
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/adauga-recenzie", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          carte_id: id,
          rating: nota,
          comentariu: recenzie.comentariu,
          utilizator_id,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setMesaj("Recenzia a fost adăugată cu succes!");
        setTimeout(() => {
          setShowPopup(false);
          setMesaj("");
          setRecenzie({ rating: "", comentariu: "" });
          fetchData();
        }, 1000);
      } else {
        setMesaj(data.message || "Eroare la adăugarea recenziei!");
      }
    } catch (err) {
      setMesaj("Eroare de rețea!");
    }
  };

  const ratingMediu = calculeazaRatingMediu();

  if (!carte) {
    return <p>Se încarcă...</p>;
  }

  const handleConfirmImprumut = async () => {
    if (!startDate || !endDate) {
      setMesajImprumut("Selectează ambele date!");
      afiseazaPopupTemporar();
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/creeaza-imprumut", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          utilizator_id: parseInt(utilizator_id),
          carte_id: parseInt(id),
          dataStart: startDate,
          dataEnd: endDate,
        }),
      });

      const data = await res.json();

      setMesajImprumut(data.message);
      setEsteSucces(res.ok);
      afiseazaPopupTemporar();

      if (res.ok) {
        setShowPopupImprumut(false);
        setStartDate("");
        setEndDate("");
      }
    } catch (err) {
      setMesajImprumut("Eroare la trimiterea împrumutului!");
      setEsteSucces(false);
      afiseazaPopupTemporar();
    }
  };

  const afiseazaPopupTemporar = () => {
    setAfiseazaMesajImprumut(true);
    setTimeout(() => setAfiseazaMesajImprumut(false), 3000);
  };

  return (
    <div className="detalii-container-client">
      <HeaderClient />
      <div className="columns">
        <div className="left-column">
          <img
            src={
              esteFavorita ? "/images/full_heart.png" : "/images/empy_heart.png"
            }
            alt="Favorite"
            className="icon-favorite"
            onClick={handleFavorite}
          />
          <div className="detalii-imagine-client">
            <img
              src={
                carte.imagine
                  ? carte.imagine.startsWith("/uploads")
                    ? `http://localhost:3000${carte.imagine}`
                    : carte.imagine
                  : "/images/default-book.png"
              }
              alt={carte.titlu}
              className="coperta-mare-client"
            />
          </div>
          <div className="wrapper-butoane">
            <button className="btn-recenzie" onClick={() => setShowPopup(true)}>
              Lasă o recenzie
            </button>
            <button
              className="btnImprumuta"
              onClick={() => setShowPopupImprumut(true)}
            >
              Împrumută
            </button>
          </div>
        </div>

        {/* COLOANA DREAPTA */}
        <div className="right-column">
          <div className="detalii-carte-client">
            <h2>{carte.titlu}</h2>
            <p>
              <strong>Autor:</strong> {carte.autor}
            </p>
            <p>
              <strong>Rating:</strong> {renderStars(ratingMediu)} ({ratingMediu}
              /5)
            </p>
            <p>
              <strong>Descriere:</strong> {carte.descriere}
            </p>
            <p>
              <strong>Gen:</strong> {carte.gen}
            </p>
            <p>
              <strong>Limba:</strong> {carte.limba}
            </p>
            <p>
              <strong>An publicare:</strong> {carte.an_publicatie}
            </p>
          </div>
          <div className="recenzii-container-client">
            <h3>Recenzii</h3>

            {recenzii.length === 0 ? (
              <p className="fara-recenzii-client">
                Nu există recenzii momentan!
              </p>
            ) : (
              <div className="recenzii-box-client">
                {recenzii.map((recenzie, index) => (
                  <div className="recenzie-card-client" key={index}>
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
          {/*  */}
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
          {/*  */}
        </div>
      </div>

      {afiseazaMesajFavorit && (
        <div className="floating-adauga-favorite">{mesajFavorit}</div>
      )}

      {afiseazaMesajImprumut && (
        <div
          className={
            esteSucces ? "floating-success-imprumut" : "floating-error-imprumut"
          }
        >
          {mesajImprumut}
        </div>
      )}
      {showPopupImprumut && (
        <div className="popup-imprumut">
          <div className="popup-imprumuta">
            <h3>Rezervare carte</h3>
            <DatePicker
              selected={startDate ? new Date(startDate) : null}
              onChange={(date) => {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, "0");
                const day = String(date.getDate()).padStart(2, "0");
                setStartDate(`${year}-${month}-${day}`);
              }}
              minDate={new Date()}
              excludeDates={zileIndisponibile.map((date) => new Date(date))}
              highlightDates={[
                {
                  "zi-indisponibila": zileIndisponibile.map(
                    (date) => new Date(date)
                  ),
                },
              ]}
              dateFormat="yyyy-MM-dd"
              placeholderText="Selectează data de start"
            />
            <DatePicker
              selected={endDate ? new Date(endDate) : null}
              onChange={(date) => {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, "0");
                const day = String(date.getDate()).padStart(2, "0");
                setEndDate(`${year}-${month}-${day}`);
              }}
              minDate={startDate ? new Date(startDate) : new Date()}
              excludeDates={zileIndisponibile.map((date) => new Date(date))}
              highlightDates={[
                {
                  "zi-indisponibila": zileIndisponibile.map(
                    (date) => new Date(date)
                  ),
                },
              ]}
              dateFormat="yyyy-MM-dd"
              placeholderText="Selectează data de retur"
            />

            <div className="butoane-imprumuta">
              <button id="btnConfirmaImprumut" onClick={handleConfirmImprumut}>
                Confirmă
              </button>
              <button
                id="btnAnuleazaImprumut"
                onClick={() => setShowPopupImprumut(false)}
              >
                Anulează
              </button>
            </div>
          </div>
        </div>
      )}

      <ChatWidget />
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-adauga-recenzie">
            <h3>Adaugă recenzie</h3>
            <form onSubmit={handleSubmitRecenzie}>
              <input
                type="number"
                step="0.1"
                min="0"
                max="5"
                placeholder="Rating (0-5)"
                value={recenzie.rating}
                onChange={(e) =>
                  setRecenzie({ ...recenzie, rating: e.target.value })
                }
              />
              <textarea
                placeholder="Comentariu"
                value={recenzie.comentariu}
                onChange={(e) =>
                  setRecenzie({ ...recenzie, comentariu: e.target.value })
                }
              ></textarea>
              <div className="butoane-adauga-recenzie">
                <button type="submit">Trimite</button>
                <button type="button" onClick={() => setShowPopup(false)}>
                  Anulează
                </button>
              </div>
              {mesaj && <p className="mesaj-eroare">{mesaj}</p>}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default DetaliiCarte;
