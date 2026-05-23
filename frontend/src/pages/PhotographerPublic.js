import React, { useState, useEffect } from "react";
import "./PhotographerProfile.css";
import { FaCalendarAlt, FaUserCircle, FaEnvelope } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const PhotographerPublic = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [tooltip, setTooltip] = useState("");
  const [prestator, setPrestator] = useState(null);
  const [albume, setAlbume] = useState([]);
  const [rating, setRating] = useState(0);

  useEffect(() => {
    // Preluare date prestator
    axios.get(`http://localhost:5000/api/utilizatori/profile/${id}`)
      .then(res => setPrestator(res.data))
      .catch(err => console.error("Eroare la preluarea prestatorului:", err));

    // Preluare albume publice
    axios.get(`http://localhost:5000/api/albume/public/${id}`)
      .then(res => {
        const albumeReale = res.data.map(album => ({
          ...album,
          poze: album.poze ? album.poze.split(",") : []
        }));
        setAlbume(albumeReale);
      })
      .catch(err => console.error("Eroare la albume:", err));

    // Preluare rating
    axios.get(`http://localhost:5000/api/reviews/average/${id}`)
      .then(res => setRating(res.data.averageRating))
      .catch(err => console.error("Eroare la rating:", err));
  }, [id]);

  if (!prestator) return null;

  return (
    <div className="profile-container">
      {/* Icon calendar */}
      <div className="top-right-icons">
        <div
          className="icon-wrapper"
          onMouseEnter={() => setTooltip("calendar")}
          onMouseLeave={() => setTooltip("")}
          onClick={() => navigate(`/rezervare/${id}`)}

        >
          <FaCalendarAlt className="profile-icon" />
          {tooltip === "calendar" && <span className="tooltip">Calendar</span>}
        </div>
      </div>

      {/* Informații prestator */}
      <div className="profile-info">
        <div className="profile-image-container">
          {prestator.imagineProfil ? (
            <img src={prestator.imagineProfil} alt="Profil" className="profile-image" />
          ) : (
            <FaUserCircle className="profile-image-placeholder" />
          )}
        </div>

        <h2 className="profile-name">{prestator.nume}</h2>
        <p className="profile-rating icon-wrapper">
          {rating.toFixed(1)}{" "}
          <span
            className="stars"
            style={{
              cursor: "pointer",
              color: rating > 0 ? "#f0ad4e" : "#ccc"
            }}
            onClick={() => navigate(`/reviews/${id}`)}
          >
            {"★".repeat(Math.round(rating))}{'☆'.repeat(5 - Math.round(rating))}
          </span>
        </p>
        <p className="profile-role">{prestator.tip_serviciu}</p>
        <p className="profile-location">{prestator.locatie}</p>

        {/* Butoane acțiuni */}
        <div className="profile-actions">
          <button className="profile-btn" onClick={() => navigate(`/messages/${id}`)}>
            <FaEnvelope /> Scrie mesaj
          </button>
          <button className="profile-btn" onClick={() => navigate(`/servicii/${id}`)}>
            Servicii
          </button>
        </div>
      </div>

      {/* Albume */}
      <div className="albums-wrapper">
        {albume.length === 0 ? (
          <p className="empty-text">Nu există albume disponibile.</p>
        ) : (
          albume.map((album, index) => (
            <div
              key={index}
              className="album-wrapper"
              onClick={() => navigate(`/profile/album/${album.id}`)}
            >
              <div className="album-card">
                {album.poze[0] ? (
                  <img
                    src={`http://localhost:5000/uploads/${album.poze[0]}`}
                    alt={`Album ${album.titlu}`}
                    className="album-thumbnail"
                  />
                ) : (
                  <div className="album-placeholder">Album fără poze</div>
                )}
              </div>
              <p className="album-title">{album.titlu}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PhotographerPublic;
