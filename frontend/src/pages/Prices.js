import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Prices.css";

const Prices = () => {
  const predefinedEvents = ["Nuntă", "Botez", "Corporate", "Food", "UGC", "Fashion"];
  const colors = ["#e0f7fa", "#fce4ec", "#f3e5f5", "#ffe0b2", "#dcedc8"];
  const navigate = useNavigate();

  const [selectedEvents, setSelectedEvents] = useState([]);
  const [customEvent, setCustomEvent] = useState("");
  const [pretMinim, setPretMinim] = useState("");
  const [pretMaxim, setPretMaxim] = useState("");
  const [showSlider, setShowSlider] = useState(false);
  const [showCustomInput, setShowCustomInput] = useState(false);

  // 🔥 Preluare date din backend la încărcare
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("utilizator"));
    if (user && user.id) {
      axios.get(`http://localhost:5000/api/utilizatori/services/${user.id}`)
        .then(res => {
          console.log("Date preluate:", res.data);
          setSelectedEvents(res.data.servicii_offered ? JSON.parse(res.data.servicii_offered) : []);
          setPretMinim(res.data.pret_minim ?? "");
          setPretMaxim(res.data.pret_maxim ?? "");
        })
        .catch(error => console.error("Eroare la preluarea datelor:", error));
    }
  }, []);

  const toggleEvent = (event) => {
    setSelectedEvents(prev => (
      prev.includes(event)
        ? prev.filter(e => e !== event)
        : [...prev, event]
    ));
  };

  const addCustomEvent = () => {
    if (customEvent && !selectedEvents.includes(customEvent)) {
      setSelectedEvents([...selectedEvents, customEvent]);
      setCustomEvent("");
      setShowCustomInput(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem("utilizator"));
    if (!user || !user.id) {
      alert("Utilizatorul nu este autentificat!");
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/utilizatori/services', {
        userId: user.id,
        servicii_offered: JSON.stringify(selectedEvents),
        pret_minim: pretMinim,
        pret_maxim: pretMaxim
      });
      // Eliminăm alert-ul și redirecționăm direct
      navigate('/photographer-profile');  // 🔥 Redirecționare automată
    } catch (error) {
      console.error("Eroare la salvare:", error);
      alert("A apărut o eroare la salvare.");
    }
  };

  return (
    <div className="prices-container">
      <h2>Configurează serviciile și prețul</h2>
      <button className="open-slider-btn" onClick={() => setShowSlider(true)}>
        Alege servicii
      </button>
      {showSlider && (
        <div className="slider">
          <div className="slider-header">
            <h3>Tipuri de servicii oferite</h3>
            <span className="close-x" onClick={() => setShowSlider(false)}>×</span>
          </div>
          {predefinedEvents.map((event, index) => (
            <label key={index} className="slider-option">
              <input
                type="checkbox"
                checked={selectedEvents.includes(event)}
                onChange={() => toggleEvent(event)}
              />
              {event}
            </label>
          ))}
          <div className="custom-event">
            {!showCustomInput && (
              <div className="add-other-btn" onClick={() => setShowCustomInput(true)}>
                ... Alte
              </div>
            )}
            {showCustomInput && (
              <div className="custom-input">
                <input
                  type="text"
                  placeholder="Adaugă serviciu nou"
                  value={customEvent}
                  onChange={(e) => setCustomEvent(e.target.value)}
                />
                <button onClick={addCustomEvent}>Adaugă</button>
              </div>
            )}
          </div>
        </div>
      )}
      <div className="selected-services">
        {selectedEvents.map((event, index) => (
          <div
            key={index}
            className="selected-card"
            style={{ backgroundColor: colors[index % colors.length], position: "relative" }}
          >
            <span
              className="remove-service-btn"
              onClick={() => setSelectedEvents(selectedEvents.filter(e => e !== event))}
            >
              ×
            </span>
            {event}
          </div>
        ))}
      </div>
      <div className="price-range">
        <h3>Interval preț (€/oră):</h3>
        <input
          type="number"
          placeholder="Minim €"
          value={pretMinim}
          onChange={(e) => setPretMinim(e.target.value)}
        />
        <input
          type="number"
          placeholder="Maxim €"
          value={pretMaxim}
          onChange={(e) => setPretMaxim(e.target.value)}
        />
      </div>
      <button className="save-button" onClick={handleSubmit}>Salvează</button>
    </div>
  );
};

export default Prices;
