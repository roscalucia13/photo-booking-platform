const express = require('express');
const router = express.Router();
const { pool, poolConnect } = require('../db');

// 🔥 Creare rezervare + notificare pentru prestator
router.post('/', async (req, res) => {
  const { client_id, prestator_id, data, ora_inceput, ora_sfarsit, mesaj, descriere } = req.body;
  const status = req.body.status || 'în așteptare';
  const created_at = new Date();

  try {
    await poolConnect;

    const insertRez = await pool.request()
      .input('client_id', client_id)
      .input('prestator_id', prestator_id)
      .input('data', data)
      .input('ora_inceput', ora_inceput)
      .input('ora_sfarsit', ora_sfarsit)
      .input('mesaj', mesaj)
      .input('descriere', descriere)
      .input('status', status)
      .input('created_at', created_at)
      .query(`
        INSERT INTO Rezervari 
          (client_id, prestator_id, data, ora_inceput, ora_sfarsit, mesaj, descriere, status, created_at)
        OUTPUT INSERTED.id
        VALUES 
          (@client_id, @prestator_id, @data, @ora_inceput, @ora_sfarsit, @mesaj, @descriere, @status, @created_at)
      `);

    const rezervareId = insertRez.recordset[0].id;

    // Notificare către prestator
    await pool.request()
      .input('destinatar_id', prestator_id)
      .input('expeditor_id', client_id)
      .input('mesaj', `Ai primit o cerere de rezervare pentru data ${data}, ora ${ora_inceput}.`)
      .input('status', 'necitit')
      .input('rezervare_id', rezervareId)
      .query(`
        INSERT INTO Notificari (destinatar_id, expeditor_id, mesaj, status, rezervare_id)
        VALUES (@destinatar_id, @expeditor_id, @mesaj, @status, @rezervare_id)
      `);

    res.status(200).send('Rezervare creată cu status în așteptare.');
  } catch (err) {
    console.error("Eroare la crearea rezervării:", err);
    res.status(500).send('Eroare: ' + err.message);
  }
});

// 🔥 Confirmare/refuz rezervare + notificare pentru client
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    await poolConnect;

    await pool.request()
      .input('id', id)
      .input('status', status)
      .query('UPDATE Rezervari SET status = @status WHERE id = @id');

    const rezultat = await pool.request()
      .input('id', id)
      .query('SELECT client_id, prestator_id, data, ora_inceput FROM Rezervari WHERE id = @id');

    if (rezultat.recordset.length > 0) {
      const { client_id, prestator_id, data, ora_inceput } = rezultat.recordset[0];
      const dataObj = new Date(data);
    const oraObj = new Date(ora_inceput);

    const dataFormatata = `${String(dataObj.getDate()).padStart(2, '0')}.${String(dataObj.getMonth() + 1).padStart(2, '0')}.${dataObj.getFullYear()}`;
    const oraFormatata = `${String(oraObj.getHours()).padStart(2, '0')}:${String(oraObj.getMinutes()).padStart(2, '0')}`;

    const mesajClient = `Rezervarea ta pentru ${dataFormatata} la ora ${oraFormatata} a fost ${status}.`;


      await pool.request()
        .input('destinatar_id', client_id)
        .input('expeditor_id', prestator_id)
        .input('mesaj', mesajClient)
        .input('status', 'necitit')
        .input('rezervare_id', id)
        .query(`
          INSERT INTO Notificari (destinatar_id, expeditor_id, mesaj, status, rezervare_id)
          VALUES (@destinatar_id, @expeditor_id, @mesaj, @status, @rezervare_id)
        `);
    }

    res.status(200).send('Status rezervare actualizat.');
  } catch (err) {
    console.error("Eroare la actualizarea statusului:", err);
    res.status(500).send('Eroare: ' + err.message);
  }
});

