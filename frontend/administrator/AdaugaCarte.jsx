import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../aspect/AdaugaCarte.css";
import HeaderAdmin from "./HeaderAdmin";

function AdaugaCarte() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [titlu, setTitlu] = useState("");
  const [autor, setAutor] = useState("");
  const [anPublicatie, setAnPublicatie] = useState("");
  const [descriere, setDescriere] = useState("");
  const [gen, setGen] = useState("Ficțiune");
  const [pret, setPret] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [successMessage, setSuccessMessage] = useState(false);
  const [menuOpen, setMenuOpen] = useState(null);
  const [showPopupCod, setShowPopupCod] = useState(false);
  const [codImprumut, setCodImprumut] = useState("");
  const [showPopupConfirmare, setShowPopupConfirmare] = useState(false);
  const [mesajEroareCod, setMesajEroareCod] = useState("");
  const [detaliiImprumut, setDetaliiImprumut] = useState(null);
  const fileInputRef = useRef(null);

  const [user, setUser] = useState({
    nume: "",
    prenume: "",
    pozaProfil: "",
  });

  useEffect(() => {
    const handleClickOutsideDropdown = (e) => {
      if (
        !e.target.closest(".dropdown") &&
        !e.target.closest(".dropdown-menu")
      ) {
        setMenuOpen(null); // Închide meniul
      }
    };

    document.addEventListener("mousedown", handleClickOutsideDropdown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutsideDropdown);
    };
  }, []);

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
        })
        .catch((err) =>
          console.error("Eroare la încărcarea datelor utilizatorului:", err)
        );
    }
  }, []);

  const handleImageChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleConfirm = async () => {
    const formData = new FormData();
    formData.append("titlu", titlu);
    formData.append("autor", autor);
    formData.append("an_publicatie", anPublicatie);
    formData.append("descriere", descriere);
    formData.append("gen", gen);
    formData.append("pret", parseFloat(pret));
    if (file) {
      formData.append("imagine", file);
    }

    try {
      const res = await fetch("http://localhost:3000/adauga-carte-cu-upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        setSuccessMessage(true);
        setTimeout(() => {
          setSuccessMessage(false);
          navigate("/admin");
        }, 3000);
      } else {
        const data = await res.json();
        alert(data.message || "Eroare la adăugare.");
      }
    } catch (error) {
      console.error("Eroare:", error);
      alert("Eroare de rețea!");
    }
  };

  const handleCancel = () => {
    navigate("/admin");
  };

  const verificaCod = async () => {
    try {
      const res = await fetch(
        `http://localhost:3000/verifica-cod/${codImprumut}`
      );
      const data = await res.json();

      if (res.ok) {
        setDetaliiImprumut(data);
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

  return (
    <div className="adauga-carte-admin-container">
      {/* ======= HEADER ======= */}
      <HeaderAdmin />

      {/* ======= FORMULAR ADĂUGARE ======= */}
      <div className="adauga-carte-admin-subcontainer">
        <h2>Adaugă o carte nouă</h2>
        <div className="form-adauga-carte-wrapper">
          {/* FORMULAR */}
          <div className="formular-adauga-carte">
            <input
              type="text"
              placeholder="Titlu"
              value={titlu}
              onChange={(e) => setTitlu(e.target.value)}
            />
            <input
              type="text"
              placeholder="Autor"
              value={autor}
              onChange={(e) => setAutor(e.target.value)}
            />
            <input
              type="number"
              placeholder="An publicare"
              value={anPublicatie}
              onChange={(e) => setAnPublicatie(e.target.value)}
            />
            <textarea
              placeholder="Descriere"
              value={descriere}
              onChange={(e) => setDescriere(e.target.value)}
            />
            <select value={gen} onChange={(e) => setGen(e.target.value)}>
              <option value="Ficțiune">Ficțiune</option>
              <option value="Non-ficțiune">Non-ficțiune</option>
              <option value="Poezie">Poezie</option>
              <option value="Dezvoltare personală">Dezvoltare personală</option>
              <option value="Copii">Copii</option>
              <option value="Crimă">Crimă</option>
              <option value="Mister">Mister</option>
              <option value="Distopie">Distopie</option>
              <option value="Aventură">Aventură</option>
              <option value="Fantasy">Fantasy</option>
              <option value="Psihologic">Psihologic</option>
              <option value="Filosofie">Filosofie</option>
              <option value="Economie">Economie</option>
            </select>
            <input
              type="number"
              placeholder="Preț (RON)"
              value={pret}
              onChange={(e) => setPret(e.target.value)}
            />

            <label>Alege imagine:</label>
            <input
              id="chooseCoperta"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              ref={fileInputRef}
            />
          </div>

          {/* PREVIEW IMAGINE */}
          <div className="preview-section-coperta">
            <div className="preview-wrapper-coperta">
              <img
                src={preview || "/images/default-book.png"}
                alt="Coperta"
                className="preview-image-full"
              />
              {preview && (
                <button
                  className="sterge-preview-btn"
                  onClick={() => {
                    setPreview(null);
                    setFile(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = ""; // Resetează inputul
                    }
                  }}
                  title="Șterge imaginea"
                >
                  X
                </button>
              )}
            </div>
          </div>
        </div>

        {/* BUTOANE */}
        <div className="butoane-form-adauga-carte">
          <button id="btnConfirmaAdaugaCarte" onClick={handleConfirm}>
            Adaugă
          </button>
          <button id="btnAnuleazaAdaugaCarte" onClick={handleCancel}>
            Anulează
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="floating-success">Carte adăugată cu succes!</div>
      )}
    </div>
  );
}

export default AdaugaCarte;
