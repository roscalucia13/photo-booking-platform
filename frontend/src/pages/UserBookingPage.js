import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";
import "./PhotographerCalendar.css";
import "./UserBookingPage.css";

const UserBookingPage = ({ prestatorId }) => {
  const [disponibilitati, setDisponibilitati] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedOra, setSelectedOra] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [locatiiDisponibile, setLocatiiDisponibile] = useState([]);
  const [serviciiOferite, setServiciiOferite] = useState([]);

  const user = JSON.parse(localStorage.getItem("utilizator"));
  const clientId = user ? user.id : null;

  useEffect(() => {
    axios
      .get(`/api/disponibilitati/${prestatorId}`)
      .then((res) => setDisponibilitati(res.data))
      .catch((err) =>
        console.error("Eroare la preluarea disponibilităților:", err)
      );

    axios
      .get(`/api/utilizatori/rezervare-info/${prestatorId}`)
      .then((res) => {
        setLocatiiDisponibile(res.data.locatie ? [res.data.locatie.trim()] : []);
        setServiciiOferite(res.data.servicii_offered || []);
      })
      .catch((err) =>
        console.error("Eroare la preluarea datelor pentru rezervare:", err)
      );
  }, [prestatorId]);

  const formatDate = (date) => {
    return (
      date.getFullYear() +
      "-" +
      String(date.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(date.getDate()).padStart(2, "0")
    );
  };

  const tileClassName = ({ date }) => {
    const dateStr = formatDate(date);
    const found = disponibilitati.find(
      (d) => d.data.startsWith(dateStr) && d.status === "disponibil"
    );
    return found ? "available" : null;
  };

  const handleDateClick = (date) => {
    const dateStr = formatDate(date);
    const found = disponibilitati.find(
      (d) => d.data.startsWith(dateStr) && d.status === "disponibil"
    );
    if (found) {
      setSelectedDate(dateStr);
      setSelectedOra(found.ora_inceput || "10:00");
      setErrorMsg("");
    } else {
      setSelectedDate(null);
      setSelectedOra("");
    }
  };

  const handleRezervaClick = () => {
    if (!selectedDate) {
      setErrorMsg("Selectează o dată disponibilă pentru a continua rezervarea.");
      return;
    }
    setErrorMsg("");
    setShowForm(true);
  };

  const handleFormSubmit = async (serviciu, locatie, data, ora) => {
    if (!clientId) {
      alert("Trebuie să fii autentificat pentru a face o rezervare.");
      return;
    }

    try {
      await axios.post("/api/rezervari", {
        client_id: clientId,
        prestator_id: prestatorId,
        data: data,
        ora_inceput: ora,
        ora_sfarsit: ora,
        mesaj: "Rezervare prin platformă",
        descriere: serviciu + " - " + locatie,
        status: "în așteptare",
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

      <Calendar onClickDay={handleDateClick} tileClassName={tileClassName} />

      <button className="rezerva-btn" onClick={handleRezervaClick}>
        Rezervă o sesiune
      </button>

      {errorMsg && <p className="error-message">{errorMsg}</p>}

      {showForm && (
        <BookingForm
          initialDate={selectedDate}
          initialOra={selectedOra}
          locatii={locatiiDisponibile}
          servicii={serviciiOferite}
          onSubmit={handleFormSubmit}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
};

const BookingForm = ({ initialDate, initialOra, locatii, servicii, onSubmit, onClose }) => {
  const [serviciuSelectat, setServiciuSelectat] = useState("");
  const [altServiciu, setAltServiciu] = useState("");
  const [locatie, setLocatie] = useState("");
  const [detaliiLocatie, setDetaliiLocatie] = useState("");
  const [ora, setOra] = useState(initialOra || "");

  const handleSubmit = (e) => {
    e.preventDefault();

    const serviciuFinal =
      serviciuSelectat === "alt" ? altServiciu.trim() : serviciuSelectat;

    if (!serviciuFinal || !locatie || !initialDate || !ora) {
      alert("Completează toate câmpurile obligatorii.");
      return;
    }

    const locatieFinala = detaliiLocatie
      ? `${locatie} – ${detaliiLocatie}`
      : locatie;

    onSubmit(serviciuFinal, locatieFinala, initialDate, ora);
  };

  return (
    <div className="booking-form-container">
      <h2>Rezervă o sesiune</h2>
      <form className="booking-form" onSubmit={handleSubmit}>
        <label>Serviciu oferit</label>
        <select
          value={serviciuSelectat}
          onChange={(e) => setServiciuSelectat(e.target.value)}
          required
        >
          <option value="">Selectează serviciu</option>
          {servicii.map((serv, index) => (
            <option key={index} value={serv}>
              {serv}
            </option>
          ))}
          <option value="alt">Alt serviciu...</option>
        </select>

        {serviciuSelectat === "alt" && (
          <>
            <label>Descrie serviciul dorit</label>
            <input
              type="text"
              value={altServiciu}
              onChange={(e) => setAltServiciu(e.target.value)}
              placeholder="ex: ședință maternitate, foto pentru CV etc."
              required
            />
          </>
        )}

        <label>Locație</label>
        <select
          value={locatie}
          onChange={(e) => setLocatie(e.target.value)}
          required
        >
          <option value="">Selectează locația</option>
          {locatii.map((loc, index) => (
            <option key={index} value={loc}>
              {loc}
            </option>
          ))}
        </select>

        {locatie && (
          <>
            <label>Detalii locație (opțional)</label>
            <input
              type="text"
              value={detaliiLocatie}
              onChange={(e) => setDetaliiLocatie(e.target.value)}
              placeholder="ex: Parcul Valea Morilor, sector Centru"
            />
          </>
        )}

        <label>Data</label>
        <input type="text" value={initialDate} readOnly />

        <label>Ora</label>
        <input
          type="time"
          value={ora}
          onChange={(e) => setOra(e.target.value)}
          required
        />

        <button type="submit">Trimite cererea</button>
        <button type="button" onClick={onClose}>
          Anulează
        </button>
      </form>
    </div>
  );
};

export default UserBookingPage;
