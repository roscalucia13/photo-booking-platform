const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();
const { pool, poolConnect, sql } = require('../db');
const multer = require('multer');
const path = require('path');
const SECRET_KEY = 'cheia_mea_secreta';

// Configurare multer pentru upload imagine profil
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/profile/'), // Asigură-te că această cale există
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

// 🔥 Înregistrare utilizator
router.post('/register', async (req, res) => {
    const { nume, email, parola, rol, tip_serviciu, locatie } = req.body;
    try {
        await poolConnect;
        const hashedPassword = await bcrypt.hash(parola, 10);

        const request = pool.request();
        request.input('nume', nume);
        request.input('email', email);
        request.input('parola', hashedPassword);
        request.input('rol', rol);
        request.input('tip_serviciu', tip_serviciu || null);
        request.input('locatie', locatie || null);

        await request.query(`
            INSERT INTO Utilizatori (nume, email, parola, rol, tip_serviciu, locatie)
            VALUES (@nume, @email, @parola, @rol, @tip_serviciu, @locatie)
        `);

        const result = await pool.request()
            .input('email', email)
            .query('SELECT * FROM Utilizatori WHERE email = @email');

        const utilizator = result.recordset[0];

        const token = jwt.sign(
            { id: utilizator.id, rol: utilizator.rol },
            SECRET_KEY,
            { expiresIn: '1h' }
        );

        res.status(201).json({
            mesaj: 'Cont creat cu succes!',
            utilizator: {
                id: utilizator.id,
                nume: utilizator.nume,
                email: utilizator.email,
                rol: utilizator.rol,
                tip_serviciu: utilizator.tip_serviciu,
                locatie: utilizator.locatie
                
                
            },
            token
        });
    } catch (err) {
        console.error('Eroare la înregistrare:', err);
        res.status(500).json({ mesaj: 'Eroare la server.' });
    }
});

// 🔥 Autentificare utilizator
router.post('/login', async (req, res) => {
    const { email, parola } = req.body;
    try {
        await poolConnect;
        const result = await pool.request()
            .input('email', email)
            .query('SELECT * FROM Utilizatori WHERE email = @email');

        const utilizator = result.recordset[0];
        if (!utilizator) {
            return res.status(401).json({ mesaj: 'Email incorect' });
        }

        const parolaCorecta = await bcrypt.compare(parola, utilizator.parola);
        if (!parolaCorecta) {
            return res.status(401).json({ mesaj: 'Parolă incorectă' });
        }

        const token = jwt.sign(
            { id: utilizator.id, rol: utilizator.rol },
            SECRET_KEY,
            { expiresIn: '1h' }
        );

        res.json({
            mesaj: 'Autentificare reușită',
            utilizator: {
                id: utilizator.id,
                nume: utilizator.nume,
                email: utilizator.email,
                rol: utilizator.rol,
                tip_serviciu: utilizator.tip_serviciu,
                locatie: utilizator.locatie,
                imagineProfil: utilizator.imagineProfil
                
            },
            token
        });
    } catch (err) {
        console.error('Eroare la autentificare:', err);
        res.status(500).json({ mesaj: 'Eroare la server' });
    }
});

// 🔥 Actualizare date profil (CORECTAT)
router.put('/update/:id', async (req, res) => {
    const { nume, tip_serviciu, locatie, imagineProfil } = req.body;
    const { id } = req.params;
    try {
        await poolConnect;
        const request = pool.request().input('id', id);
        const updates = [];

        if (nume !== undefined) {
            request.input('nume', nume);
            updates.push('nume = @nume');
        }
        if (tip_serviciu !== undefined) {
            request.input('tip_serviciu', tip_serviciu);
            updates.push('tip_serviciu = @tip_serviciu');
        }
        if (locatie !== undefined) {
            request.input('locatie', locatie);
            updates.push('locatie = @locatie');
        }
        if (imagineProfil !== undefined) {
            request.input('imagineProfil', imagineProfil);
            updates.push('imagineProfil = @imagineProfil');
        }

        if (updates.length === 0) {
            return res.status(400).send("Nu s-au trimis câmpuri de actualizat.");
        }

        const updateQuery = `
            UPDATE Utilizatori
            SET ${updates.join(', ')}
            WHERE id = @id
        `;

        await request.query(updateQuery);
        res.send("Profil actualizat cu succes!");
    } catch (err) {
        console.error("Eroare la actualizare:", err);
        res.status(500).send("Eroare la server");
    }
});

