const path = require("path");
const express = require('express');
const cors = require('cors');
const albumeRoutes = require("./routes/albume");
const mesajeRoutes = require('./routes/mesaje');
const app = express();
const http = require('http');
const socketIo = require('socket.io');
const reviewsRoutes = require('./routes/reviews');
const disponibilitatiRoutes = require('./routes/disponibilitati');
const rezervariRoutes = require('./routes/rezervari');
const notificariRoutes = require('./routes/notificari');

// Middleware-uri
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Servirea fișierelor media din uploads/
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rute
const utilizatoriRoute = require('./routes/utilizatori');
app.use('/api/utilizatori', utilizatoriRoute);
app.use("/api/albume", albumeRoutes);
app.use('/api/mesaje', mesajeRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/disponibilitati', disponibilitatiRoutes);
app.use('/api/rezervari', rezervariRoutes);
app.use('/api/notificari', notificariRoutes);

// Creăm serverul HTTP și configurăm Socket.IO
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('Un utilizator s-a conectat:', socket.id);

  socket.on('join_room', (room) => {
    socket.join(room);
    console.log(`Utilizator ${socket.id} a intrat în camera ${room}`);
  });

  socket.on('send_message', (data) => {
    io.to(data.room).emit('receive_message', data);
  });

  socket.on('disconnect', () => {
    console.log('Un utilizator s-a deconectat:', socket.id);
  });
});

// Pornire server
const PORT = 5000;
server.listen(PORT, () => {
  console.log(`Serverul rulează pe portul ${PORT}`);
});
