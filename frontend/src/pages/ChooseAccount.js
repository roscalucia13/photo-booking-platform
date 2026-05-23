import React from "react";
import "./Auth.css";
import { Link } from "react-router-dom";

const ChooseAccount = () => {
  return (
    <div className="auth-container">
      <h2>Create an account</h2>
      <Link to="/register-user" className="account-option">
        As a simple user
      </Link>
      <Link to="/register-photographer" className="account-option">
        As a photographer/videographer
      </Link>
    </div>
  );
};

export default ChooseAccount;
