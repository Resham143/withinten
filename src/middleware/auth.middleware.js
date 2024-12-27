const jwt = require('jsonwebtoken');
const StoreUser = require('../models/store-user.model');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const storeUser = await StoreUser.findOne({
      where: {
        id: decoded.userId,
        store_id: decoded.store_id,
        is_active: true
      }
    });

    if (!storeUser) {
      return res.status(401).json({ error: 'Store user not found or inactive' });
    }

    req.userId = storeUser.id;
    req.storeId = storeUser.store_id;
    req.storeUser = storeUser;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = authMiddleware; 