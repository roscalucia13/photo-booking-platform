import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const PublicAlbume = () => {
  const { userId } = useParams(); // obține id-ul din URL
  const [albume, setAlbume] = useState([]);

  useEffect(() => {
    axios.get(`http://localhost:5000/api/albume/public/${userId}`)
      .then(res => setAlbume(res.data))
      .catch(err => console.error("Eroare la preluare albume:", err));
  }, [userId]);

  return (
    <div>
      <h2>Albumele utilizatorului {userId}</h2>
      <div className="album-list">
        {albume.length > 0 ? albume.map(album => (
          <div key={album.id} className="album-card">
            <h3>{album.titlu}</h3>
            <div>
              {album.poze.split(",").map((poza, i) => (
                <img key={i} src={`http://localhost:5000/uploads/${poza}`} alt={`poza-${i}`} />
              ))}
            </div>
          </div>
        )) : <p>Nu există albume disponibile.</p>}
      </div>
    </div>
  );
};

export default PublicAlbume;
