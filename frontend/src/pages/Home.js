import React from 'react';
import './Home.css';
import { useNavigate } from 'react-router-dom';
import ChatSupport from './ChatSupport';


const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <div className="main-content">
        <div className="home-text">
          <h1>Bine ai venit în lumea fotografiei și videografiei!</h1>
          <p>Un spațiu unde amintirile prind contur, iar pasionații de frumos se întâlnesc cu cei care știu să-l surprindă.</p>
          <button className="cta-button" onClick={() => navigate('/search')}>
            Caută inspirație
          </button>
        </div>
        <div className="home-image">
          <img src="/hero-image.jpg" alt="Photography" />
        </div>
      </div>

      <div className="extra-content">
        <h2>Descoperă serviciile noastre</h2>
        <p>
          Fie că ești în căutarea unui fotograf care să transforme momentele tale speciale în imagini de neuitat, fie că ești un profesionist ce dorește să-și expună talentul și să ajungă la clienții potriviți – aici e locul tău.
          Explorează. Inspiră. Creează conexiuni prin imagine.
        </p>
        <button className="register-button" onClick={() => navigate('/choose-account')}>
          Creează un cont
        </button>
      </div>

      {/* Footer cu 4 coloane și centru corect */}
      <footer className="footer-section">
        <div className="footer-content">
          <div className="footer-photo">
            <h4>PhotoSession</h4>
            <ul>
              <li onClick={() => navigate('/about')}>Despre noi</li>
              <li onClick={() => navigate('/contact')}>Contactați-ne</li>
            </ul>
          </div>

          <div className="footer-discover">
            <h4>Descoperă</h4>
            <ul>
              <li onClick={() => navigate('/search')}>Căutare</li>
              <li onClick={() => navigate('/messages')}>Mesagerie</li>
              <li onClick={() => navigate('/profile')}>Profil</li>
              <li onClick={() => navigate('/notifications')}>Notificări</li>
            </ul>
          </div>

          <div className="footer-links">
            <h4>Navigare rapidă</h4>
            <ul>
              <li onClick={() => navigate('/')}>Acasă</li>
              <li onClick={() => navigate('/search')}>Caută inspirație</li>
              <li onClick={() => navigate('/choose-account')}>Înregistrare</li>
              <li onClick={() => navigate('/about')}>Despre platformă</li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
  <h2>PhotoSession</h2>
  <ChatSupport />
</div>

      </footer>
    </div>
  );
};

export default Home;
