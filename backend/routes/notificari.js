const express = require('express');
const router = express.Router();
const { pool, poolConnect } = require('../db');

// Obține toate notificările pentru un utilizator (doar cele unde e destinatar)
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    await poolConnect;

    const result = await pool.request()
      .input('userId', userId)
      .query(`
        SELECT 
          n.id,
          n.mesaj,
          n.data AS data_creare,
          n.status,
          n.rezervare_id,
          u.nume AS expeditor_nume,
          u.imagineProfil AS expeditor_imagine
        FROM Notificari n
        JOIN Utilizatori u ON n.expeditor_id = u.id
        WHERE n.destinatar_id = @userId
        ORDER BY n.data DESC
      `);

    res.json(result.recordset);
  } catch (err) {
    console.error('Eroare la obținerea notificărilor:', err);
    res.status(500).json({ mesaj: 'Eroare la obținerea notificărilor' });
  }
});

// ✅ Marchează o notificare ca fiind citită
router.put('/:id/citita', async (req, res) => {
  const { id } = req.params;

  try {
    await poolConnect;

    await pool.request()
      .input('id', id)
      .query(`
        UPDATE Notificari 
        SET status = 'citit' 
        WHERE id = @id
      `);

    res.status(200).send('Notificare marcată ca citită.');
  } catch (err) {
    console.error("Eroare la actualizarea notificării:", err);
    res.status(500).send('Eroare server.');
  }
});

module.exports = router;
