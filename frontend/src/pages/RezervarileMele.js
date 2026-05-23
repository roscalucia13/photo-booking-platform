import React, { useState, useEffect } from "react";
import "./RezervarileMele.css";
import { FaCalendarAlt } from "react-icons/fa";

const RezervarileMele = () => {
  const [tab, setTab] = useState("active"); // "active" sau "finalizate"
  const [rezervariActive, setRezervariActive] = useState([]);
  const [sesiuniFinalizate, setSesiuniFinalizate] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("utilizator"));

    const incarcaDate = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/rezervari/finalizate/${user.id}`);
        const data = await res.json();
        setSesiuniFinalizate(data);
        setRezervariActive([]); // de completat mai târziu
      } catch (err) {
        console.error("Eroare la încărcarea sesiunilor:", err);
      }
      setLoading(false);
    };

    incarcaDate();
  }, []);

  return (
    <div className="rezervari-container">
      <h2 className="rezervari-title">Rezervările mele</h2>

      {/* Tab-uri */}
      <div className="tab-buttons">
        <button
          className={tab === "active" ? "tab active" : "tab"}
          onClick={() => setTab("active")}
        >
          Rezervări active ({rezervariActive.length})
        </button>
        <button
          className={tab === "finalizate" ? "tab active" : "tab"}
          onClick={() => setTab("finalizate")}
        >
          Sesiuni finalizate ({sesiuniFinalizate.length})
        </button>
      </div>

      {/* Conținut */}
      <div className="tab-content">
        {loading ? (
          <p>Se încarcă...</p>
        ) : tab === "active" && rezervariActive.length === 0 ? (
          <div className="empty-state">
            <FaCalendarAlt className="empty-icon" />
            <h3>Nu ai nicio rezervare activă</h3>
            <p>Toate rezervările tale finalizate sau anulate vor apărea mai jos.</p>
          </div>
        ) : tab === "finalizate" && sesiuniFinalizate.length === 0 ? (
          <div className="empty-state">
            <FaCalendarAlt className="empty-icon" />
            <h3>Nu ai sesiuni finalizate</h3>
            <p>După ce participi la o sesiune, ea va apărea aici.</p>
          </div>
        ) : (
          <ul className="lista-rezervari">
            {(tab === "finalizate" ? sesiuniFinalizate : rezervariActive).map((rez) => (
              <li key={rez.id} className="card-rezervare">
                <img
                  src={rez.prestator_imagine || "/placeholder.jpg"}
                  alt={rez.prestator_nume}
                />
                <div className="info">
                  <p><strong>{rez.prestator_nume}</strong></p>
                  <p>
  {new Date(rez.data).toLocaleDateString()}
</p>

                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default RezervarileMele;
