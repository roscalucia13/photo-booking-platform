import React, { useState, useEffect } from "react";
import axios from "axios";
import "./SearchPage.css";
import { FaSearch, FaSlidersH, FaTimes, FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";


const SearchPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [location, setLocation] = useState("");
  const [style, setStyle] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const navigate = useNavigate();


  const backgroundImages = [
    require("../assets/images/photo1.jpg"),
    require("../assets/images/photo2.jpg"),
    require("../assets/images/photo3.jpg"),
    require("../assets/images/photo4.jpg"),
    require("../assets/images/photo5.jpg"),
    require("../assets/images/photo6.jpg"),
    require("../assets/images/photo7.jpg"),
    require("../assets/images/photo8.jpg"),
    require("../assets/images/photo9.jpg"),
    require("../assets/images/photo10.jpg"),
  ];

  const handleSearch = async () => {
    setSearching(true);
    try {
      const response = await axios.get("http://localhost:5000/api/utilizatori/search", {
        params: {
          term: searchTerm,
          locatie: location,
          tip_serviciu: style,
          pret_minim: priceMin,
          pret_maxim: priceMax
        }
      });
      setResults(response.data);
    } catch (err) {
      console.error("Eroare la căutare:", err);
      alert("Eroare la preluarea rezultatelor.");
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="search-container">
      <div className="search-filters">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Caută fotografi sau videografi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FaSearch className="search-icon" onClick={handleSearch} />
        </div>
        <button className="filter-button" onClick={() => setShowFilters(!showFilters)}>
          <FaSlidersH /> Filtre
        </button>
      </div>

      {showFilters && (
        <div className="filters-panel">
          <button className="close-filters" onClick={() => setShowFilters(false)}>
            <FaTimes />
          </button>
          <label>Locație:</label>
          <select value={location} onChange={(e) => setLocation(e.target.value)}>
            <option value="">Toate</option>
            <option value="Chișinău">Chișinău</option>
            <option value="Bălți">Bălți</option>
            <option value="Orhei">Orhei</option>
          </select>

          <label>Tip serviciu:</label>
          <select value={style} onChange={(e) => setStyle(e.target.value)}>
            <option value="">Toate</option>
            <option value="Fotograf">Fotograf</option>
            <option value="Videograf">Videograf</option>
            <option value="Fotograf/Videograf">Fotograf/Videograf</option>
          </select>

          <label>Preț minim (€):</label>
          <input type="number" value={priceMin} onChange={(e) => setPriceMin(e.target.value)} />

          <label>Preț maxim (€):</label>
          <input type="number" value={priceMax} onChange={(e) => setPriceMax(e.target.value)} />
        </div>
      )}

      {searching ? (
        <p>Căutare în curs...</p>
      ) : results.length > 0 ? (
        <div className="profile-gallery">
          {results.map((user) => (
            <div key={user.id} className="profile-card" onClick={() => navigate(`/profil-public/${user.id}`)}>

              {user.imagineProfil ? (
                <img src={user.imagineProfil} alt="Profil" className="profile-img" />
              ) : (
                <FaUserCircle className="profile-placeholder" />
              )}
              <h3>{user.nume}</h3>
              <p>{user.tip_serviciu}</p>
              <p>{user.locatie}</p>
              <p>{user.pret_minim ?? "-"} € - {user.pret_maxim ?? "-"} €/oră</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="photo-gallery">
          {backgroundImages.map((img, index) => (
            <div key={index} className="photo-card">
              <img src={img} alt={`Imagine fundal ${index}`} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchPage;
