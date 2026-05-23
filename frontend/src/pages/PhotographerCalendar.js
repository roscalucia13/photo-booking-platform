import React, { useState, useEffect, useRef } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./PhotographerCalendar.css";
import axios from "axios";
import { FaEdit } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const PhotographerCalendar = () => {
  const user = JSON.parse(localStorage.getItem('utilizator'));
  const prestatorId = user ? user.id : null;
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [disponibilitati, setDisponibilitati] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [oraInceput, setOraInceput] = useState("00:00");
  const [oraSfarsit, setOraSfarsit] = useState("23:59");
  const [comentariu, setComentariu] = useState("");
  const [detaliiZi, setDetaliiZi] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  const editRef = useRef(null);

  useEffect(() => {
    if (prestatorId) {
      loadDisponibilitati();
    } else {
      alert("Nu ești autentificat!");
    }
  }, [prestatorId]);

  useEffect(() => {
    if (showEdit && editRef.current) {
      editRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [showEdit]);

  const loadDisponibilitati = () => {
    axios.get(`/api/disponibilitati/${prestatorId}`)
      .then(response => setDisponibilitati(response.data))
      .catch(err => console.error('Eroare la preluare:', err));
  };

  const formatDate = (date) => {
    return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
  };

  const tileClassName = ({ date }) => {
    const dateStr = formatDate(date);
    const found = disponibilitati.find(d => d.data.startsWith(dateStr));
    let classes = "";
    if (found) {
      classes += found.status === 'ocupat' ? " booked" : " available";
    }
    if (showEdit && selectedDate && dateStr === formatDate(selectedDate)) {
      classes += " selected-edit";
    }
    return classes || null;
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    const dateStr = formatDate(date);
    const found = disponibilitati.find(d => d.data.startsWith(dateStr));
    if (found) {
      setDetaliiZi(found);
      setSelectedStatus(found.status);
      setOraInceput(found.ora_inceput);
      setOraSfarsit(found.ora_sfarsit);
      setComentariu(found.comentariu);
    } else {
      setDetaliiZi(null);
      setSelectedStatus("");
      setOraInceput("00:00");
      setOraSfarsit("23:59");
      setComentariu("");
    }
  };

  const markStatus = (status) => {
    setSelectedStatus(status);
    if (!selectedDate) return;
    const dateStr = formatDate(selectedDate);
    const existing = disponibilitati.find(d => d.data.startsWith(dateStr));

    if (existing) {
      setDisponibilitati(disponibilitati.map(d =>
        d.data.startsWith(dateStr)
          ? { ...d, status, ora_inceput: oraInceput, ora_sfarsit: oraSfarsit, comentariu }
          : d
      ));
    } else {
      const newEntry = {
        id: Date.now(),
        prestator_id: prestatorId,
        data: dateStr,
        ora_inceput: oraInceput,
        ora_sfarsit: oraSfarsit,
        status,
        comentariu
      };
      setDisponibilitati(prev => [...prev, newEntry]);
    }
  };

  const saveChanges = () => {
    if (!selectedDate) {
      alert("Selectează o dată din calendar.");
      return;
    }
    const dataStr = formatDate(selectedDate);
    const existing = disponibilitati.find(d => d.data.startsWith(dataStr));
    const payload = {
      prestator_id: prestatorId,
      data: dataStr,
      ora_inceput: oraInceput,
      ora_sfarsit: oraSfarsit,
      status: selectedStatus,
      comentariu
    };

    if (existing && existing.id < 100000) {
      axios.put(`/api/disponibilitati/${existing.id}`, payload)
        .then(() => loadDisponibilitati())
        .catch(err => console.error('Eroare la actualizare:', err));
    } else if (!existing || existing.id >= 100000) {
      axios.post('/api/disponibilitati', payload)
        .then(() => loadDisponibilitati())
        .catch(err => console.error('Eroare la adăugare:', err));
    }
    setShowEdit(false);
  };

  const deleteDisponibilitate = () => {
    if (detaliiZi && detaliiZi.id) {
      axios.delete(`/api/disponibilitati/${detaliiZi.id}`)
        .then(() => {
          setDisponibilitati(disponibilitati.filter(d => d.id !== detaliiZi.id));
          setDetaliiZi(null);
        })
        .catch(err => console.error('Eroare la ștergere:', err));
    }
  };

  const closePopup = () => setDetaliiZi(null);

  const formatOra = (ora) => {
    if (!ora) return "-";
    if (ora.includes("T")) {
      return ora.split("T")[1]?.substring(0,5);
    }
    if (ora.length >= 5) return ora.substring(0,5);
    return ora;
  };

  return (
    <>
      {/* 🔥 Săgeată în afara containerului */}
      <button className="back-arrow" onClick={() => navigate("/profil")}>←</button>

      <div className="calendar-container" style={{ position: 'relative' }}>
        <h2>Calendarul Meu</h2>
        <Calendar onChange={handleDateClick} value={selectedDate} tileClassName={tileClassName} />

        <FaEdit onClick={() => setShowEdit(!showEdit)}
          style={{ position: 'absolute', right: '-60px', top: '0', width: '40px', height: '40px', cursor: 'pointer' }}
          title={showEdit ? "Închide editarea" : "Modificare"} />

        {showEdit && (
          <div ref={editRef} className="calendar-actions">
            <p>Data selectată: <strong>{selectedDate ? selectedDate.toDateString() : "Nicio dată selectată"}</strong></p>
            <button onClick={() => markStatus("disponibil")}>Marchează ca disponibil</button>
            <button onClick={() => markStatus("ocupat")}>Marchează ca ocupat</button>
            <input type="time" value={oraInceput} onChange={(e) => setOraInceput(e.target.value)} style={{ marginLeft: '10px', padding: '5px' }} />
            <input type="time" value={oraSfarsit} onChange={(e) => setOraSfarsit(e.target.value)} style={{ marginLeft: '10px', padding: '5px' }} />
            <input type="text" placeholder="Comentariu (opțional)" value={comentariu} onChange={(e) => setComentariu(e.target.value)} style={{ marginLeft: '10px', padding: '5px' }} />
            <button onClick={saveChanges} style={{ marginLeft: '10px' }}>Salvează</button>
          </div>
        )}

        {detaliiZi && (
          <div className="popup-overlay" onClick={closePopup}>
            <div className="popup-content" onClick={(e) => e.stopPropagation()}>
              <h3>Detalii pentru {new Date(detaliiZi.data).toLocaleDateString('ro-RO')}</h3>
              <p><strong>Status:</strong> {detaliiZi.status}</p>
              <p><strong>Ora:</strong> {formatOra(detaliiZi.ora_inceput)} - {formatOra(detaliiZi.ora_sfarsit)}</p>
              <p><strong>Comentariu:</strong> {detaliiZi.comentariu || "-"}</p>

              <button onClick={() => {
                setSelectedDate(new Date(detaliiZi.data));
                setDetaliiZi(null);
                setShowEdit(true);
                setTimeout(() => {
                  if (editRef.current) {
                    editRef.current.scrollIntoView({ behavior: "smooth" });
                  }
                }, 100);
              }} style={{ backgroundColor: '#4CAF50', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '5px', marginRight: '10px' }}>Editare</button>

              {showEdit && detaliiZi.id && (
                <button onClick={deleteDisponibilitate} style={{ backgroundColor: '#f44336', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '5px' }}>Șterge</button>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default PhotographerCalendar;
