import React, { useState } from "react";
import "./AddAlbum.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import imageCompression from 'browser-image-compression';

const AddAlbum = () => {
  const [albumTitle, setAlbumTitle] = useState("");
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = async (e) => {
    const selected = Array.from(e.target.files);
    const compressedFiles = await Promise.all(
      selected.map(async (file) => {
        if (file.type.startsWith('image/')) {
          return await imageCompression(file, { maxSizeMB: 1, maxWidthOrHeight: 1920 });
        }
        return file; // dacă e video, îl păstrăm așa
      })
    );
    setFiles(compressedFiles);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const utilizator = JSON.parse(localStorage.getItem("utilizator"));
    if (!utilizator) {
      alert("Trebuie să fii autentificat pentru a adăuga un album.");
      return;
    }

    if (!albumTitle.trim()) {
      alert("Introduceți o denumire pentru album.");
      return;
    }

    if (files.length === 0) {
      alert("Încarcă cel puțin o poză sau un video.");
      return;
    }

    setIsLoading(true); // Pornim loader-ul

    try {
      const formData = new FormData();
      formData.append("titlu", albumTitle);
      formData.append("utilizator_id", utilizator.id);
      files.forEach(file => {
        formData.append("poze", file);
      });

      await axios.post("http://localhost:5000/api/albume/create", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      alert("Albumul a fost salvat cu succes!");
      navigate("/photographer-profile");
    } catch (err) {
      console.error("Eroare la salvare:", err);
      alert("A apărut o eroare la salvare.");
    } finally {
      setIsLoading(false); // Oprim loader-ul
    }
  };

  return (
    <div className="add-album-container">
      <h2>Crează un album nou</h2>
      <form className="add-album-form" onSubmit={handleSubmit}>
        <label>Denumirea albumului:</label>
        <input
          type="text"
          value={albumTitle}
          onChange={(e) => setAlbumTitle(e.target.value)}
          required
        />

        <label>Încarcă poze/video:</label>
        <input
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={handleFileChange}
        />

        <button type="submit" disabled={isLoading}>
          {isLoading ? "Se salvează..." : "Salvează album"}
        </button>
      </form>
      {isLoading && <p>Încărcare în curs, te rugăm să aștepți...</p>}
    </div>
  );
};

export default AddAlbum;
