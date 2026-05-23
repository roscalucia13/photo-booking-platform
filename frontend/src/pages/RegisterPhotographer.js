import React, { useState } from "react";
import "./Auth.css";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const RegisterPhotographer = () => {
  const [nume, setNume] = useState("");
  const [email, setEmail] = useState("");
  const [parola, setParola] = useState("");
  const [confirmParola, setConfirmParola] = useState("");
  const [tipServiciu, setTipServiciu] = useState("Fotograf");
  const [locatie, setLocatie] = useState("Chișinău");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    if (parola !== confirmParola) {
      alert("Parolele nu coincid!");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/api/utilizatori/register", {
        nume,
        email,
        parola,
        rol: "fotograf",
        tip_serviciu: tipServiciu,
        locatie
      });

      const utilizator = response.data.utilizator;
      const token = response.data.token;

      // 🔥 Salvăm utilizatorul și tokenul în localStorage
      localStorage.setItem("utilizator", JSON.stringify(utilizator));
      localStorage.setItem("token", token);

      // 🔥 Notificăm App.js despre schimbare (important!)
      window.dispatchEvent(new Event("storage"));

      // 🔁 Redirecționăm direct la profilul fotografului
      navigate("/photographer-profile");

    } catch (err) {
      console.error(err);
      alert("Eroare la înregistrare");
    }
  };

  return (
    <div className="auth-container">
      <h2>Create Account</h2>

      <input
        type="text"
        placeholder="Nume Prenume"
        value={nume}
        onChange={(e) => setNume(e.target.value)}
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <label className="small-label">Tip Serviciu</label>
      <select
        value={tipServiciu}
        onChange={(e) => setTipServiciu(e.target.value)}
      >
        <option value="Fotograf">Fotograf</option>
        <option value="Videograf">Videograf</option>
        <option value="Fotograf/Videograf">Fotograf/Videograf</option>
      </select>

      <label className="small-label">Locație</label>
      <select
        value={locatie}
        onChange={(e) => setLocatie(e.target.value)}
      >
        <option value="Chișinău">Chișinău</option>
        <option value="Orhei">Orhei</option>
        <option value="Bălți">Bălți</option>
        <option value="Cahul">Cahul</option>
        <option value="Ungheni">Ungheni</option>
        <option value="Alt oraș">Alt oraș</option>
      </select>

      <input
        type="password"
        placeholder="Password"
        value={parola}
        onChange={(e) => setParola(e.target.value)}
      />
      <input
        type="password"
        placeholder="Confirm password"
        value={confirmParola}
        onChange={(e) => setConfirmParola(e.target.value)}
      />

      <button className="auth-button" onClick={handleRegister}>
        Create Account
      </button>

      <p className="switch-auth">
        Ai deja un cont? <Link to="/login">Loghează-te</Link>
      </p>
    </div>
  );
};

export default RegisterPhotographer;