// 🔥 Salvare servicii și preț
router.post('/services', async (req, res) => {
    const { userId, servicii_offered, pret_minim, pret_maxim } = req.body;
    if (!userId) {
        return res.status(400).json({ message: "UserId este necesar" });
    }
    try {
        await poolConnect;
        const request = pool.request();
        request.input('userId', userId);
        request.input('servicii_offered', servicii_offered);
        request.input('pret_minim', pret_minim);
        request.input('pret_maxim', pret_maxim);

        await request.query(`
            UPDATE Utilizatori
            SET servicii_offered = @servicii_offered,
                pret_minim = @pret_minim,
                pret_maxim = @pret_maxim
            WHERE id = @userId
        `);

        res.json({ mesaj: "Serviciile și prețurile au fost actualizate cu succes!" });
    } catch (err) {
        console.error("Eroare la actualizarea serviciilor:", err);
        res.status(500).json({ mesaj: "Eroare la salvare" });
    }
});

// 🔥 Preluare servicii și preț
router.get('/services/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await poolConnect;
        const result = await pool.request()
            .input('id', id)
            .query('SELECT servicii_offered, pret_minim, pret_maxim FROM Utilizatori WHERE id = @id');
        if (result.recordset.length > 0) {
            res.json(result.recordset[0]);
        } else {
            res.status(404).json({ mesaj: "Utilizatorul nu a fost găsit" });
        }
    } catch (err) {
        console.error("Eroare la preluarea serviciilor:", err);
        res.status(500).json({ mesaj: "Eroare la preluare" });
    }
});

// 🔥 Preluare date utilizator (nume, tip_serviciu, locatie)
router.get('/profile/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await poolConnect;
        const result = await pool.request()
            .input('id', id)
            .query('SELECT nume, tip_serviciu, locatie, imagineProfil FROM Utilizatori WHERE id = @id');
        if (result.recordset.length > 0) {
            res.json(result.recordset[0]);
        } else {
            res.status(404).json({ mesaj: "Utilizatorul nu a fost găsit" });
        }
    } catch (err) {
        console.error("Eroare la preluarea datelor profil:", err);
        res.status(500).json({ mesaj: "Eroare la preluare" });
    }
});





//căutarea
router.get('/search', async (req, res) => {
    const { term, locatie, tip_serviciu, pret_minim, pret_maxim } = req.query;
    try {
        await poolConnect;
        let query = `
            SELECT id, nume, tip_serviciu, locatie, imagineProfil, 
                   ISNULL(pret_minim, 0) AS pret_minim, ISNULL(pret_maxim, 0) AS pret_maxim 
            FROM Utilizatori
            WHERE rol IN ('fotograf', 'videograf')
        `;
        const filters = [];

        if (term) {
            filters.push(`(nume LIKE @term OR locatie LIKE @term OR tip_serviciu LIKE @term)`);
        }
        if (locatie) {
            filters.push(`locatie = @locatie`);
        }
        if (tip_serviciu) {
            filters.push(`tip_serviciu = @tip_serviciu`);
        }
        if (pret_minim) {
            filters.push(`(pret_minim IS NOT NULL AND pret_minim >= @pret_minim)`);
        }
        if (pret_maxim) {
            filters.push(`(pret_maxim IS NOT NULL AND pret_maxim <= @pret_maxim)`);
        }

        if (filters.length > 0) {
            query += " AND " + filters.join(" AND ");
        }

        const request = pool.request();
        if (term) request.input('term', `%${term}%`);
        if (locatie) request.input('locatie', locatie);
        if (tip_serviciu) request.input('tip_serviciu', tip_serviciu);
        if (pret_minim) request.input('pret_minim', pret_minim);
        if (pret_maxim) request.input('pret_maxim', pret_maxim);

        const result = await request.query(query);
        res.json(result.recordset);
    } catch (err) {
        console.error("Eroare la căutare:", err);
        res.status(500).json({ mesaj: "Eroare la preluarea utilizatorilor" });
    }
});






