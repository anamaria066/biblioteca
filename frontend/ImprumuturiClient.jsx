import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./style.css";

function ImprumuturiClient() {
    const navigate = useNavigate();
    const [cartiImprumutate, setCartiImprumutate] = useState([]);
    const [user, setUser] = useState({
        nume: "",
        prenume: "",
        pozaProfil: ""
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

    // Paginare
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10;

    useEffect(() => {
        const userId = localStorage.getItem("utilizator_id");

        if (userId) {
            // Obține datele utilizatorului
            fetch(`http://localhost:3000/profil/${userId}`)
                .then(res => res.json())
                .then(data => {
                    setUser({
                        nume: data.nume,
                        prenume: data.prenume,
                        pozaProfil: data.pozaProfil || "/images/default-avatar.jpg"
                    });
                });

            // Obține împrumuturile curente
            fetch(`http://localhost:3000/imprumuturi-curente-utilizator/${userId}`)
                .then(res => res.json())
                .then(data => setCartiImprumutate(data))
                .catch(err => console.error("Eroare la încărcarea împrumuturilor:", err));
        }
    }, []);

    // Paginare logică
    const indexOfLast = currentPage * rowsPerPage;
    const indexOfFirst = indexOfLast - rowsPerPage;
    const currentRows = cartiImprumutate.slice(indexOfFirst, indexOfLast);

    const nextPage = () => {
        if (currentPage < Math.ceil(cartiImprumutate.length / rowsPerPage)) {
            setCurrentPage(prev => prev + 1);
        }
    };

    const prevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(prev => prev - 1);
        }
    };

    const deschidePopupConfirmare = (id) => {
        setIdDeAnulat(id);
        setShowPopupConfirmare(true);
    };
    
    const anuleazaImprumut = async () => {
        try {
            const res = await fetch(`http://localhost:3000/anuleaza-imprumut/${idDeAnulat}`, {
                method: "DELETE"
            });
    
            const data = await res.json();
    
            if (res.ok) {
                // reîncarcă lista de împrumuturi
                const userId = localStorage.getItem("utilizator_id");
                const updated = await fetch(`http://localhost:3000/imprumuturi-curente-utilizator/${userId}`);
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
            const res = await fetch(`http://localhost:3000/intervale-imprumut/${imprumut.exemplarId}`);
            const data = await res.json();
    
            const toateZilele = [];
            data.forEach(impr => {
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
        const durataZile = Math.ceil((endDateObj - startDateObj) / (1000 * 60 * 60 * 24));
    
        if (durataZile > 30) {
            setMesajPrelungire("Durata maximă a unui împrumut este de 30 de zile!");
            setSuccesPrelungire(false);
            return;
        }
    
        const suprapunere = zileIndisponibile.some(date => date >= dataStart && date <= dataEnd);
        if (suprapunere) {
            setMesajPrelungire("Interval indisponibil!");
            setSuccesPrelungire(false);
            return;
        }
    
        try {
            const res = await fetch(`http://localhost:3000/modifica-imprumut/${imprumutSelectat.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ data_returnare: dataEnd })
            });
    
            const data = await res.json();
    
            if (res.ok) {
                setShowPopupPrelungire(false);
                setMesajPrelungire("Prelungire realizată cu succes!");
                setSuccesPrelungire(true);
    
                const userId = localStorage.getItem("utilizator_id");
                const updated = await fetch(`http://localhost:3000/imprumuturi-curente-utilizator/${userId}`);
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

    return (
        <div className="admin-container">
            {/* ======= HEADER ======= */}
            <header className="header">
                <div className="nav-buttons">
                    <button className="nav-button" onClick={() => navigate("/client")}>Explorează</button>
                    <button className="nav-button">Recomandate</button>
                    <button className="nav-button" onClick={() => navigate("/imprumuturi-curente")}>Împrumuturi curente</button>
                    <button className="nav-button" onClick={() => navigate("/istoric")}>Istoric</button>
                </div>

                <div className="right-buttons">
                     <p className="user-info">Bun venit, {user.nume} {user.prenume}!</p>
                     <img
                        src="/images/favorite.png"
                        alt="Favorite"
                        className="icon-button favorite-icon"
                        onClick={() => navigate("/favorite")}
                    />
                    <img
                    src={
                        user.pozaProfil
                            ? user.pozaProfil.startsWith("/uploads")
                                ? `http://localhost:3000${user.pozaProfil}`
                                : user.pozaProfil
                            : "/images/default-avatar.jpg"
                    }
                    alt="Poza de profil"
                    className="profile-img-small"
                    onClick={() => navigate("/profil-client")}
                    />
                </div>
            </header>

            {/* ======= TABEL CĂRȚI ÎMPRUMUTATE ======= */}
            <div className="user-table-container">
                <h2>Împrumuturile mele curente</h2>
                <table className="user-table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Titlu</th>
                        <th>Autor</th>
                        <th>Data Împrumut</th>
                        <th>Data Returnare</th>
                        {currentRows.length > 0 && <th>Status</th>}
                        <th>Acțiune</th>
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
                        <tr key={carte.id}>
                            <td>{indexOfFirst + index + 1}</td>
                            <td>{carte.titlu}</td>
                            <td>{carte.autor}</td>
                            <td>{new Date(carte.dataImprumut).toLocaleDateString()}</td>
                            <td>{new Date(carte.dataReturnare).toLocaleDateString()}</td>
                            <td>{carte.status}</td>
                            <td>
                                {carte.status === "în așteptare" ? (
                                    <button className="btnAnuleazaImprumut" onClick={() => deschidePopupConfirmare(carte.id)}>
                                        Anulează
                                    </button>
                                ) : (
                                    <button className="btnPrelungesteImprumut" onClick={() => deschidePopupPrelungire(carte)}>
                                        Prelungește
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))
                )}
                    </tbody>
                </table>

                {/* POPUP CONFIRMARE ANULARE */}
                {showPopupConfirmare && (
                    <div className="popup-overlay">
                        <div className="popup-content">
                            <p>Sunteți sigur că doriți anularea împrumutului?</p>
                            <div className="popup-buttons">
                                <button id="btnDa" onClick={anuleazaImprumut}>DA</button>
                                <button id="btnNu" onClick={inchidePopup}>NU</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* POPUP SUCCES */}
                {showPopupSucces && (
                    <div className="floating-success">
                        Anulare efectuată cu succes!
                    </div>
                )}

                {/* Navigare pagini */}
                <div className="pagination">
                    <button onClick={prevPage} disabled={currentPage === 1}>◀</button>
                    <span>
                        Pagina {currentPage} din {Math.max(1, Math.ceil(cartiImprumutate.length / rowsPerPage))}
                    </span>
                    <button
                        onClick={nextPage}
                        disabled={currentPage === Math.max(1, Math.ceil(cartiImprumutate.length / rowsPerPage))}
                    >
                        ▶
                    </button>
                </div>
            </div>

            {showPopupPrelungire && (
                <div className="popup-prelungire">
                    <div className="popup-content">
                        <h3>Prelungire Împrumut</h3>
                        <p><strong>Data început:</strong> {imprumutSelectat.dataImprumut.slice(0, 10)}</p>
                        <label>Noua dată de returnare:</label>
                        <input
                            type="date"
                            value={dataNouaFinal}
                            onChange={(e) => setDataNouaFinal(e.target.value)}
                            min={imprumutSelectat.dataImprumut.slice(0, 10)}
                        />
                        <p className="info-indisponibil">
                            Zile indisponibile: {zileIndisponibile.length ? zileIndisponibile.join(", ") : "None"}
                        </p>
                        <div className="popup-buttons">
                            <button id="btnConfirmaPrelungire" onClick={confirmaPrelungire}>Confirmă</button>
                            <button id="btnAnuleazaPrelungire" onClick={() => setShowPopupPrelungire(false)}>Anulează</button>
                        </div>
                    </div>
                </div>
            )}

            {mesajPrelungire && (
                <div className={succesPrelungire ? "floating-success" : "floating-error"}>
                    {mesajPrelungire}
                </div>
            )}
        </div>
    );
}

export default ImprumuturiClient;