import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";
import "./PhotographerCalendar.css"; // stil calendar
import "./BookingForm.css"; // stil formular

const UserBookingPage = ({ prestatorId }) => {
  const [disponibilitati, setDisponibilitati] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedOra, setSelectedOra] = useState("");
  const [showForm, setShowForm] = useState(false);
  const user = JSON.parse(localStorage.getItem('utilizator'));
  const clientId = user ? user.id : null;

  useEffect(() => {
    axios.get(`/api/disponibilitati/${prestatorId}`)
      .then(res => setDisponibilitati(res.data))
      .catch(err => console.error("Eroare la preluarea disponibilităților:", err));
  }, [prestatorId]);

  const formatDate = (date) => {
    return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
  };

  const tileClassName = ({ date }) => {
    const dateStr = formatDate(date);
    const found = disponibilitati.find(d => d.data.startsWith(dateStr) && d.status === "disponibil");
    return found ? "available" : null;
  };

  const handleDateClick = (date) => {
    const dateStr = formatDate(date);
    const found = disponibilitati.find(d => d.data.startsWith(dateStr) && d.status === "disponibil");
    if (found) {
      setSelectedDate(dateStr);
      setSelectedOra(found.ora_inceput); // selectăm ora început disponibilă
      setShowForm(true);
    } else {
      alert("Această dată nu este disponibilă pentru rezervare.");
    }
  };

  const handleFormSubmit = async (serviciu, locatie, data, ora) => {
    if (!clientId) {
      alert("Trebuie să fii autentificat pentru a face o rezervare.");
      return;
    }

    try {
      await axios.post('/api/rezervari', {
        client_id: clientId,
        prestator_id: prestatorId,
        data: data,
        ora_inceput: ora,
        ora_sfarsit: ora, // poate fi extins cu interval real
        mesaj: "Rezervare prin platformă",
        descriere: serviciu + " - " + locatie,
        status: "în așteptare"
      });
      alert("Rezervarea a fost trimisă cu succes!");
      setShowForm(false);
    } catch (err) {
      console.error("Eroare la trimiterea rezervării:", err);
      alert("A apărut o eroare la trimiterea cererii.");
    }
  };

  return (
    <div className="calendar-container">
      <h2>Calendar disponibilități</h2>
      <Calendar
        onClickDay={handleDateClick}
        tileClassName={tileClassName}
      />

      {showForm && (
        <BookingForm
          initialDate={selectedDate}
          initialOra={selectedOra}
          onSubmit={handleFormSubmit}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
};

const BookingForm = ({ initialDate, initialOra, onSubmit, onClose }) => {
  const [serviciu, setServiciu] = useState("");
  const [locatie, setLocatie] = useState("");
  const [ora, setOra] = useState(initialOra || "");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!serviciu || !locatie || !initialDate || !ora) {
      alert("Completează toate câmpurile.");
      return;
    }
    onSubmit(serviciu, locatie, initialDate, ora);
  };

  return (
    <div className="booking-form-container">
      <h2>Rezervă o sesiune</h2>
      <form className="booking-form" onSubmit={handleSubmit}>
        <label>Serviciu</label>
        <select value={serviciu} onChange={(e) => setServiciu(e.target.value)} required>
          <option value="">Selectează serviciu</option>
          <option value="Fotograf">Fotograf</option>
          <option value="Videograf">Videograf</option>
          <option value="Ambele">Ambele</option>
        </select>

        <label>Locație</label>
        <select value={locatie} onChange={(e) => setLocatie(e.target.value)} required>
          <option value="">Selectează locația</option>
          <option value="Chișinău">Chișinău</option>
          <option value="Orhei">Orhei</option>
          <option value="Bălți">Bălți</option>
        </select>

        <label>Data</label>
        <input type="text" value={initialDate} readOnly />

        <label>Ora</label>
        <input type="text" value={ora} readOnly />

        <button type="submit">Trimite cererea</button>
        <button type="button" onClick={onClose}>Anulează</button>
      </form>
    </div>
  );
};

export default UserBookingPage;
