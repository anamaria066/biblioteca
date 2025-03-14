import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./style.css";

function DetaliiCarte() {
    const { id } = useParams();
    const [carte, setCarte] = useState(null);
    const [recenzii, setRecenzii] = useState([]);
    const [showAllRecenzii, setShowAllRecenzii] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [recenzie, setRecenzie] = useState({ rating: "", comentariu: "" });
    const [mesaj, setMesaj] = useState("");

    // ✅ Funcție pentru a încărca cartea și recenziile
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

    // ✅ Apelează `fetchData()` la încărcarea paginii
    useEffect(() => {
        fetchData();
    }, [id]);

    // ✅ Funcție pentru trimiterea recenziei
    const handleSubmitRecenzie = async (e) => {
        e.preventDefault();

        const nota = parseFloat(recenzie.rating);
        if (isNaN(nota) || nota < 0 || nota > 5 || !recenzie.comentariu) {
            setMesaj("Te rugăm să completezi toate câmpurile și să alegi un rating valid!");
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
                    utilizator_id: 1 // TODO: Înlocuiește cu ID-ul real al utilizatorului logat
                }),
            });

            const data = await response.json();
            if (response.ok) {
                setMesaj("Recenzia a fost adăugată cu succes!");
                
                // ✅ După 2 secunde, ascundem popup-ul și reîncărcăm recenziile
                setTimeout(() => {
                    setShowPopup(false);
                    setMesaj("");
                    setRecenzie({ rating: "", comentariu: "" }); // Resetare formular
                    fetchData(); // ✅ Reîncărcăm pagina cu recenzii actualizate
                }, 2000);
            } else {
                setMesaj(data.message || "Eroare la adăugarea recenziei!");
            }
        } catch (err) {
            setMesaj("Eroare de rețea!");
        }
    };

    if (!carte) {
        return <p>Se încarcă...</p>;
    }

    return (
        <div className="detalii-container">
            {/* Header */}
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

            {/* Detalii carte */}
            <div className="detalii-carte">
                <div className="detalii-text">
                    <h2>{carte.titlu}</h2>
                    <p><strong>Autor:</strong> {carte.autor}</p>
                    <p><strong>An publicare:</strong> {carte.an_publicatie}</p>
                    <p><strong>Gen:</strong> {carte.gen}</p>
                    <p><strong>Preț:</strong> {carte.pret} RON</p>
                    <p><strong>Stare:</strong> {carte.stoc > 0 ? "Disponibil" : "Indisponibil"}</p>
                    <p><strong>Descriere:</strong> {carte.descriere}</p>
                    <p><strong>Rating:</strong> {carte.rating}/10 ⭐</p>

                    {/* ✅ Buton "Lasă o recenzie" sub detaliile cărții */}
                    <button className="btn-recenzie" onClick={() => setShowPopup(true)}>Lasă o recenzie</button>
                </div>
                <div className="detalii-imagine">
                    <img src={carte.imagine} alt={carte.titlu} className="coperta-mare" />
                </div>
            </div>

            {/* Secțiunea de recenzii */}
            <div className="recenzii-container">
                <h3>Recenzii</h3>

                {recenzii.length === 0 ? (
                    <p className="fara-recenzii">Nu există recenzii momentan!</p>
                ) : (
                    <div className={`recenzii-box ${showAllRecenzii ? "expand" : ""}`}>
                        {recenzii.slice(0, showAllRecenzii ? recenzii.length : 3).map((recenzie, index) => (
                            <div className="recenzie-card" key={index}>
                                <p><strong>{recenzie.Utilizator.nume} {recenzie.Utilizator.prenume}, Nota: {recenzie.rating}/5 ⭐</strong></p>
                                <p>{recenzie.comentariu}</p>
                                <p><small>Data: {new Date(recenzie.data_recenzie).toLocaleDateString()}</small></p>
                            </div>
                        ))}
                    </div>
                )}

                {recenzii.length > 3 && (
                    <button className="btn-mai-multe" onClick={() => setShowAllRecenzii(!showAllRecenzii)}>
                        {showAllRecenzii ? "Ascunde recenziile" : "Mai multe recenzii..."}
                    </button>
                )}
            </div>

            {/* ✅ Pop-up pentru recenzie */}
            {showPopup && (
                <div className="popup-container">
                    <div className="popup-content">
                        <h3>Lasă o recenzie pentru "{carte.titlu}"</h3>
                        <form onSubmit={handleSubmitRecenzie}>
                            <label>Rating (0-5):</label>
                            <input
                                type="number"
                                min="0"
                                max="5"
                                step="0.1" // ✅ Permite valori cu zecimale
                                value={recenzie.rating}
                                onChange={(e) => setRecenzie({ ...recenzie, rating: e.target.value })}
                                required
                            />

                            <label>Comentariu:</label>
                            <textarea
                                value={recenzie.comentariu}
                                onChange={(e) => setRecenzie({ ...recenzie, comentariu: e.target.value })}
                                required
                            />

                            {mesaj && <p className="mesaj-status">{mesaj}</p>}
                            <button type="submit" className="btn-trimite">Trimite</button>
                            <button type="button" className="btn-anulare" onClick={() => setShowPopup(false)}>Anulează</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DetaliiCarte;