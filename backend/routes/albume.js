const express = require("express");
const router = express.Router();
const { pool, poolConnect } = require("../db");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Configurare multer pentru salvarea fișierelor în uploads/
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1E9);
    cb(null, uniqueName + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// 🔸 Creare album cu fișiere
router.post("/create", upload.array("poze"), async (req, res) => {
  const { titlu, utilizator_id } = req.body;
  const poze = req.files.map(file => file.filename);
  if (!titlu || !utilizator_id || poze.length === 0) {
    return res.status(400).send("Date incomplete.");
  }
  try {
    await poolConnect;
    await pool.request()
      .input("titlu", titlu)
      .input("poze", poze.join(","))
      .input("utilizator_id", utilizator_id)
      .query("INSERT INTO Albume (titlu, poze, utilizator_id) VALUES (@titlu, @poze, @utilizator_id)");
    res.status(201).send("Album salvat cu succes!");
  } catch (err) {
    console.error("Eroare salvare album:", err);
    res.status(500).send("Eroare server");
  }
});

// 🔸 Obține albumele unui utilizator
router.get("/by-user/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await poolConnect;
    const result = await pool.request()
      .input("utilizator_id", id)
      .query("SELECT * FROM Albume WHERE utilizator_id = @utilizator_id");
    res.json(result.recordset);
  } catch (err) {
    console.error("Eroare preluare albume:", err);
    res.status(500).send("Eroare server");
  }
});

// 🔸 Obține album detaliat după ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await poolConnect;
    const result = await pool.request()
      .input("id", id)
      .query("SELECT * FROM Albume WHERE id = @id");
    if (result.recordset.length === 0) {
      return res.status(404).send("Albumul nu există");
    }
    res.json(result.recordset[0]);
  } catch (err) {
    console.error("Eroare preluare album:", err);
    res.status(500).send("Eroare server");
  }
});

// 🔸 Adăugare fișiere noi într-un album
router.post("/add-files", upload.array("poze"), async (req, res) => {
  const { album_id } = req.body;
  const newFiles = req.files.map(file => file.filename);
  if (!album_id || newFiles.length === 0) {
    return res.status(400).send("Date incomplete.");
  }
  try {
    await poolConnect;
    const result = await pool.request()
      .input("id", album_id)
      .query("SELECT poze FROM Albume WHERE id = @id");
    if (result.recordset.length === 0) {
      return res.status(404).send("Albumul nu există");
    }
    const existingPoze = result.recordset[0].poze ? result.recordset[0].poze.split(",") : [];
    const updatedPoze = existingPoze.concat(newFiles).join(",");
    await pool.request()
      .input("id", album_id)
      .input("poze", updatedPoze)
      .query("UPDATE Albume SET poze = @poze WHERE id = @id");
    res.send("Fișiere adăugate cu succes!");
  } catch (err) {
    console.error("Eroare adăugare fișiere:", err);
    res.status(500).send("Eroare server");
  }
});

// 🔸 Ștergere album complet
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await poolConnect;
    await pool.request().input("id", id).query("DELETE FROM Albume WHERE id = @id");
    res.send("Album șters cu succes!");
  } catch (err) {
    console.error("Eroare ștergere album:", err);
    res.status(500).send("Eroare server");
  }
});

// 🔸 Modificare titlu și ștergere fișiere individuale
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { titlu, filesToRemove } = req.body;
  try {
    await poolConnect;
    const result = await pool.request()
      .input("id", id)
      .query("SELECT poze FROM Albume WHERE id = @id");
    if (result.recordset.length === 0) {
      return res.status(404).send("Albumul nu există");
    }
    let poze = result.recordset[0].poze ? result.recordset[0].poze.split(",") : [];
    // Ștergere fișiere selectate
    if (filesToRemove && filesToRemove.length > 0) {
      filesToRemove.forEach(file => {
        poze = poze.filter(p => p !== file);
        const filePath = path.join(__dirname, "../uploads", file);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      });
    }
    await pool.request()
      .input("id", id)
      .input("titlu", titlu)
      .input("poze", poze.join(","))
      .query("UPDATE Albume SET titlu = @titlu, poze = @poze WHERE id = @id");
    res.send("Album actualizat cu succes!");
  } catch (err) {
    console.error("Eroare actualizare album:", err);
    res.status(500).send("Eroare server");
  }
});



// 🔸 Preluare albume publice ale unui utilizator
router.get('/public/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        await poolConnect;
        const result = await pool.request()
            .input("userId", userId)
            .query("SELECT id, titlu, poze FROM Albume WHERE utilizator_id = @userId");
        if (result.recordset.length > 0) {
            res.json(result.recordset);
        } else {
            res.status(404).json({ mesaj: "Niciun album găsit" });
        }
    } catch (err) {
        console.error("Eroare preluare albume publice:", err);
        res.status(500).json({ mesaj: "Eroare server" });
    }
});


// 🔸 Servire fișiere din uploads/
router.use("/uploads", express.static("uploads"));

module.exports = router;
