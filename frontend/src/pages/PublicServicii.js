import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./Prices.css";

const PublicServicii = () => {
  const { id } = useParams();
  const [servicii, setServicii] = useState([]);
  const [pret, setPret] = useState({ minim: null, maxim: null });
  const colors = ["#e0f7fa", "#fce4ec", "#f3e5f5", "#ffe0b2", "#dcedc8"];

  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/utilizatori/public-services/${id}`)
      .then((res) => {
        const { servicii_offered, pret_minim, pret_maxim } = res.data;

        const lista = Array.isArray(servicii_offered)
          ? servicii_offered
          : [];

        setServicii(lista);
        setPret({ minim: pret_minim, maxim: pret_maxim });
      })
      .catch((err) =>
        console.error("Eroare la preluarea serviciilor publice:", err)
      );
  }, [id]);

  return (
    <div className="prices-container">
      <h2>Servicii oferite</h2>
      <div className="selected-services">
        {servicii.length > 0 ? (
          servicii.map((serviciu, index) => (
            <div
              key={index}
              className="selected-card"
              style={{ backgroundColor: colors[index % colors.length] }}
            >
              {serviciu}
            </div>
          ))
        ) : (
          <p>Nu există servicii disponibile.</p>
        )}
      </div>

      <div className="price-range">
        <h3>Interval preț (€/oră):</h3>
        <p style={{ fontWeight: "bold" }}>
          {pret.minim ?? "-"}€ – {pret.maxim ?? "-"}€
        </p>
      </div>
    </div>
  );
};

export default PublicServicii;