// 🔥 Preluare toți utilizatorii pentru mesagerie
router.get('/all', async (req, res) => {
    try {
        await poolConnect;
        const result = await pool.request()
            .query('SELECT id, nume, imagineProfil FROM Utilizatori');
        res.json(result.recordset);
    } catch (err) {
        console.error("Eroare la preluarea utilizatorilor:", err);
        res.status(500).json({ mesaj: "Eroare la preluarea utilizatorilor" });
    }
});




// Obține utilizatorii cu care userId a avut conversații
router.get('/conversatii/:userId', async (req, res) => {
    try {
        await poolConnect;
        const { userId } = req.params;
        const request = pool.request();
        request.input('userId', sql.Int, userId);
        const result = await request.query(`
            SELECT DISTINCT 
                CASE 
                    WHEN senderId = @userId THEN receiverId 
                    ELSE senderId 
                END AS otherUserId
            FROM Messages
            WHERE senderId = @userId OR receiverId = @userId
        `);
        const usersResult = [];
        // Extragem detaliile fiecărui utilizator din Utilizatori
        for (const row of result.recordset) {
            const userDetails = await pool.request()
                .input('id', sql.Int, row.otherUserId)
                .query('SELECT id, nume, imagineProfil FROM Utilizatori WHERE id = @id');
            if (userDetails.recordset.length > 0) {
                usersResult.push(userDetails.recordset[0]);
            }
        }
        res.json(usersResult);
    } catch (err) {
        console.error("Eroare la preluarea conversațiilor:", err);
        res.status(500).json({ mesaj: "Eroare la preluare" });
    }
});



// 🔥 Upload imagine profil și actualizare în baza de date
router.post('/upload-profile/:id', upload.single('imagineProfil'), async (req, res) => {
  const { id } = req.params;
  const imaginePath = `http://localhost:5000/uploads/profile/${req.file.filename}`;
  try {
    await poolConnect;
    await pool.request()
      .input('id', id)
      .input('imagineProfil', imaginePath)
      .query('UPDATE Utilizatori SET imagineProfil = @imagineProfil WHERE id = @id');
    res.status(200).json({ imagineProfil: imaginePath });
  } catch (err) {
    console.error('Eroare upload imagine:', err);
    res.status(500).send('Eroare server');
  }
});


// În utilizatori.js sau unde ai ruta
router.get('/public-services/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await poolConnect;
    const result = await pool.request()
      .input('id', id)
      .query('SELECT servicii_offered, pret_minim, pret_maxim FROM Utilizatori WHERE id = @id');

    if (result.recordset.length > 0) {
      const raw = result.recordset[0];
      let servicii = [];

      // 🔥 Parsează o singură dată, dacă e cazul
      try {
        if (typeof raw.servicii_offered === "string") {
          servicii = JSON.parse(raw.servicii_offered);
        } else {
          servicii = raw.servicii_offered || [];
        }
      } catch (e) {
        console.error("Eroare la parsare:", e);
        servicii = [];
      }

      res.json({
        servicii_offered: servicii,
        pret_minim: raw.pret_minim,
        pret_maxim: raw.pret_maxim
      });
    } else {
      res.status(404).json({ mesaj: 'Prestatorul nu a fost găsit' });
    }
  } catch (err) {
    console.error("Eroare la preluarea serviciilor publice:", err);
    res.status(500).json({ mesaj: 'Eroare la preluare' });
  }
});






// 🔥 Ruta nouă pentru rezervare - profil complet prestator
router.get('/rezervare-info/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await poolConnect;
    const result = await pool.request()
      .input('id', id)
      .query(`
        SELECT nume, locatie, servicii_offered 
        FROM Utilizatori 
        WHERE id = @id
      `);

    if (result.recordset.length > 0) {
      const raw = result.recordset[0];
      let servicii = [];

      try {
        if (typeof raw.servicii_offered === "string") {
          servicii = JSON.parse(raw.servicii_offered);
        } else {
          servicii = raw.servicii_offered || [];
        }
      } catch (e) {
        console.error("Eroare parsare servicii:", e);
      }

      res.json({
        nume: raw.nume,
        locatie: raw.locatie,
        servicii_offered: servicii
      });
    } else {
      res.status(404).json({ mesaj: "Prestatorul nu a fost găsit" });
    }
  } catch (err) {
    console.error("Eroare la preluarea datelor pentru rezervare:", err);
    res.status(500).json({ mesaj: "Eroare la server" });
  }
});





module.exports = router;
