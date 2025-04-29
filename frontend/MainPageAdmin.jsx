import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bar, Pie } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from "chart.js";
import "./style.css";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

function MainPageAdmin() {
    const navigate = useNavigate();
    const [cheltuieli, setCheltuieli] = useState([]);
    const [genuri, setGenuri] = useState([]);
    const [imprumuturi, setImprumuturi] = useState([]);
    const [utilizatori, setUtilizatori] = useState([]);
    const [tipCheltuieli, setTipCheltuieli] = useState([]);
    const [menuOpen, setMenuOpen] = useState(null);
    const [user, setUser] = useState({
        nume: "",
        prenume: ""
    });
    const [showPopupCod, setShowPopupCod] = useState(false);
    const [codImprumut, setCodImprumut] = useState("");
    const [showPopupConfirmare, setShowPopupConfirmare] = useState(false);
    const [mesajEroareCod, setMesajEroareCod] = useState("");
    const [detaliiImprumut, setDetaliiImprumut] = useState(null);
    const [filtruLimba, setFiltruLimba] = useState("");

    // Fetch date pentru statistici
    useEffect(() => {
        fetch("http://localhost:3000/statistici")
            .then(res => res.json())
            .then(data => {
                setCheltuieli(data.cheltuieli);
                setGenuri(data.genuri);
                setImprumuturi(data.imprumuturi);
                setUtilizatori(data.utilizatori);
                setTipCheltuieli(data.tipCheltuieli);
            })
            .catch(error => console.error("Eroare la încărcarea statisticilor:", error));

        // Setează datele utilizatorului
        const userId = localStorage.getItem("utilizator_id");
        if (userId) {
            fetch(`http://localhost:3000/profil/${userId}`)
                .then(res => res.json())
                .then(data => {
                    setUser({
                        nume: data.nume,
                        prenume: data.prenume,
                        pozaProfil: data.pozaProfil || "/images/default-avatar.jpg"
                    });
                })
                .catch(err => {
                    console.error("Eroare la obținerea datelor utilizatorului:", err);
                });
        }
    }, []);

    //sa se inchida meniul dropdown din cadrul header-ului
          useEffect(() => {
            const handleClickOutsideDropdown = (e) => {
                if (!e.target.closest('.dropdown') && !e.target.closest('.dropdown-menu')) {
                    setMenuOpen(null);
                }
            };
            document.addEventListener("mousedown", handleClickOutsideDropdown);
            return () => document.removeEventListener("mousedown", handleClickOutsideDropdown);
        }, []);

        const verificaCod = async () => {
            try {
                const res = await fetch(`http://localhost:3000/verifica-cod/${codImprumut}`);
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
                const res = await fetch(`http://localhost:3000/finalizeaza-imprumut/${codImprumut}`, {
                    method: "PUT"
                });
        
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
        <div className="admin-container">
            {/* ======= HEADER ======= */}
            <header className="header">
                <div className="nav-buttons">
                    <button className="nav-button" onClick={() => navigate("/admin")}>Pagina Principală</button>
                    <button className="nav-button" onClick={() => navigate("/carti")}>Cărți</button>
                    <button className="nav-button" onClick={() => navigate("/utilizatori")}>Utilizatori</button>
                    <div className="dropdown">
                    <button className="nav-button" onClick={() => setMenuOpen(menuOpen === 'imprumuturi' ? null : 'imprumuturi')}>
                        Împrumuturi...
                    </button>
                    {menuOpen === 'imprumuturi' && (
                        <div className="dropdown-menu show">
                        <button className="dropdown-item" onClick={() => navigate("/imprumuturi")}>Active</button>
                        <button className="dropdown-item" onClick={() => navigate("/istoric-imprumuturi")}>Istoric</button>
                        </div>
                    )}
                    </div>
                    <div className="dropdown">
                    <button className="nav-button" onClick={() => setMenuOpen(menuOpen === 'adauga' ? null : 'adauga')}>
                    Adaugă...
                </button>
                {menuOpen === 'adauga' && (
                    <div className="dropdown-menu show">
                        <button className="dropdown-item">Cheltuială</button>
                        <button className="dropdown-item" onClick={() => navigate("/adauga-carte")}>Carte</button>
                        <button className="dropdown-item" onClick={() => setShowPopupCod(true)}>Împrumut</button>
                    </div>
                )}
                    </div>
                </div>
                <div className="right-buttons">
                    <p className="user-info">Bun venit, {user.nume} {user.prenume}!</p>
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
                    onClick={() => navigate("/profil-admin")}
                    />
                </div>
            </header>

            {/* ======= GRID CU STATISTICI ======= */}
            <div className="dashboard-grid">
                {/* Cheltuieli lunare */}
                <div className="chart-container">
                    <h3>Cheltuieli lunare</h3>
                    <Bar
                        data={{
                            labels: cheltuieli.map(c => c.luna),
                            datasets: [{
                                label: "Cheltuieli (RON)",
                                data: cheltuieli.map(c => c.total),
                                backgroundColor: "rgba(75, 192, 192, 0.6)"
                            }]
                        }}
                    />
                </div>

                {/* Popularitatea genurilor literare */}
                <div className="chart-container">
                    <h3>Popularitatea genurilor</h3>
                    <Pie
                        data={{
                            labels: genuri.map(g => g.gen),
                            datasets: [{
                                data: genuri.map(g => g.numar),
                                backgroundColor: ["#ff6384", "#36a2eb", "#ffce56", "#4bc0c0", "#9966ff"]
                            }]
                        }}
                    />
                </div>

                {/* Împrumuturi lunare */}
                <div className="chart-container">
                    <h3>Împrumuturi lunare</h3>
                    <Bar
                        data={{
                            labels: imprumuturi.map(i => i.luna),
                            datasets: [{
                                label: "Împrumuturi",
                                data: imprumuturi.map(i => i.numar),
                                backgroundColor: "rgba(255, 159, 64, 0.6)"
                            }]
                        }}
                    />
                </div>

                {/* Utilizatori noi lunari */}
                <div className="chart-container">
                    <h3>Utilizatori noi lunari</h3>
                    <Bar
                        data={{
                            labels: utilizatori.map(u => u.luna),
                            datasets: [{
                                label: "Utilizatori noi",
                                data: utilizatori.map(u => u.numar),
                                backgroundColor: "rgba(54, 162, 235, 0.6)"
                            }]
                        }}
                    />
                </div>

                {/* Tipuri de cheltuieli */}
                <div className="chart-container">
                    <h3>Tipuri de cheltuieli</h3>
                    <Pie
                        data={{
                            labels: tipCheltuieli.map(t => t.tip),
                            datasets: [{
                                data: tipCheltuieli.map(t => t.numar),
                                backgroundColor: ["#ff6384", "#ffce56"]
                            }]
                        }}
                    />
                </div>
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
                            <button id="btnOkCod" onClick={verificaCod}>OK</button>
                            <button id="btnAnuleazaCod" onClick={() => setShowPopupCod(false)}>Anulează</button>
                        </div>
                    </div>
                    {mesajEroareCod && (
                        <div className="floating-error">
                            {mesajEroareCod}
                        </div>
                    )}
                </div>
            )}

            {/* ====== POPUP CONFIRMARE IMPRUMUT ====== */}
            {showPopupConfirmare && detaliiImprumut && (
                <div className="popup-overlay-confirmare">
                    <div className="popup-content">
                        <p><strong>Cod corect!</strong></p>
                        <p>A se elibera cartea: <strong>{detaliiImprumut.titlu}</strong>, exemplarul ID <strong>{detaliiImprumut.exemplar_id}</strong></p>
                        <div className="popup-buttons">
                            <button id="btnEfectuat" onClick={finalizeazaImprumut}>Efectuat</button>
                            <button id="btnAnuleaza" onClick={() => setShowPopupConfirmare(false)}>Anulează</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default MainPageAdmin;