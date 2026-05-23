import React from 'react';
import { Link } from "react-router-dom";
import './AccessDenied.css'; // Importăm fișierul CSS

function AccessDenied() {
    return (
        <div className="access-denied-container">
            <div className="access-denied-box">
                <h2 className="access-denied-title">Acces restricționat</h2>
                <p className="access-denied-message">
                    Pentru a accesa această funcționalitate, vă rugăm să vă conectați sau să creați un cont.
                </p>
                <div className="access-denied-buttons">
                    <Link to="/login">
                        <button className="access-button">Conectare</button>
                    </Link>
                    <Link to="/choose-account"> {/* Modificare aici */}
                        <button className="access-button">Creează cont</button>
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default AccessDenied;
