import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaHome,
  FaSearch,
  FaBell,
  FaCommentDots,
  FaUser,
  FaCameraRetro,
} from 'react-icons/fa';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const userData = localStorage.getItem("utilizator");
  const utilizator = userData ? JSON.parse(userData) : null;

  const handleProfileRedirect = () => {
    if (!utilizator) {
      navigate("/login");
      return;
    }

    if (utilizator.rol === "client") {
      navigate("/client-profile");
    } else if (utilizator.rol === "fotograf") {
      navigate("/photographer-profile");
    } else {
      navigate("/login");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("utilizator");
    localStorage.removeItem("token"); // 🔥 ștergem și tokenul!
    window.dispatchEvent(new Event("storage")); // 🔥 notificăm App.js despre schimbare
    setShowDropdown(false);
    navigate("/login");
  };

  return (
    <>
      {/* Navbar de sus */}
      <nav className="top-navbar">
        <div className="logo">
          <FaCameraRetro className="logo-icon" />
          <span>PhotoSession</span>
        </div>

        {/* Iconițele de navigație desktop */}
        <div className="nav-icons">
          <span onClick={() => navigate("/")} className="nav-icon"><FaHome /></span>
          <span onClick={() => navigate("/search")} className="nav-icon"><FaSearch /></span>
          <span onClick={() => navigate("/notifications")} className="nav-icon"><FaBell /></span>
          <span onClick={() => navigate("/messages")} className="nav-icon"><FaCommentDots /></span>
          <span onClick={handleProfileRedirect} className="nav-icon"><FaUser /></span>
        </div>

        {/* Iconița de autentificare + meniu dropdown */}
        <div className="auth-icons">
          <div className="auth-circle" onClick={() => setShowDropdown(!showDropdown)}>
            <FaUser className="auth-icon" />
          </div>
          {showDropdown && (
            <div className="dropdown-menu">
              {utilizator ? (
                <>
                  <button onClick={handleLogout}>Deconectare</button>
                  <button onClick={handleLogout}>Schimbă contul</button>
                </>
              ) : (
                <button onClick={() => {
                  setShowDropdown(false);
                  navigate("/login");
                }}>Conectare</button>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Navbar de jos (mobil) */}
      <nav className="bottom-navbar">
        <span onClick={() => navigate("/")} className="nav-icon"><FaHome /></span>
        <span onClick={() => navigate("/search")} className="nav-icon"><FaSearch /></span>
        <span onClick={() => navigate("/notifications")} className="nav-icon"><FaBell /></span>
        <span onClick={() => navigate("/messages")} className="nav-icon"><FaCommentDots /></span>
        <span onClick={handleProfileRedirect} className="nav-icon"><FaUser /></span>
      </nav>
    </>
  );
};

export default Navbar;
