import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaPlus, FaTrash, FaEdit, FaTimes } from "react-icons/fa";
import "./AlbumDetails.css";

const AlbumDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [album, setAlbum] = useState(null);
  const [newTitle, setNewTitle] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [filesToRemove, setFilesToRemove] = useState([]);
  const [localPoze, setLocalPoze] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('utilizator');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    fetchAlbum();
  }, [id]);

  const fetchAlbum = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/albume/${id}`);
      setAlbum(res.data);
      setNewTitle(res.data.titlu);
      setLocalPoze(res.data.poze ? res.data.poze.split(",") : []);
    } catch (err) {
      console.error("Eroare la preluarea albumului:", err);
    }
  };

  const canEdit = user && album && user.id === album.utilizator_id;

  const handleAddFiles = async (files) => {
    if (files.length === 0) return;
    const formData = new FormData();
    formData.append("album_id", id);
    files.forEach(file => formData.append("poze", file));
    try {
      await axios.post("http://localhost:5000/api/albume/add-files", formData);
      fetchAlbum();
    } catch (err) {
      console.error("Eroare adăugare poze:", err);
    }
  };

  const handleDeleteAlbum = async () => {
    if (window.confirm("Sigur vrei să ștergi albumul?")) {
      await axios.delete(`http://localhost:5000/api/albume/${id}`);
      navigate("/photographer-profile");
    }
  };

  const toggleEditMode = () => {
    setEditMode(!editMode);
    setFilesToRemove([]);
    fetchAlbum();
  };

  const handleMarkRemove = (fileName) => {
    setFilesToRemove(prev => [...prev, fileName]);
    setLocalPoze(prev => prev.filter(f => f !== fileName));
  };

  const handleSaveChanges = async () => {
    try {
      await axios.put(`http://localhost:5000/api/albume/${id}`, {
        titlu: newTitle,
        filesToRemove: filesToRemove
      });
      setEditMode(false);
      setFilesToRemove([]);
      fetchAlbum();
    } catch (err) {
      console.error("Eroare la salvare modificări:", err);
    }
  };

  if (!album) return <p>Se încarcă...</p>;

  return (
    <div className="album-details-container">
      <div className="album-header">
        {editMode && canEdit ? (
          <>
            <input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="input-title"
            />
            <button onClick={handleSaveChanges}>Salvează</button>
          </>
        ) : (
          <h2>{album.titlu}</h2>
        )}

        {canEdit && (
          <div className="album-header-actions">
            <FaEdit onClick={toggleEditMode} className="edit-icon" />
            <FaTrash onClick={handleDeleteAlbum} className="delete-icon" />
          </div>
        )}
      </div>

      <div className="album-details-grid">
        {localPoze.map((poza, index) => {
          const fileUrl = `http://localhost:5000/uploads/${poza}`;
          const isVideo = /\.(mp4|webm|ogg)$/i.test(poza);
          return (
            <div key={index} className="poza-card">
              {isVideo ? (
                <video width="200" height="200" controls>
                  <source src={fileUrl} type="video/mp4" />
                </video>
              ) : (
                <img src={fileUrl} alt={`poza-${index}`} />
              )}
              {editMode && canEdit && (
                <FaTimes
                  onClick={() => handleMarkRemove(poza)}
                  className="remove-icon"
                />
              )}
            </div>
          );
        })}

        {editMode && canEdit && (
          <div className="poza-card add-photo-card">
            <label htmlFor="add-files-input">
              <FaPlus size={30} />
            </label>
            <input
              id="add-files-input"
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={(e) => handleAddFiles(Array.from(e.target.files))}
              style={{ display: "none" }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AlbumDetails;
