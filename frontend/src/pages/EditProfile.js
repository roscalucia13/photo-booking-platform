import React, { useState, useEffect } from "react";
import axios from "axios";
import "./EditProfile.css";
import { useNavigate } from "react-router-dom";

const EditProfile = () => {
  const [formData, setFormData] = useState({
    name: "",
    services: "",
    location: ""
  });
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("utilizator"));
    if (user && user.id) {
      setFormData({
        name: user.nume,
        services: user.tip_serviciu,
        location: user.locatie
      });
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem("utilizator"));
    if (!user || !user.id) {
      alert("Utilizatorul nu este autentificat.");
      return;
    }

    try {
      await axios.put(`http://localhost:5000/api/utilizatori/update/${user.id}`, {
        nume: formData.name,
        tip_serviciu: formData.services,
        locatie: formData.location
      });

      // 🔥 Actualizăm localStorage cu datele noi
      const updatedUser = { ...user, nume: formData.name, tip_serviciu: formData.services, locatie: formData.location };
      localStorage.setItem("utilizator", JSON.stringify(updatedUser));

      
      navigate("/photographer-profile"); // Redirecționăm
    } catch (err) {
      console.error("Eroare la actualizare:", err);
      alert("A apărut o eroare la actualizare.");
    }
  };

  return (
    <div className="edit-profile-container">
      <h2>Editare Profil</h2>
      <form onSubmit={handleSubmit} className="edit-form">
        <label>Nume complet:</label>
        <input type="text" name="name" value={formData.name} onChange={handleChange} />
        <label>Tip servicii:</label>
        <select name="services" value={formData.services} onChange={handleChange}>
          <option value="">Selectează</option>
          <option value="Fotograf">Fotograf</option>
          <option value="Videograf">Videograf</option>
          <option value="Fotograf/Videograf">Fotograf/Videograf</option>
        </select>
        <label>Locație:</label>
        <select name="location" value={formData.location} onChange={handleChange}>
          <option value="">Selectează locația</option>
          <option value="Chișinău">Chișinău</option>
          <option value="Bălți">Bălți</option>
          <option value="Cahul">Cahul</option>
          <option value="Orhei">Orhei</option>
          <option value="Ungheni">Ungheni</option>
          <option value="Soroca">Soroca</option>
          <option value="Edineț">Edineț</option>
          <option value="Hîncești">Hîncești</option>
          <option value="Strășeni">Strășeni</option>
          <option value="Comrat">Comrat</option>
        </select>
        <button type="submit">Salvează modificările</button>
      </form>
    </div>
  );
};

export default EditProfile;
