import React, { useState } from 'react';
import './ChatSupport.css';

const ChatSupport = () => {
  const [showChat, setShowChat] = useState(false);

  return (
    <>
      <button className="chat-support" onClick={() => setShowChat(!showChat)}>
        ? Chat Support
      </button>

      {showChat && (
        <div className="chat-modal">
          <div className="chat-box">
            <button className="close-btn" onClick={() => setShowChat(false)}>×</button>
            <div className="chat-header">PhotoSession Chat</div>
            <p>Cu ce te putem ajuta?</p>
            <div className="chat-body">
              <div className="chat-option" onClick={() => alert('Suport utilizatori')}>
                <div className="chat-option-icon">👤</div>
                Suport pentru clienți
              </div>
              <div className="chat-option" onClick={() => alert('Suport fotografi')}>
                <div className="chat-option-icon">📸</div>
                Suport pentru fotografi/videografi
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatSupport;
