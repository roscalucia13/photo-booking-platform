import React, { useState } from "react";
import "./Auth.css";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Login = () => {
  const [email, setEmail] = useState("");
  const [parola, setParola] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await axios.post("http://localhost:5000/api/utilizatori/login", {
        email,
        parola,
      });

      const utilizator = response.data.utilizator;
      const token = response.data.token;

      // 🔥 Salvăm datele utilizatorului și tokenul în localStorage
      localStorage.setItem("utilizator", JSON.stringify(utilizator));
      localStorage.setItem("token", token);
      
      // 🔥 Notificăm App.js despre schimbare (important!)
      window.dispatchEvent(new Event("storage"));

      // Redirecționăm în funcție de rol
      if (utilizator.rol === "client") {
        navigate("/client-profile");
      } else if (utilizator.rol === "fotograf") {
        navigate("/photographer-profile");
      } else {
        alert("Rol necunoscut.");
      }

    } catch (err) {
      console.error(err);
      alert("Email sau parolă incorectă.");
    }
  };

  return (
    <div className="auth-container">
      <h2>Sign in</h2>
      <input
        type="text"
        placeholder="Email or Member name"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={parola}
        onChange={(e) => setParola(e.target.value)}
      />
      <p className="forgot-password">Forgot your password?</p>
      <button className="auth-button" onClick={handleLogin}>Sign in</button>
      <div className="or-divider">
        <span></span> Or <span></span>
      </div>
      <Link to="/choose-account" className="create-account-btn">
        Create an account
      </Link>
    </div>
  );
};

export default Login;
