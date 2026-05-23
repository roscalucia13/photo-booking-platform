import React, { useEffect, useState } from "react";
import "./Notifications.css";
import { Bell } from "lucide-react";
import { FaUserCircle } from "react-icons/fa";
import axios from "axios";

const Notifications = () => {
  const [notificari, setNotificari] = useState([]);
  const [mesajUI, setMesajUI] = useState("");
  const [modalDeschis, setModalDeschis] = useState(false);
  const [detaliiRezervare, setDetaliiRezervare] = useState(null);
  const [loadingDetalii, setLoadingDetalii] = useState(false);

  const user = JSON.parse(localStorage.getItem("utilizator"));
  const isPrestator = user?.rol === "fotograf" || user?.rol === "videograf";

  useEffect(() => {
    if (user?.id) {
      incarcaNotificari();
    }
  }, [user?.id]);

  const incarcaNotificari = async () => {
    try {
      const res = await axios.get(`/api/notificari/${user.id}`);
      setNotificari(res.data);
    } catch (err) {
      console.error("Eroare la preluarea notificărilor:", err);
    }
  };

  const formatDateTime = (dataString) => {
    
    const date = new Date(dataString);
    const zi = date.toLocaleDateString();
    const ora = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${zi}, ora ${ora}`;
  };

  // Pentru data: 2025-06-05T00:00:00.000Z -> 05.06.2025
const formatDataDetaliu = (dataString) => {
  if (!dataString) return "";
  const date = new Date(dataString);
  const zi = String(date.getDate()).padStart(2, "0");
  const luna = String(date.getMonth() + 1).padStart(2, "0");
  const an = date.getFullYear();
  return `${zi}.${luna}.${an}`;
};


const formatOraDetaliu = (oraString) => {
  if (!oraString) return "";
  const date = new Date(oraString);
  const ora = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");
  return `${ora}:${minute}`;
};

//Pentru Butonul finalizare sesiune
const handleFinalizareSesiune = async () => {
  try {
    await axios.post('/api/rezervari/finalizeaza', {
      rezervareId: detaliiRezervare.id,
      clientId: detaliiRezervare.client_id,
      prestatorId: user.id
    });

    setMesajUI("Sesiunea a fost marcată ca finalizată.");
    inchideModal();
    incarcaNotificari();
  } catch (err) {
    console.error("Eroare la finalizare:", err);
    setMesajUI("A apărut o eroare la finalizare.");
  }
};



  // 🔥 La click pe notificare
  const handleDeschideModal = async (notif) => {
    if (!notif.rezervare_id) return; // nu deschide pentru notificări fără rezervare
    setLoadingDetalii(true);
    setModalDeschis(true);
    try {
      const res = await axios.get(`/api/rezervari/detalii/${notif.rezervare_id}`);
      setDetaliiRezervare({ ...res.data, notifId: notif.id });
    } catch (err) {
      setDetaliiRezervare(null);
    }
    setLoadingDetalii(false);
  };

  const inchideModal = () => {
    setModalDeschis(false);
    setDetaliiRezervare(null);
  };

  // 🔥 Confirmă/Refuză rezervarea
  const handleActiune = async (rezervareId, notifId, actiune) => {
    try {
      await axios.put(`/api/rezervari/${rezervareId}`, { status: actiune });
      await axios.put(`/api/notificari/${notifId}/citita`);
      setMesajUI(`Rezervarea a fost ${actiune === "confirmată" ? "confirmată" : "refuzată"}.`);
      inchideModal();
      incarcaNotificari();
    } catch (err) {
      setMesajUI("A apărut o eroare la acțiune.");
    }
  };

  return (
    <div className="notifications-wrapper">
      {mesajUI && <div className="notificare-feedback">{mesajUI}</div>}

      {notificari.length === 0 ? (
        <div className="empty-state">
          <Bell size={80} color="#d3d3d3" />
          <p>Nu ai notificări noi</p>
        </div>
      ) : (
        <div className="notifications-list">
          {notificari.map((notif) => (
            <div
              key={notif.id}
              className={`notificare-card ${notif.status === "citit" ? "citita" : ""}`}
              onClick={() => handleDeschideModal(notif)}
              style={{ pointerEvents: notif.rezervare_id ? "auto" : "none", opacity: notif.rezervare_id ? 1 : 0.5 }}
            >
              <div className="notificare-avatar">
                {notif.expeditor_imagine ? (
                  <img
                    src={notif.expeditor_imagine}
                    alt={notif.expeditor_nume || "Utilizator"}
                    className="avatar-client"
                  />
                ) : (
                  <FaUserCircle className="avatar-placeholder" />
                )}
              </div>

              <div className="notificare-content">
                <p className="notificare-titlu">
  <strong>{notif.expeditor_nume || "Utilizator necunoscut"}</strong>
</p>
<p className="notificare-mesaj">{notif.mesaj}</p>
<p className="notificare-timp">{formatDateTime(notif.data_creare)}</p>



              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL Detalii rezervare */}
      {modalDeschis && isPrestator && (
        <div className="modal-rezervare-overlay" onClick={inchideModal}>
          <div className="modal-rezervare" onClick={e => e.stopPropagation()}>
            {loadingDetalii ? (
              <p>Se încarcă detalii...</p>
            ) : detaliiRezervare ? (
              <>
                <div className="modal-header">
                  {detaliiRezervare.client_imagine ? (
                    <img src={detaliiRezervare.client_imagine} alt="Client" className="avatar-client" />
                  ) : (
                    <FaUserCircle className="avatar-placeholder" />
                  )}
                  <span className="modal-nume">{detaliiRezervare.client_nume}</span>
                </div>
                <div className="modal-body">
                  <p><b>Data:</b> {formatDataDetaliu(detaliiRezervare.data)}</p>
                  <p><b>Ora:</b> {formatOraDetaliu(detaliiRezervare.ora_inceput)}</p>

                  <p><b>Status:</b> {detaliiRezervare.status}</p>
                  {detaliiRezervare.mesaj && <p><b>Mesaj:</b> {detaliiRezervare.mesaj}</p>}
                  {detaliiRezervare.descriere && <p><b>Descriere:</b> {detaliiRezervare.descriere}</p>}
                </div>
                <div className="modal-actions">
                  <button onClick={() => handleActiune(detaliiRezervare.id, detaliiRezervare.notifId, "confirmată")}>
                    Confirmă
                  </button>
                  <button onClick={() => handleActiune(detaliiRezervare.id, detaliiRezervare.notifId, "respinsă")}>
                    Refuză
                  </button>
                  <button onClick={handleFinalizareSesiune}>
  Sesiune finalizată
</button>

                </div>
              </>
            ) : (
              <p>Eroare la încărcarea detaliilor.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;
