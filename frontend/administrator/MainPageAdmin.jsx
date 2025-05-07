import React, { useState, useEffect } from "react";
import "../aspect/MainPageAdmin.css";
import HeaderAdmin from "./HeaderAdmin";
import { useNavigate } from "react-router-dom";
import { Bar, Pie, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

function MainPageAdmin() {
  const navigate = useNavigate();
  const [cheltuieli, setCheltuieli] = useState([]);
  const [genuri, setGenuri] = useState([]);
  const [imprumuturi, setImprumuturi] = useState([]);
  const [utilizatori, setUtilizatori] = useState([]);
  const [tipCheltuieli, setTipCheltuieli] = useState([]);
  const [taxeLunare, setTaxeLunare] = useState([]);
  const [menuOpen, setMenuOpen] = useState(null);
  const [user, setUser] = useState({
    nume: "",
    prenume: "",
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
      .then((res) => res.json())
      .then((data) => {
        setCheltuieli(data.cheltuieli);
        setGenuri(data.genuri);
        setImprumuturi(data.imprumuturi);
        setUtilizatori(data.utilizatori);
        setTipCheltuieli(data.tipCheltuieli);
        setTaxeLunare(data.taxeLunare);
      })
      .catch((error) =>
        console.error("Eroare la încărcarea statisticilor:", error)
      );

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
  }, []);

  //sa se inchida meniul dropdown din cadrul header-ului
  useEffect(() => {
    const handleClickOutsideDropdown = (e) => {
      if (
        !e.target.closest(".dropdown") &&
        !e.target.closest(".dropdown-menu")
      ) {
        setMenuOpen(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutsideDropdown);
    return () =>
      document.removeEventListener("mousedown", handleClickOutsideDropdown);
  }, []);

  const verificaCod = async () => {
    try {
      const res = await fetch(
        `http://localhost:3000/verifica-cod/${codImprumut}`
      );
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
    <div className="admin-container">
      {/* ======= HEADER ======= */}
      <HeaderAdmin />

      {/* ======= GRID CU STATISTICI ======= */}
      <div className="dashboard-grid">
        {/* Cheltuieli lunare */}
        <div className="chart-container">
          <h3>Cheltuieli lunare</h3>
          <Bar
            data={{
              labels: cheltuieli.map((c) => c.luna),
              datasets: [
                {
                  label: "Cheltuieli (RON)",
                  data: cheltuieli.map((c) => c.total),
                  backgroundColor: "rgba(75, 192, 192, 0.6)",
                  borderRadius: 8,
                  borderSkipped: false,
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: "top",
                  labels: {
                    font: { size: 14 },
                    color: "#444",
                  },
                },
                tooltip: {
                  backgroundColor: "#fff",
                  titleColor: "#000",
                  bodyColor: "#000",
                  borderColor: "#ccc",
                  borderWidth: 1,
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    stepSize: 5,
                    color: "#333",
                    font: { size: 12 },
                  },
                  grid: {
                    color: "rgba(0, 0, 0, 0.05)",
                  },
                },
                x: {
                  ticks: {
                    color: "#333",
                    font: { size: 12 },
                  },
                  grid: {
                    display: false,
                  },
                },
              },
            }}
          />
        </div>

        {/* Taxe întârziere lunare */}
        <div className="chart-container">
          <h3>Taxe de întârziere plătite</h3>
          <Line
            data={{
              labels: taxeLunare.map((t) => `Luna ${t.luna}`),
              datasets: [
                {
                  label: "Taxe plătite (RON)",
                  data: taxeLunare.map((t) => t.total),
                  fill: false,
                  borderColor: "#4bc0c0",
                  backgroundColor: "#4bc0c0",
                  tension: 0.3,
                  pointRadius: 4,
                  pointHoverRadius: 6,
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  display: true,
                  position: "top",
                  labels: {
                    font: { size: 14 },
                    color: "#444",
                  },
                },
                tooltip: {
                  backgroundColor: "#fff",
                  titleColor: "#000",
                  bodyColor: "#000",
                  borderColor: "#ccc",
                  borderWidth: 1,
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    color: "#444",
                  },
                  grid: {
                    color: "rgba(0,0,0,0.05)",
                  },
                },
                x: {
                  ticks: {
                    color: "#444",
                  },
                  grid: {
                    display: false,
                  },
                },
              },
            }}
          />
        </div>

        {/* Împrumuturi lunare */}
        <div className="chart-container">
          <h3>Împrumuturi lunare</h3>
          <Bar
            data={{
              labels: imprumuturi.map((i) => i.luna),
              datasets: [
                {
                  label: "Împrumuturi",
                  data: imprumuturi.map((i) => i.numar),
                  backgroundColor: "rgba(255, 159, 64, 0.8)",
                  borderRadius: 6,
                  borderSkipped: false,
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  display: true,
                  position: "top",
                  labels: {
                    font: { size: 14 },
                    color: "#444",
                  },
                },
                tooltip: {
                  backgroundColor: "#fff",
                  titleColor: "#000",
                  bodyColor: "#000",
                  borderColor: "#ccc",
                  borderWidth: 1,
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    color: "#444",
                  },
                  grid: {
                    color: "rgba(0,0,0,0.05)",
                  },
                },
                x: {
                  ticks: {
                    color: "#444",
                  },
                  grid: {
                    display: false,
                  },
                },
              },
            }}
          />
        </div>

        {/* Utilizatori noi lunari */}
        <div className="chart-container">
          <h3>Utilizatori noi lunari</h3>
          <Bar
            data={{
              labels: utilizatori.map((u) => u.luna),
              datasets: [
                {
                  label: "Utilizatori noi",
                  data: utilizatori.map((u) => u.numar),
                  backgroundColor: "rgba(54, 162, 235, 0.75)",
                  borderRadius: 6,
                  borderSkipped: false,
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  display: true,
                  position: "top",
                  labels: {
                    color: "#444",
                    font: { size: 14 },
                  },
                },
                tooltip: {
                  backgroundColor: "#fff",
                  titleColor: "#000",
                  bodyColor: "#000",
                  borderColor: "#ccc",
                  borderWidth: 1,
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    color: "#444",
                  },
                  grid: {
                    color: "rgba(0,0,0,0.05)",
                  },
                },
                x: {
                  ticks: {
                    color: "#444",
                  },
                  grid: {
                    display: false,
                  },
                },
              },
            }}
          />
        </div>

        {/* Tipuri de cheltuieli */}
        <div className="chart-container">
          <h3>Tipuri de cheltuieli</h3>
          <Pie
            data={{
              labels: tipCheltuieli.map((t) => t.tip),
              datasets: [
                {
                  data: tipCheltuieli.map((t) => t.numar),
                  backgroundColor: [
                    "#f06292",
                    "#ba68c8",
                    "#64b5f6",
                    "#81c784",
                    "#ffd54f",
                  ],
                  borderColor: "#fff",
                  borderWidth: 2,
                },
              ],
            }}
            options={{
              plugins: {
                legend: {
                  position: "top",
                  labels: {
                    color: "#333",
                    font: { size: 14 },
                  },
                },
                tooltip: {
                  callbacks: {
                    label: (context) => {
                      const total = context.dataset.data.reduce(
                        (a, b) => a + b,
                        0
                      );
                      const value = context.raw;
                      const percentage = ((value / total) * 100).toFixed(1);
                      return `${context.label}: ${value} (${percentage}%)`;
                    },
                  },
                },
              },
            }}
          />
        </div>

        {/* Popularitatea genurilor literare */}
        <div className="chart-container">
          <h3>Popularitatea genurilor</h3>
          <Pie
            data={{
              labels: genuri.map((g) => g.gen),
              datasets: [
                {
                  data: genuri.map((g) => g.numar),
                  backgroundColor: [
                    "#FFB6B9",
                    "#FDE2E4",
                    "#B5EAD7",
                    "#C7CEEA",
                    "#FFDAC1",
                    "#E2F0CB",
                    "#FFABAB",
                    "#D5AAFF",
                  ],
                  borderColor: "#fff",
                  borderWidth: 2,
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: "bottom",
                  labels: {
                    font: { size: 13 },
                    color: "#333",
                    padding: 10,
                  },
                },
                tooltip: {
                  callbacks: {
                    label: function (context) {
                      const label = context.label || "";
                      const value = context.parsed;
                      return `${label}: ${value} cărți`;
                    },
                  },
                  backgroundColor: "#fff",
                  titleColor: "#000",
                  bodyColor: "#000",
                  borderColor: "#ccc",
                  borderWidth: 1,
                },
              },
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
              <button id="btnOkCod" onClick={verificaCod}>
                OK
              </button>
              <button
                id="btnAnuleazaCod"
                onClick={() => setShowPopupCod(false)}
              >
                Anulează
              </button>
            </div>
          </div>
          {mesajEroareCod && (
            <div className="floating-error">{mesajEroareCod}</div>
          )}
        </div>
      )}

      {/* ====== POPUP CONFIRMARE IMPRUMUT ====== */}
      {showPopupConfirmare && detaliiImprumut && (
        <div className="popup-overlay-confirmare">
          <div className="popup-content">
            <p>
              <strong>Cod corect!</strong>
            </p>
            <p>
              A se elibera cartea: <strong>{detaliiImprumut.titlu}</strong>,
              exemplarul ID <strong>{detaliiImprumut.exemplar_id}</strong>
            </p>
            <div className="popup-buttons">
              <button id="btnEfectuat" onClick={finalizeazaImprumut}>
                Efectuat
              </button>
              <button
                id="btnAnuleaza"
                onClick={() => setShowPopupConfirmare(false)}
              >
                Anulează
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MainPageAdmin;
