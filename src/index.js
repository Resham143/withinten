require('dotenv').config();
const express = require('express');
const path = require('path');
const sequelize = require('./config/database');
const redisClient = require('./config/redis');
const app = express();
const port = process.env.PORT || 3011;

// Handle Redis connection
redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

redisClient.on('connect', () => {
  console.log('Connected to Redis');
});

// Import routes
const storeRoutes = require('./routes/store.routes');
const ownerRoutes = require('./routes/owner.routes');
const authRoutes = require('./routes/auth.routes');

// Database connection and sync
sequelize.authenticate()
  .then(() => {
    console.log('Connected to MySQL');
    return sequelize.sync({ alter: true });
  })
  .catch(err => console.error('Database connection error:', err));

app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Middleware to validate headers
const validateHeaders = (req, res, next) => {
  const signature = req.headers['x-signature'];
  const channel = req.headers['x-channel'];

  if (!signature) {
    return res.status(400).json({ error: 'Missing x-signature header' });
  }

  if (!channel) {
    return res.status(400).json({ error: 'Missing x-channel header' });
  }
  
  next();
};

app.use(validateHeaders);

// Routes
app.use('/owner/auth', authRoutes);
app.use('/owner/store', storeRoutes);
app.use('/owner', ownerRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 