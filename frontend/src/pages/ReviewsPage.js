import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./ReviewsPage.css";

const ReviewsPage = () => {
  const { prestatorId } = useParams();
  const [rating, setRating] = useState(0);
  const [distribution, setDistribution] = useState({ 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
  const [reviews, setReviews] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`http://localhost:5000/api/reviews/${prestatorId}`)
      .then(res => {
        setRating(res.data.averageRating);
        setDistribution(res.data.ratingDistribution);
        setReviews(res.data.reviews);
      })
      .catch(err => console.error("Eroare la preluarea recenziilor:", err));
  }, [prestatorId]);

  return (
    <div className="reviews-page">
      {/* Săgeata vizibilă pentru întoarcere */}
      <button className="reviews-back-button" onClick={() => navigate(-1)}>←</button>

      {/* Container pe două coloane */}
      <div className="reviews-container">
        {/* Coloana rating general */}
        <div className="rating-section">
          <h2>{rating.toFixed(1)}</h2>
          <div className="stars">
            {'★'.repeat(Math.round(rating))}{'☆'.repeat(5 - Math.round(rating))}
          </div>
          <p className="total-reviews">bazat pe {reviews.length} recenzii</p>
        </div>

        {/* Coloana distribuție bare */}
        <div className="distribution-section">
          {[5, 4, 3, 2, 1].map(stars => (
            <div key={stars} className="distribution-row">
              {stars} stele
              <progress value={distribution[stars]} max="100" />
              {distribution[stars]}%
            </div>
          ))}
        </div>
      </div>

      {/* Recenzii reale sau mesaj dacă nu există */}
      {reviews.length > 0 ? (
        <div className="reviews-list">
          {reviews.map(review => (
            <div key={review.id} className="reviews-item">
              <div>{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</div>
              <p>{review.comment}</p>
              <strong>{review.clientName}</strong>
            </div>
          ))}
        </div>
      ) : (
        <p className="reviews-no-message">Nu există recenzii încă</p>
      )}
    </div>
  );
};

export default ReviewsPage;