// 🔍 Detalii rezervare pentru notificare
router.get('/detalii/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await poolConnect;

    const result = await pool.request()
      .input('id', id)
      .query(`
        SELECT 
          r.id,
          r.data,
          r.ora_inceput,
          r.ora_sfarsit,
          r.mesaj,
          r.descriere,
          r.status,
          u.nume AS client_nume,
          u.imagineProfil AS client_imagine,
          u.id AS client_id
        FROM Rezervari r
        JOIN Utilizatori u ON r.client_id = u.id
        WHERE r.id = @id
      `);

    if (result.recordset.length > 0) {
      res.json(result.recordset[0]);
    } else {
      res.status(404).send('Rezervare inexistentă.');
    }
  } catch (err) {
    console.error("Eroare la obținerea detaliilor rezervării:", err);
    res.status(500).send('Eroare server.');
  }
});

// 🔥 Finalizare sesiune + adăugare client în DestinatariCloud + notificare
router.post('/finalizeaza', async (req, res) => {
  const { rezervareId, clientId, prestatorId } = req.body;

  try {
    await poolConnect;

    await pool.request()
      .input("rezervareId", rezervareId)
      .query("UPDATE Rezervari SET status = 'finalizata' WHERE id = @rezervareId");

    await pool.request()
      .input("clientId", clientId)
      .input("prestatorId", prestatorId)
      .query(`
        IF NOT EXISTS (
          SELECT 1 FROM DestinatariCloud 
          WHERE client_id = @clientId AND prestator_id = @prestatorId
        )
        INSERT INTO DestinatariCloud (client_id, prestator_id)
        VALUES (@clientId, @prestatorId)
      `);

    await pool.request()
      .input("destinatar_id", clientId)
      .input("expeditor_id", prestatorId)
      .input("mesaj", "Sesiunea ta a fost finalizată. Poți primi fișierele foto/video de la prestator.")
      .input("status", "necitit")
      .input("rezervare_id", rezervareId)
      .query(`
        INSERT INTO Notificari (destinatar_id, expeditor_id, mesaj, status, rezervare_id)
        VALUES (@destinatar_id, @expeditor_id, @mesaj, @status, @rezervare_id)
      `);

    res.status(200).send("Sesiune finalizată și client adăugat pentru partajare media.");
  } catch (err) {
    console.error("Eroare la finalizare sesiune:", err);
    res.status(500).send("Eroare la finalizare.");
  }
});


router.get('/finalizate/:clientId', async (req, res) => {
  const { clientId } = req.params;

  try {
    await poolConnect;

    const result = await pool.request()
      .input('clientId', clientId)
      .query(`
        SELECT 
          r.id,
          r.data,
          r.ora_inceput,
          r.ora_sfarsit,
          r.prestator_id,
          u.nume AS prestator_nume,
          u.imagineProfil AS prestator_imagine
        FROM Rezervari r
        JOIN Utilizatori u ON r.prestator_id = u.id
        WHERE r.client_id = @clientId AND r.status = 'finalizata'
        ORDER BY r.data DESC
      `);

    res.json(result.recordset);
  } catch (err) {
    console.error("Eroare la obținerea sesiunilor finalizate:", err);
    res.status(500).send("Eroare server.");
  }
});




// routes/recenzii.js

router.get('/gata/:clientId', async (req, res) => {
  const { clientId } = req.params;

  try {
    await poolConnect;

    const result = await pool.request()
      .input("clientId", clientId)
      .query(`
        SELECT DISTINCT u.id, u.nume, u.imagineProfil
        FROM Rezervari r
        JOIN Utilizatori u ON r.prestator_id = u.id
        WHERE r.client_id = @clientId
          AND r.status = 'finalizata'
          AND NOT EXISTS (
            SELECT 1 FROM Recenzii rec
            WHERE rec.client_id = r.client_id AND rec.prestator_id = r.prestator_id
          )
      `);

    res.json(result.recordset);
  } catch (err) {
    console.error("Eroare la preluarea prestatorilor pentru recenzie:", err);
    res.status(500).send("Eroare server");
  }
});


module.exports = router;
