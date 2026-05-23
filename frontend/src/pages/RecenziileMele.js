import React, { useState, useEffect } from "react";
import "./RecenziileMele.css";
import { FaRegClipboard, FaEdit, FaTrash } from "react-icons/fa";
import axios from "axios";

const RecenziileMele = () => {
  const [tab, setTab] = useState("gata");
  const [recenziiGata, setRecenziiGata] = useState([]);
  const [recenziiTrimise, setRecenziiTrimise] = useState([]);
  const [loading, setLoading] = useState(true);
  const [prestatorSelectat, setPrestatorSelectat] = useState(null);
  const [rating, setRating] = useState(0);
  const [comentariu, setComentariu] = useState("");

  const [editareActiva, setEditareActiva] = useState(null);
  const [comentariuEditat, setComentariuEditat] = useState("");
  const [ratingEditat, setRatingEditat] = useState(0);

  const user = JSON.parse(localStorage.getItem("utilizator"));

  useEffect(() => {
    const incarcaDate = async () => {
      setLoading(true);
      try {
        const resGata = await fetch(`/api/reviews/gata/${user.id}`);
        const dataGata = await resGata.json();
        setRecenziiGata(dataGata);

        const resTrimise = await fetch(`/api/reviews/trimise/${user.id}`);
        const dataTrimise = await resTrimise.json();
        setRecenziiTrimise(dataTrimise);
      } catch (err) {
        console.error("Eroare la încărcarea recenziilor:", err);
      }
      setLoading(false);
    };

    incarcaDate();
  }, []);

  const trimiteRecenzie = async () => {
    try {
      await axios.post("/api/reviews", {
        clientId: user.id,
        prestatorId: prestatorSelectat.id,
        rezervareId: prestatorSelectat.rezervare_id,
        rating,
        comment: comentariu,
      });

      setPrestatorSelectat(null);
      setRating(0);
      setComentariu("");

      const actualizat = recenziiGata.filter((p) => p.id !== prestatorSelectat.id);
      setRecenziiGata(actualizat);

      const resTrimise = await fetch(`/api/reviews/trimise/${user.id}`);
      const dataTrimise = await resTrimise.json();
      setRecenziiTrimise(dataTrimise);
    } catch (err) {
      console.error("Eroare la trimiterea recenziei:", err);
    }
  };

  const stergeRecenzie = async (recenzieId) => {
    try {
      await axios.delete(`/api/reviews/${recenzieId}`);
      setRecenziiTrimise((prev) => prev.filter((r) => r.id !== recenzieId));
    } catch (err) {
      console.error("Eroare la ștergerea recenziei:", err);
    }
  };

  const salveazaEditare = async (recenzieId) => {
    try {
      await axios.put(`/api/reviews/${recenzieId}`, {
        rating: ratingEditat,
        comment: comentariuEditat,
      });
      const resTrimise = await fetch(`/api/reviews/trimise/${user.id}`);
      const dataTrimise = await resTrimise.json();
      setRecenziiTrimise(dataTrimise);
      setEditareActiva(null);
    } catch (err) {
      console.error("Eroare la actualizarea recenziei:", err);
    }
  };

  return (
    <div className="recenzii-container">
      <h2 className="recenzii-title">Recenziile mele</h2>
      <div className="recenzii-tab-buttons">
        <button
          className={`recenzii-tab ${tab === "gata" ? "active" : ""}`}
          onClick={() => setTab("gata")}
        >
          Gata de recenzie ({recenziiGata.length})
        </button>
        <button
          className={`recenzii-tab ${tab === "are" ? "active" : ""}`}
          onClick={() => setTab("are")}
        >
          Ai recenzii ({recenziiTrimise.length})
        </button>
      </div>

      <div className="recenzii-tab-content">
        {loading ? (
          <p>Se încarcă...</p>
        ) : tab === "gata" && recenziiGata.length === 0 ? (
          <div className="recenzii-empty-state">
            <FaRegClipboard className="recenzii-empty-icon" />
            <h3>Nu ai nicio recenzie</h3>
            <p>Nu ai sesiuni finalizate sau toate recenziile au fost deja trimise.</p>
          </div>
        ) : tab === "gata" ? (
          <ul className="lista-recenzii">
            {recenziiGata.map((prestator) => (
              <li key={prestator.rezervare_id} className="card-recenzii">
                <img
                  src={prestator.imagineProfil || "/placeholder.jpg"}
                  alt={prestator.nume}
                />
                <div className="info">
                  <p><strong>{prestator.nume}</strong></p>
                  <button
                    className="btn-recenzie"
                    onClick={() => setPrestatorSelectat(prestator)}
                  >
                    Lasă recenzie
                  </button>
                  {prestatorSelectat?.id === prestator.id && (
                    <div className="formular-recenzie">
                      <div className="stele">
                        {[1, 2, 3, 4, 5].map((val) => (
                          <span
                            key={val}
                            onClick={() => setRating(val)}
                            className={rating >= val ? "selected" : ""}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      <textarea
                        value={comentariu}
                        onChange={(e) => setComentariu(e.target.value)}
                        placeholder="Scrie un comentariu..."
                      ></textarea>
                      <button onClick={trimiteRecenzie}>Trimite recenzie</button>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : recenziiTrimise.length === 0 ? (
          <div className="recenzii-empty-state">
            <FaRegClipboard className="recenzii-empty-icon" />
            <h3>Nu ai nicio recenzie</h3>
            <p>Nu ai recenzii finalizate sau toate recenziile au fost șterse.</p>
          </div>
        ) : (
          <ul className="lista-recenzii">
            {recenziiTrimise.map((recenzie) => (
              <li key={recenzie.id} className="card-recenzii complet">
                <div className="recenzie-header">
                  <img
                    src={recenzie.imagineProfil || "/placeholder.jpg"}
                    alt={recenzie.nume}
                    className="avatar-profil"
                  />
                  <div className="detalii-nume">
                    <strong>{recenzie.nume}</strong>
                    <span className="data-recenzie">
                      {new Date(recenzie.data_recenzie).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {editareActiva === recenzie.id ? (
                  <>
                    <div className="stele">
                      {[1, 2, 3, 4, 5].map((val) => (
                        <span
                          key={val}
                          onClick={() => setRatingEditat(val)}
                          className={ratingEditat >= val ? "selected" : ""}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <textarea
                      value={comentariuEditat}
                      onChange={(e) => setComentariuEditat(e.target.value)}
                    />
                    <button onClick={() => salveazaEditare(recenzie.id)}>Salvează</button>
                    <button onClick={() => setEditareActiva(null)}>Anulează</button>
                  </>
                ) : (
                  <>
                    <div className="rating">
                      {"★".repeat(recenzie.rating)}{"☆".repeat(5 - recenzie.rating)}
                    </div>
                    <p className="text-recenzie">„{recenzie.text}”</p>
                    <div className="actiuni-recenzie">
                      <button
                        className="icon-btn"
                        title="Editează"
                        onClick={() => {
                          setEditareActiva(recenzie.id);
                          setRatingEditat(recenzie.rating);
                          setComentariuEditat(recenzie.text);
                        }}
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="icon-btn"
                        title="Șterge"
                        onClick={() => stergeRecenzie(recenzie.id)}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default RecenziileMele;
