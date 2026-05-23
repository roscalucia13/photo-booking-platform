const express = require('express');
const router = express.Router();
const { poolConnect, pool } = require('../db');  // importă conexiunea la baza de date

// Endpoint pentru media ratingului
router.get('/average/:prestatorId', async (req, res) => {
  const { prestatorId } = req.params;
  try {
    await poolConnect;
    const result = await pool.request()
      .input('prestatorId', prestatorId)
      .query(`SELECT AVG(rating) AS averageRating FROM Recenzii WHERE prestatorId = @prestatorId`);
    const averageRating = result.recordset[0].averageRating || 0;
    res.json({ averageRating });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Eroare la calculul ratingului.' });
  }
});

// Endpoint pentru recenziile complete
router.get('/:prestatorId', async (req, res) => {
  const { prestatorId } = req.params;
  try {
    await poolConnect;
    const result = await pool.request()
      .input('prestatorId', prestatorId)
      .query(`
        SELECT r.id, r.rating, r.comment, u.nume AS clientName
        FROM Recenzii r
        JOIN Utilizatori u ON r.clientId = u.id
        WHERE r.prestatorId = @prestatorId
      `);

    const total = result.recordset.length;
    const sum = result.recordset.reduce((acc, r) => acc + r.rating, 0);
    const averageRating = total ? sum / total : 0;

    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    result.recordset.forEach(r => distribution[r.rating]++);
    Object.keys(distribution).forEach(stars => {
      distribution[stars] = total ? Math.round((distribution[stars] / total) * 100) : 0;
    });

    res.json({ averageRating, ratingDistribution: distribution, reviews: result.recordset });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Eroare la preluarea recenziilor.' });
  }
});



// 🔥 Ruta pentru prestatori disponibili pentru recenzie (sesiuni finalizate fără recenzie)
router.get('/gata/:clientId', async (req, res) => {
  const { clientId } = req.params;

  try {
    await poolConnect;

    const result = await pool.request()
      .input('clientId', clientId)
      .query(`
        SELECT u.id, u.nume, u.imagineProfil, r.id AS rezervare_id
        FROM Rezervari r
        JOIN Utilizatori u ON r.prestator_id = u.id
        WHERE r.client_id = @clientId
          AND r.status = 'finalizata'
          AND NOT EXISTS (
            SELECT 1 FROM Recenzii rec
            WHERE rec.rezervare_id = r.id
          )
      `);

    res.json(result.recordset);
  } catch (err) {
    console.error("Eroare ruta /gata/:clientId:", err);
    res.status(500).send("Eroare server");
  }
});




// 🔥 Ruta pentru salvarea unei recenzii noi
router.post('/', async (req, res) => {
  const { clientId, prestatorId, rezervareId, rating, comment } = req.body;

  try {
    await poolConnect;

    await pool.request()
      .input('clientId', clientId)
      .input('prestatorId', prestatorId)
      .input('rezervareId', rezervareId)
      .input('rating', rating)
      .input('comment', comment)
      .query(`
        INSERT INTO Recenzii (clientId, prestatorId, rezervare_id, rating, comment)
        VALUES (@clientId, @prestatorId, @rezervareId, @rating, @comment)
      `);

    res.status(201).json({ mesaj: "Recenzia a fost salvată cu succes." });
  } catch (err) {
    console.error("Eroare la salvarea recenziei:", err);
    res.status(500).json({ error: "Eroare server la salvarea recenziei." });
  }
});



// 🔁 Ruta pentru recenziile deja trimise de un client
router.get('/trimise/:clientId', async (req, res) => {
  const { clientId } = req.params;

  try {
    await poolConnect;

    const result = await pool.request()
      .input('clientId', clientId)
      .query(`
        SELECT 
          r.id,
          r.rating,
          r.comment AS text,
          r.data_recenzie,
          u.nume,
          u.imagineProfil
        FROM Recenzii r
        JOIN Utilizatori u ON r.prestatorId = u.id
        WHERE r.clientId = @clientId
        ORDER BY r.data_recenzie DESC
      `);

    res.json(result.recordset);
  } catch (err) {
    console.error("Eroare la preluarea recenziilor trimise:", err);
    res.status(500).send("Eroare server");
  }
});


router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await poolConnect;

    await pool.request()
      .input('id', id)
      .query(`DELETE FROM Recenzii WHERE id = @id`);

    res.status(200).json({ mesaj: "Recenzia a fost ștearsă." });
  } catch (err) {
    console.error("Eroare la ștergerea recenziei:", err);
    res.status(500).json({ error: "Eroare la ștergere." });
  }
});



router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { rating, comment } = req.body;

  try {
    await poolConnect;

    await pool.request()
      .input('id', id)
      .input('rating', rating)
      .input('comment', comment)
      .query(`
        UPDATE Recenzii
        SET rating = @rating, comment = @comment
        WHERE id = @id
      `);

    res.status(200).json({ mesaj: "Recenzia a fost actualizată." });
  } catch (err) {
    console.error("Eroare la actualizarea recenziei:", err);
    res.status(500).json({ error: "Eroare la actualizare." });
  }
});

module.exports = router;
