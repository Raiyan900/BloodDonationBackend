require('dotenv').config();
// require('dotenv').config({ path: __dirname + '/.env' });
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const { Server } = require('socket.io');

const authRoutes = require('./src/routes/auth');
const donorRoutes = require('./src/routes/donors');
const requestRoutes = require('./src/routes/requests');
const adminRoutes = require('./src/routes/admin');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

io.on('connection', socket => {
  console.log('Socket connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id);
  });
});

app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/donors', donorRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/admin', adminRoutes);

const PORT = process.env.PORT || 5000;
// const MONGO = process.env.MONGO_URI || 'mongodb://localhost:27017/blooddb';
const MONGO = process.env.MONGO_URI;
if (!MONGO) {
  console.error('MONGO_URI is not defined');
  process.exit(1);
}

mongoose.connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('MongoDB connected');
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.error('MongoDB connection error:', err));
