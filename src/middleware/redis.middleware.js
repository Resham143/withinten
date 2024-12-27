const redisClient = require('../config/redis');

const checkRedisConnection = async (req, res, next) => {
  try {
    if (!redisClient.isReady) {
      await redisClient.connect();
    }
    next();
  } catch (error) {
    console.error('Redis connection error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = checkRedisConnection; 