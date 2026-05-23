import React, { useState, useEffect } from "react";
import "./PhotographerProfile.css";
import { FaCalendarAlt, FaPlus, FaCog, FaUserCircle, FaUpload} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";


const PhotographerProfile = () => {
  const navigate = useNavigate();
  const [tooltip, setTooltip] = useState("");
  const [utilizator, setUtilizator] = useState(null);
  const [albume, setAlbume] = useState([]);
  const [rating, setRating] = useState(0);  // pentru media reală a ratingului


  useEffect(() => {
    const user = localStorage.getItem("utilizator");
    if (user) {
      setUtilizator(JSON.parse(user));
    

        axios.get(`http://localhost:5000/api/reviews/average/${JSON.parse(user).id}`)
    .then(res => setRating(res.data.averageRating))
    .catch(err => console.error("Eroare la preluarea ratingului:", err));

      // Simulăm albume (pe viitor vor fi preluate din backend)
      // Preluăm albumele reale din backend
axios
  .get(`http://localhost:5000/api/albume/by-user/${JSON.parse(user).id}`)
  .then((res) => {
    // Convertim poze din string în array
    const albumeReale = res.data.map((album) => ({
      ...album,
      poze: album.poze ? album.poze.split(",") : []
    }));
    setAlbume(albumeReale);
  })
  .catch((err) => {
    console.error("Eroare la preluarea albumelor:", err);
  });




    } else {
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("utilizator");
    navigate("/login");
  };

  if (!utilizator) return null;

  return (
    <div className="profile-container">
      {/* Iconițele din colț dreapta */}
      <div className="top-right-icons">
        <div
          className="icon-wrapper"
          onMouseEnter={() => setTooltip("calendar")}
          onMouseLeave={() => setTooltip("")}
        >
          <FaCalendarAlt
            className="profile-icon"
            onClick={() => navigate("/profile/calendar")}
          />
          {tooltip === "calendar" && <span className="tooltip">Calendarul meu</span>}
        </div>

        <div
          className="icon-wrapper"
          onMouseEnter={() => setTooltip("plus")}
          onMouseLeave={() => setTooltip("")}
        >
          <FaPlus
            className="profile-icon"
            onClick={() => navigate("/profile/add-album")}
          />
          {tooltip === "plus" && <span className="tooltip">Adaugă album</span>}
        </div>
      </div>

    <div
  className="icon-wrapper"
  onMouseEnter={() => setTooltip("upload")}
  onMouseLeave={() => setTooltip("")}
>
  <FaUpload
    className="profile-icon"
    onClick={() => navigate("/upload-files")}
  />
  {tooltip === "upload" && <span className="tooltip">Trimite fișiere</span>}
</div>




      {/* Secțiunea de profil */}
      <div className="profile-info">
        <div className="profile-image-container">
          {utilizator.imagineProfil ? (
            <img src={utilizator.imagineProfil} alt="Profil" className="profile-image" />
          ) : (
            <FaUserCircle className="profile-image-placeholder" />
          )}

          <label htmlFor="upload-profile-image" className="profile-image-upload-btn">
            <FaPlus />
          </label>


         {/* Imagine profil */}
          <input
  id="upload-profile-image"
  type="file"
  accept="image/*"
  onChange={async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const formData = new FormData();
        formData.append("imagineProfil", file);
        const res = await axios.post(`http://localhost:5000/api/utilizatori/upload-profile/${utilizator.id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        const updated = { ...utilizator, imagineProfil: res.data.imagineProfil };
        localStorage.setItem("utilizator", JSON.stringify(updated));
        setUtilizator(updated);
      } catch (err) {
        console.error("Eroare la upload imagine:", err);
      }
    }
  }}
  style={{ display: "none" }}
/>




        </div>
        <h2 className="profile-name">{utilizator.nume}</h2>

        <p className="profile-rating icon-wrapper">
  {rating.toFixed(1)}{" "}
  <span
    className="stars"
    style={{
      cursor: 'pointer',
      color: rating > 0 ? '#f0ad4e' : '#ccc'
    }}
    onClick={() => navigate(`/reviews/${utilizator.id}`)}
  >
    {'★'.repeat(Math.round(rating))}{'☆'.repeat(5 - Math.round(rating))}
  </span>
</p>



        <p className="profile-role">{utilizator.tip_serviciu}</p>
        <p className="profile-location">{utilizator.locatie}</p>

        <div className="profile-actions">
          <button className="profile-btn" onClick={() => navigate("/profile/edit")}>
            Editează profilul
          </button>
          <button className="profile-btn" onClick={() => navigate("/profile/prices")}>
            Servicii
          </button>
        </div>
      </div>






      {/* Albume */}
<div className="albums-wrapper">
  {albume.length === 0 ? (
    <div className="empty-albums-message">
      <FaPlus className="big-plus-icon" />
      <p className="empty-text">
        Fotografiile și videourile postate vor apărea în profil
      </p>
    </div>
  ) : (
    albume.map((album, index) => (
      <div key={index} className="album-wrapper" onClick={() => navigate(`/profile/album/${album.id}`)}>
    <div className="album-card">

    {album.poze && album.poze[0] ? (
  <img src={`http://localhost:5000/uploads/${album.poze[0]}`} alt={`Album ${album.titlu}`} className="album-thumbnail" />
) : (
  <div className="album-placeholder">Album fără poze</div>
)}


  </div>
  <p className="album-title">{album.titlu}</p>
</div>
    ))


  )}
</div>








      {/* Iconița pentru setări */}
      <div
        className="settings-icon"
        onMouseEnter={() => setTooltip("setari")}
        onMouseLeave={() => setTooltip("")}
      >
        <FaCog />
        {tooltip === "setari" && (
          <span className="tooltip-setari">Setări cont</span>
        )}
      </div>
    </div>
  );
};

export default PhotographerProfile;
