import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../aspect/Utilizatori.css";
import HeaderAdmin from "./HeaderAdmin";

function Utilizatori() {
  const navigate = useNavigate();
  const [utilizatori, setUtilizatori] = useState([]);
  const [menuOpen, setMenuOpen] = useState(null);
  const [user, setUser] = useState({
    nume: "",
    prenume: "",
  });
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null); // pentru a păstra ID-ul utilizatorului de șters
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;
  const [showPopupCod, setShowPopupCod] = useState(false);
  const [codImprumut, setCodImprumut] = useState("");
  const [showPopupConfirmare, setShowPopupConfirmare] = useState(false);
  const [mesajEroareCod, setMesajEroareCod] = useState("");
  const [detaliiImprumut, setDetaliiImprumut] = useState(null);

  // Fetch utilizatori din baza de date
  useEffect(() => {
    fetch("http://localhost:3000/conturi")
      .then((res) => res.json())
      .then((data) => {
        setUtilizatori(data);
      })
      .catch((error) =>
        console.error("Eroare la încărcarea utilizatorilor:", error)
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

  // Funcție pentru ștergerea utilizatorului
  const handleDelete = (id) => {
    fetch(`http://localhost:3000/sterge-cont/${id}`, {
      method: "DELETE",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.message === "Cont șters cu succes!") {
          const loggedInUserId = localStorage.getItem("utilizator_id");

          // Dacă utilizatorul șters este cel logat
          if (String(id) === loggedInUserId) {
            localStorage.clear(); // curăță toate datele
            navigate("/", { replace: true }); // redirect către pagina de start
            return;
          }

          // Dacă e alt utilizator, actualizează lista
          setUtilizatori((prevUtilizatori) =>
            prevUtilizatori.filter((utilizator) => utilizator.id !== id)
          );
          setShowConfirmModal(false);
        } else {
          alert("Eroare la ștergerea utilizatorului!");
          setShowConfirmModal(false);
        }
      })
      .catch((error) => {
        console.error("Eroare la ștergerea utilizatorului:", error);
      });
  };

  // Funcție pentru confirmarea ștergerii
  const confirmDelete = (id) => {
    setUserToDelete(id);
    setShowConfirmModal(true);
  };

  // Funcție pentru anularea ștergerii
  const cancelDelete = () => {
    setShowConfirmModal(false);
    setUserToDelete(null);
  };

  // Calculul utilizatorilor de afișat pe baza paginii curente
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = utilizatori.slice(indexOfFirstUser, indexOfLastUser);

  // Funcții de navigare între pagini
  const nextPage = () => {
    if (currentPage < Math.ceil(utilizatori.length / usersPerPage)) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

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
    <div className="utilizatori-container">
      {/* ======= HEADER ======= */}
      <HeaderAdmin />

      {/* ======= TABEL UTILIZATORI ======= */}
      <div className="utilizatori-subcontainer">
        <h2>Lista Utilizatorilor</h2>
        <table className="utilizatori-table">
          <thead>
            <tr>
              <th>Tip</th>
              <th>Nume</th>
              <th>Prenume</th>
              <th>Adresă e-mail</th>
              <th>Istoric</th>
              <th>Șterge utilizator</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.map((utilizator) => (
              <tr key={utilizator.id}>
                <td>
                  {utilizator.tip === "administrator" ? "Admin" : "Client"}
                </td>
                <td>{utilizator.nume}</td>
                <td>{utilizator.prenume}</td>
                <td>{utilizator.email}</td>
                <td>
                  <button
                    className="istoric-button"
                    onClick={() =>
                      navigate(`/istoric-utilizator/${utilizator.id}`)
                    }
                  >
                    Istoric
                  </button>
                </td>
                <td>
                  <button
                    className="delete-button"
                    onClick={() => confirmDelete(utilizator.id)}
                  >
                    Șterge utilizator
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de confirmare pentru ștergerea utilizatorului */}
      {showConfirmModal && (
        <div className="confirm-stergere-utilizator">
          <div className="content-stergere-utilizator">
            <h3>Confirmă ștergerea utilizatorului</h3>
            <p>Vrei să ștergi acest utilizator?</p>
            <button
              className="confirm-sterge-utilizator"
              onClick={() => handleDelete(userToDelete)}
            >
              Da, șterge
            </button>
            <button className="cancel-sterge-utilizator" onClick={cancelDelete}>
              Anulează
            </button>
          </div>
        </div>
      )}

      {/* Butoane de navigare pentru pagini */}
      <div className="pagination-container-admin">
        {currentPage > 1 && (
          <button
            className="pagination-prev"
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            &laquo;
          </button>
        )}

        {Array.from(
          { length: Math.ceil(utilizatori.length / usersPerPage) },
          (_, i) => i + 1
        )
          .filter((pagina) => {
            const totalPages = Math.ceil(utilizatori.length / usersPerPage);
            if (totalPages <= 5) return true;
            if (
              pagina === 1 ||
              pagina === totalPages ||
              Math.abs(pagina - currentPage) <= 1
            )
              return true;
            if (pagina === currentPage - 2 || pagina === currentPage + 2)
              return "dots";
            return false;
          })
          .map((pagina, i, arr) => {
            if (pagina === "dots") {
              return (
                <span key={`dots-${i}`} className="pagination-dots">
                  ...
                </span>
              );
            }

            if (
              i > 0 &&
              typeof pagina === "number" &&
              typeof arr[i - 1] === "number" &&
              pagina - arr[i - 1] > 1
            ) {
              return (
                <React.Fragment key={pagina}>
                  <span className="pagination-dots">...</span>
                  <button
                    className={`pagination-number ${
                      pagina === currentPage ? "active" : ""
                    }`}
                    onClick={() => setCurrentPage(pagina)}
                  >
                    {pagina}
                  </button>
                </React.Fragment>
              );
            }

            return (
              <button
                key={pagina}
                className={`pagination-number ${
                  pagina === currentPage ? "active" : ""
                }`}
                onClick={() => setCurrentPage(pagina)}
              >
                {pagina}
              </button>
            );
          })}

        {currentPage < Math.ceil(utilizatori.length / usersPerPage) && (
          <button
            className="pagination-next"
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            &raquo;
          </button>
        )}
      </div>
    </div>
  );
}

export default Utilizatori;
