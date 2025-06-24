// EditeazaCarte.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../aspect/EditeazaCarte.css";
import HeaderAdmin from "./HeaderAdmin";

function EditeazaCarte() {
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
  const [user, setUser] = useState({ nume: "", prenume: "", pozaProfil: "" });
  const [menuOpen, setMenuOpen] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

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
    }

    // Load carte
    fetch(`http://localhost:3000/carte/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setTitlu(data.titlu);
        setAutor(data.autor);
        setAnPublicatie(data.an_publicatie);
        setDescriere(data.descriere);
        setGen(data.gen);
        setPret(data.pret);
        if (data.imagine) {
          setPreview(
            data.imagine.startsWith("/uploads")
              ? `http://localhost:3000${data.imagine}`
              : data.imagine
          );
        }
      });
  }, [id]);

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
      const res = await fetch(`http://localhost:3000/editeaza-carte/${id}`, {
        method: "PUT",
        body: formData,
      });

      if (res.ok) {
        navigate(`/detalii-admin/${id}`, {
          state: { showSuccessMessage: true },
        });
      } else {
        const data = await res.json();
        alert(data.message || "Eroare la actualizare.");
      }
    } catch (error) {
      console.error("Eroare:", error);
      alert("Eroare de rețea!");
    }
  };

  const handleCancel = () => {
    navigate(`/detalii-admin/${id}`);
  };

  return (
    <div className="editeaza-carte-container">
      <HeaderAdmin />

      <div className="editeaza-carte-subcontainer">
        <h2>Editează cartea</h2>
        <div className="form-editeaza-carte-wrapper">
          <div className="form-editeaza-carte">
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
              {/* toate opțiunile ca în AdaugaCarte */}
              <option value="Ficțiune">Ficțiune</option>
              <option value="Non-ficțiune">Non-ficțiune</option>
              {/* ... */}
            </select>
            <input
              type="number"
              placeholder="Preț (RON)"
              value={pret}
              onChange={(e) => setPret(e.target.value)}
            />
            <label>Alege imagine nouă (opțional):</label>
            <input
              id="chooseCoperta"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
          </div>

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
                  }}
                  title="Șterge imaginea"
                >
                  X
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="butoane-form-editeaza-carte">
          <button id="btnConfirmaCarte" onClick={handleConfirm}>
            Confirmă modificările
          </button>
          <button id="btnAnuleazaCarte" onClick={handleCancel}>
            Anulează
          </button>
        </div>
      </div>
      {showSuccessMessage && (
        <div className="floating-success-modificari-carte">
          Modificări salvate!
        </div>
      )}
    </div>
  );
}

export default EditeazaCarte;
