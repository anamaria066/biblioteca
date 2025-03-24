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
    const [menuOpen, setMenuOpen] = useState(false);
    const [user, setUser] = useState({
        nume: "",
        prenume: ""
    });

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

        // Setează numele și prenumele utilizatorului din localStorage
        const nume = localStorage.getItem("nume");
        const prenume = localStorage.getItem("prenume");
        setUser({ nume, prenume });
    }, []);

    return (
        <div className="admin-container">
            {/* ======= HEADER ======= */}
            <header className="header">
                <div className="nav-buttons">
                    <button className="nav-button" onClick={() => navigate("/")}>Pagina Principală</button>
                    <button className="nav-button" onClick={() => navigate("/carti")}>Cărți</button>
                    <button className="nav-button" onClick={() => navigate("/utilizatori")}>Utilizatori</button>
                    <button className="nav-button" onClick={() => navigate("/inregistreaza-imprumut")}>Înregistrează Împrumut</button>
                    <div className="dropdown">
                        <button className="nav-button" onClick={() => setMenuOpen(!menuOpen)}>Adaugă...</button>
                        {menuOpen && (
                            <div className="dropdown-menu">
                                <button className="dropdown-item" onClick={() => navigate("/adauga-cheltuiala")}>Cheltuială</button>
                                <button className="dropdown-item" onClick={() => navigate("/adauga-carte")}>Carte</button>
                            </div>
                        )}
                    </div>
                </div>
                <div className="right-buttons">
                    <p className="user-info">Bun venit, {user.nume} {user.prenume}!</p>
                    <button className="icon-button">👤</button>
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
        </div>
    );
}

export default MainPageAdmin;