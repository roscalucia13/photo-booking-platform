import React, { useEffect, useState } from "react";
import "./UserProfile.css";
import { FaUserCircle, FaCog, FaPlus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const UserProfile = () => {
  const [utilizator, setUtilizator] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [numeNou, setNumeNou] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem("utilizator");
    if (userData) {
      setUtilizator(JSON.parse(userData));
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (file && utilizator) {
      try {
        const formData = new FormData();
        formData.append("imagineProfil", file);

        const res = await axios.post(
          `http://localhost:5000/api/utilizatori/upload-profile/${utilizator.id}`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );

        const updated = { ...utilizator, imagineProfil: res.data.imagineProfil };
        localStorage.setItem("utilizator", JSON.stringify(updated));
        setUtilizator(updated);
      } catch (err) {
        console.error("Eroare la upload imagine:", err);
      }
    }
  };

  const handleSaveName = async () => {
    if (!numeNou.trim()) return;

    try {
      await axios.put(
        `http://localhost:5000/api/utilizatori/update/${utilizator.id}`,
        { nume: numeNou }
      );

      const updated = { ...utilizator, nume: numeNou };
      localStorage.setItem("utilizator", JSON.stringify(updated));
      setUtilizator(updated);
      setEditMode(false);
    } catch (err) {
      console.error("Eroare la actualizarea numelui:", err);
    }
  };

  if (!utilizator) return null;

  return (
    <div className="user-profile-container">
      {/* STÂNGA: datele utilizatorului */}
      <div className="user-info">
        <div className="client-image-container">
          {utilizator.imagineProfil ? (
            <img
              src={utilizator.imagineProfil}
              alt="profil"
              className="client-profile-image"
            />
          ) : (
            <FaUserCircle className="client-profile-placeholder" />
          )}

          <label htmlFor="client-upload-image" className="client-upload-btn">
            <FaPlus />
          </label>
          <input
            id="client-upload-image"
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleUpload}
          />
        </div>

        {editMode ? (
          <>
            <input
              type="text"
              className="edit-nume-input"
              value={numeNou}
              onChange={(e) => setNumeNou(e.target.value)}
              placeholder="Nume nou"
            />
            <button className="user-btn" onClick={handleSaveName}>
              Salvează
            </button>
          </>
        ) : (
          <>
            <h2 className="user-name">{utilizator.nume}</h2>
            <p className="user-email">{utilizator.email}</p>
            <button
              className="user-btn"
              onClick={() => {
                setEditMode(true);
                setNumeNou(utilizator.nume);
              }}
            >
              Editează profilul
            </button>
          </>
        )}
      </div>

      {/* DREAPTA: secțiuni clicabile */}
      <div className="user-section">
        <div className="user-subsections">
          <div
            className="user-box user-box-clickable"
            onClick={() => navigate("/rezervarile-mele")}
          >
            <h3>Rezervările mele</h3>
            <p className="empty-message">Accesează toate rezervările tale</p>
          </div>

          <div
            className="user-box user-box-clickable"
            onClick={() => navigate("/recenziile-mele")}
          >
            <h3>Recenziile mele</h3>
            <p className="empty-message">Vezi și gestionează recenziile tale</p>
          </div>
        </div>
      </div>

      {/* Iconiță setări jos */}
      <div
        className="user-settings-icon"
        onClick={() => navigate("/profile/settings")}
      >
        <FaCog />
      </div>
    </div>
  );
};

export default UserProfile;
