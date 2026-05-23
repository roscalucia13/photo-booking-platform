import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaUserCircle } from "react-icons/fa";
import { io } from "socket.io-client";
import "./Messages.css";
import { useParams } from "react-router-dom";

const socket = io('http://localhost:5000'); 

const Messages = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  const [conversatii, setConversatii] = useState([]);
  const [loadingConversatii, setLoadingConversatii] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [usersLoaded, setUsersLoaded] = useState(false);

  const userObj = JSON.parse(localStorage.getItem("utilizator"));
  const currentUserId = userObj ? userObj.id : null;
  const { id } = useParams(); 

  useEffect(() => {
    axios.get("/api/utilizatori/all")
      .then(res => {
        setUsers(res.data);
        setUsersLoaded(true);
      })
      .catch(err => {
        console.error("Eroare la obținerea utilizatorilor", err);
        setUsersLoaded(true);
      });
  }, []);

  useEffect(() => {
    if (id && usersLoaded && users.length > 0) {
      const prestator = users.find(u => u.id === parseInt(id));
      if (prestator) {
        handleSelectUser(prestator);
      }
    }
  }, [id, usersLoaded, users]);

  useEffect(() => {
    if (currentUserId) {
      axios.get(`/api/utilizatori/conversatii/${currentUserId}`)
        .then(res => {
          setConversatii(res.data);
          setLoadingConversatii(false);
        })
        .catch(err => {
          console.error("Eroare la preluarea conversațiilor", err);
          setLoadingConversatii(false);
        });
    } else {
      setLoadingConversatii(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    if (selectedUser && currentUserId) {
      const roomId = [currentUserId, selectedUser.id].sort().join("_");
      socket.emit('join_room', roomId);

      const handleReceiveMessage = (data) => {
        if (data.room === roomId) {
          setMessages(prev => [...prev, data]);
        }
      };

      socket.on('receive_message', handleReceiveMessage);

      return () => socket.off('receive_message', handleReceiveMessage);
    }
  }, [selectedUser, currentUserId]);

  useEffect(() => {
    if (selectedUser && currentUserId) {
      axios.get(`/api/mesaje/${currentUserId}/${selectedUser.id}`)
        .then(res => setMessages(res.data))
        .catch(err => console.error("Eroare la obținerea mesajelor", err));
    }
  }, [selectedUser, currentUserId]);

  const normalize = str => (str || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

  const handleSearch = () => {
    const filtered = users.filter(user => {
      const name = normalize(user.nume);
      const term = normalize(searchTerm);
      return name.includes(term) && user.id !== currentUserId && !conversatii.some(conv => conv.id === user.id);
    });
    setSearchResults(filtered);
  };

  const handleSelectUser = (user) => {
    const fullUser = users.find(u => u.id === user.id) || user;
    setSelectedUser(fullUser);
    if (!conversatii.some(conv => conv.id === user.id)) {
      setConversatii(prev => [...prev, fullUser]);
    }
    setSearchTerm("");
    setSearchResults([]);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedUser) return;

    const roomId = [currentUserId, selectedUser.id].sort().join("_");
    const message = {
      room: roomId,
      senderId: currentUserId,
      receiverId: selectedUser.id,
      text: newMessage,
      timestamp: new Date().toISOString()
    };

    socket.emit('send_message', message);

    axios.post('/api/mesaje', message)
      .catch(err => console.error("Eroare la trimiterea mesajului", err));

    setNewMessage("");
  };

  return (
    <div className="messages-container">
      {loadingConversatii ? (
        <p>Loading...</p>
      ) : conversatii.length === 0 ? (
        <div className="no-conversations">
          <input
            type="text"
            placeholder="Caută un utilizator..."
            value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value); handleSearch(); }}
          />
          {searchResults.length > 0 && (
            <div className="search-results">
              {searchResults.map(user => (
                <div key={user.id} className="conversation-item" onClick={() => handleSelectUser(user)}>
                  {user.imagineProfil ? (
                    <img src={user.imagineProfil} alt={user.nume} className="conversation-avatar" />
                  ) : (
                    <FaUserCircle className="conversation-avatar-default" style={{ color: "#bbb" }} />
                  )}
                  <span>{user.nume}</span>
                </div>
              ))}
            </div>
          )}
          <div className="no-messages">
            <div className="messages-icon-wrapper">
              <FaUserCircle className="messages-icon" style={{ color: "#bbb" }} />
            </div>
            <h2 style={{ color: "#999" }}>No message requests</h2>
            <p style={{ color: "#999" }}>You don't have any message requests.</p>
          </div>
        </div>
      ) : (
        <div className="messages-layout">
          <div className="sidebar">
            <input
              type="text"
              placeholder="Caută un utilizator..."
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); handleSearch(); }}
            />
            <div className="conversation-list">
              {(searchResults.length > 0 ? searchResults : conversatii).map(user => (
                <div key={user.id} className="conversation-item" onClick={() => handleSelectUser(user)}>
                  {user.imagineProfil ? (
                    <img src={user.imagineProfil} alt={user.nume} className="conversation-avatar" />
                  ) : (
                    <FaUserCircle className="conversation-avatar-default" style={{ color: "#bbb" }} />
                  )}
                  <span>{user.nume}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="chat-area">
            {selectedUser ? (
              <>
                <div className="chat-header">
                  {selectedUser.imagineProfil ? (
                    <img src={selectedUser.imagineProfil} alt={selectedUser.nume} className="chat-user-avatar" />
                  ) : (
                    <FaUserCircle className="chat-user-avatar-default" style={{ color: "#bbb" }} />
                  )}
                  <span className="chat-user-name">{selectedUser.nume}</span>
                </div>

                <div className="messages-list">
                  {messages.map((msg, index) => (
                    <div key={index} className={msg.senderId === currentUserId ? "message-sent" : "message-received"}>
                      <p>{msg.text}</p>
                      <span>{new Date(msg.timestamp).toLocaleTimeString()}</span>
                    </div>
                  ))}
                </div>

                <div className="send-message">
                  <input
                    type="text"
                    placeholder="Scrie un mesaj..."
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                  />
                  <button onClick={handleSendMessage}>Trimite</button>
                </div>
              </>
            ) : (
              <div className="no-messages">
                <div className="messages-icon-wrapper">
                  <FaUserCircle className="messages-icon" style={{ color: "#bbb" }} />
                </div>
                <h2 style={{ color: "#999" }}>Selectează un utilizator pentru a începe conversația</h2>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;
