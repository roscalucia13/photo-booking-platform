const express = require('express');
const router = express.Router();
const { pool, poolConnect, sql } = require('../db'); // Import corect

// Obține toate conversațiile unui utilizator
router.get('/:userId', async (req, res) => {
    try {
        await poolConnect;
        const { userId } = req.params;
        const request = pool.request();
        request.input('userId', sql.Int, userId);
        const result = await request.query(`
            SELECT * FROM Messages 
            WHERE senderId = @userId OR receiverId = @userId
            ORDER BY timestamp DESC
        `);
        res.json(result.recordset);
    } catch (err) {
        console.error('Eroare la preluarea mesajelor:', err);
        res.status(500).send('Eroare la preluarea mesajelor');
    }
});

// Obține conversația cu un alt utilizator
router.get('/:userId/:otherUserId', async (req, res) => {
    try {
        await poolConnect;
        const { userId, otherUserId } = req.params;
        const request = pool.request();
        request.input('userId', sql.Int, userId);
        request.input('otherUserId', sql.Int, otherUserId);
        const result = await request.query(`
            SELECT * FROM Messages 
            WHERE (senderId = @userId AND receiverId = @otherUserId)
               OR (senderId = @otherUserId AND receiverId = @userId)
            ORDER BY timestamp ASC
        `);
        res.json(result.recordset);
    } catch (err) {
        console.error('Eroare la preluarea conversației:', err);
        res.status(500).send('Eroare la preluarea conversației');
    }
});

// Trimite mesaj
router.post('/', async (req, res) => {
    try {
        await poolConnect;
        const { senderId, receiverId, text } = req.body;
        const request = pool.request();
        request.input('senderId', sql.Int, senderId);
        request.input('receiverId', sql.Int, receiverId);
        request.input('text', sql.NVarChar(sql.MAX), text);
        await request.query(`
            INSERT INTO Messages (senderId, receiverId, text)
            VALUES (@senderId, @receiverId, @text)
        `);
        res.send('Mesaj trimis');
    } catch (err) {
        console.error('Eroare la trimiterea mesajului:', err);
        res.status(500).send('Eroare la trimiterea mesajului');
    }
});

module.exports = router;
