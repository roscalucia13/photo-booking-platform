import React from 'react';

const Register = () => {
  return (
    <div>
      <h2>Înregistrare</h2>
      <form>
        <input type="text" placeholder="Nume" />
        <input type="email" placeholder="Email" />
        <input type="password" placeholder="Parolă" />
        <button type="submit">Înregistrează-te</button>
      </form>
    </div>
  );
};

export default Register;
