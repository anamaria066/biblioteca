import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./style.css";

function DetaliiCarte() {
    const { id } = useParams(); // Preluăm ID-ul cărții din URL
    const [carte, setCarte] = useState(null);

    useEffect(() => {
        fetch(`http://localhost:3000/carte/${id}`) // Endpoint pentru detalii carte
            .then((response) => response.json())
            .then((data) => setCarte(data))
            .catch((error) => console.error("Eroare la obținerea detaliilor cărții:", error));
    }, [id]);

    if (!carte) {
        return <p>Se încarcă...</p>;
    }

    return (
        <div className="detalii-container">
            {/* Header - La fel ca în pagina principală */}
            <header className="header">
                <div className="nav-buttons">
                    <button className="nav-button">Explorează</button>
                    <button className="nav-button">Recomandate</button>
                    <button className="nav-button">Cărțile mele</button>
                    <button className="nav-button">Istoric</button>
                </div>
                <div className="right-buttons">
                    <button className="icon-button">⭐</button>
                    <button className="icon-button">👤</button>
                </div>
            </header>

            {/* Container pentru detalii carte */}
            <div className="detalii-carte">
                <div className="detalii-text">
                    <h2>{carte.titlu}</h2>
                    <p><strong>Autor:</strong> {carte.autor}</p>
                    <p><strong>An publicare:</strong> {carte.an_publicatie}</p>
                    <p><strong>Gen:</strong> {carte.gen}</p>
                    <p><strong>Preț:</strong> {carte.pret} RON</p>
                    <p><strong>Stoc:</strong> {carte.stoc > 0 ? "Disponibil" : "Indisponibil"}</p>
                    <p><strong>Descriere:</strong> {carte.descriere}</p>
                    <p><strong>Rating:</strong> {carte.rating}/10 ⭐</p>
                </div>
                <div className="detalii-imagine">
                    <img src={carte.imagine} alt={carte.titlu} className="coperta-mare" />
                </div>
            </div>
        </div>
    );
}

export default DetaliiCarte;