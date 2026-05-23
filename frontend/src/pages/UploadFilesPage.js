import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './UploadFilesPage.css';

function UploadFilesPage() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [clientId, setClientId] = useState('');
  const [linkuri, setLinkuri] = useState([]);
  const [sesiuni, setSesiuni] = useState([]);

  useEffect(() => {
    // înlocuiește cu apel real la backend pentru sesiuni finalizate
    setSesiuni([
      { id: 1, clientId: 101, clientName: "Ana Popescu", dataSesiune: "12 mai 2025" },
      { id: 2, clientId: 102, clientName: "Ion Rusu", dataSesiune: "20 mai 2025" },
    ]);
  }, []);

  const handleUpload = async () => {
    if (!clientId || selectedFiles.length === 0) {
      alert("Selectează un client și fișiere de încărcat.");
      return;
    }

    const formData = new FormData();
    Array.from(selectedFiles).forEach(file => formData.append('media', file));
    formData.append('clientId', clientId);

    try {
      const res = await axios.post('/api/upload-media', formData);
      setLinkuri(res.data.links);
    } catch (error) {
      console.error("Eroare la încărcare:", error);
      alert("A apărut o eroare la încărcarea fișierelor.");
    }
  };

  return (
    <div className="upload-container">
      <h2 className="upload-title">Trimite fișiere către client</h2>

      <select
        value={clientId}
        onChange={e => setClientId(e.target.value)}
        className="upload-select"
      >
        <option value="">Selectează clientul</option>
        {sesiuni.map(s => (
          <option key={s.id} value={s.clientId}>
            {s.clientName} – {s.dataSesiune}
          </option>
        ))}
      </select>

      <input
        type="file"
        multiple
        onChange={e => setSelectedFiles(e.target.files)}
        className="upload-input"
      />

      <button
        onClick={handleUpload}
        className="upload-button"
      >
        Încarcă fișierele
      </button>

      {linkuri.length > 0 && (
        <div className="upload-result">
          <h3>Fișiere trimise:</h3>
          <ul>
            {linkuri.map((link, i) => (
              <li key={i}>
                <a href={link} target="_blank" rel="noreferrer">
                  Link {i + 1}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default UploadFilesPage;
