const express = require('express');
const router = express.Router();
const { pool, poolConnect } = require('../db');

// Adaugare disponibilitate
router.post('/', async (req, res) => {
  const { prestator_id, data, ora_inceput, ora_sfarsit, status, comentariu } = req.body;
  try {
    await poolConnect;
    await pool.request()
      .input('prestator_id', prestator_id)
      .input('data', data)
      .input('ora_inceput', ora_inceput)
      .input('ora_sfarsit', ora_sfarsit)
      .input('status', status || 'disponibil')
      .input('comentariu', comentariu)
      .query('INSERT INTO Disponibilitati (prestator_id, data, ora_inceput, ora_sfarsit, status, comentariu) VALUES (@prestator_id, @data, @ora_inceput, @ora_sfarsit, @status, @comentariu)');
    res.status(200).send('Disponibilitate adăugată.');
  } catch (err) {
    res.status(500).send('Eroare: ' + err.message);
  }
});

// Obtinere disponibilitati
router.get('/:prestatorId', async (req, res) => {
  const { prestatorId } = req.params;
  try {
    await poolConnect;
    const result = await pool.request()
      .input('prestator_id', prestatorId)
      .query('SELECT * FROM Disponibilitati WHERE prestator_id = @prestator_id');
    res.json(result.recordset);
  } catch (err) {
    res.status(500).send('Eroare: ' + err.message);
  }
});


router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await poolConnect;
    await pool.request()
      .input('id', id)
      .query('DELETE FROM Disponibilitati WHERE id = @id');
    res.status(200).send('Disponibilitatea a fost ștearsă.');
  } catch (err) {
    console.error('Eroare la ștergerea disponibilității:', err);
    res.status(500).send('Eroare: ' + err.message);
  }
});



router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { data, ora_inceput, ora_sfarsit, status, comentariu } = req.body;
  try {
    await poolConnect;
    await pool.request()
      .input('id', id)
      .input('data', data)
      .input('ora_inceput', ora_inceput)
      .input('ora_sfarsit', ora_sfarsit)
      .input('status', status)
      .input('comentariu', comentariu)
      .query('UPDATE Disponibilitati SET data=@data, ora_inceput=@ora_inceput, ora_sfarsit=@ora_sfarsit, status=@status, comentariu=@comentariu WHERE id=@id');
    res.status(200).send('Disponibilitatea a fost actualizată.');
  } catch (err) {
    console.error('Eroare la actualizare:', err);
    res.status(500).send('Eroare: ' + err.message);
  }
});

router.post('/marcheaza', async (req, res) => {
  const { prestator_id, data } = req.body;

  try {
    await poolConnect;

    // Transformă data în format 'YYYY-MM-DD' (fără oră)
    const doarData = new Date(data).toISOString().split("T")[0];

    await pool.request()
      .input('prestator_id', prestator_id)
      .input('data', doarData)
      .input('status', 'ocupat')
      .query(`
        UPDATE Disponibilitati
        SET status = @status
        WHERE prestator_id = @prestator_id AND CONVERT(date, data) = @data
      `);

    res.status(200).send('Ziua a fost marcată ca ocupată.');
  } catch (err) {
    console.error("Eroare la marcarea zilei:", err);
    res.status(500).send("Eroare server.");
  }
});


module.exports = router;
