const express = require('express');
const router = express.Router();
const storeService = require('../services/store.service');

// Store registration endpoint
router.post('/register', async (req, res) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        status: 'failed',
        message: 'Authorization token is required'
      });
    }

    // Extract token (remove 'Bearer ' prefix)
    const token = authHeader.split(' ')[1];

    const storeData = {
      store_name: req.body.store_name,
      owner_id: req.body.owner_id
    };

    const result = await storeService.register(storeData, token);
    res.status(200).json({
      status: 'success',
      message: 'Store registered successfully',
      data: result
    });
  } catch (error) {
    const statusCode = error.message.includes('Unauthorized') ? 401 : 400;
    res.status(statusCode).json({
      status: 'failed',
      message: error.message
    });
  }
});

router.post('/complete-profile', async (req, res) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        status: 'failed',
        message: 'Authorization token is required'
      });
    }

    // Extract token (remove 'Bearer ' prefix)
    const token = authHeader.split(' ')[1];

    const profileData = {
      store_id: req.body.store_id,
      store_name: req.body.store_name,
      store_image: req.body.store_image,
      address: req.body.address,
      latitude: req.body.latitude,
      longitude: req.body.longitude,
      landmark: req.body.landmark,
      city: req.body.city,
      state: req.body.state,
      pincode: req.body.pincode,
      opening_time: req.body.opening_time,
      closing_time: req.body.closing_time
    };

    const result = await storeService.completeProfile(profileData, token);
    res.status(200).json({
      status: 'success',
      message: 'Store profile completed successfully',
      data: result
    });
  } catch (error) {
    const statusCode = error.message.includes('unauthorized') || 
                      error.message.includes('Invalid token') || 
                      error.message.includes('expired session') ? 401 : 400;
    res.status(statusCode).json({
      status: 'failed',
      message: error.message
    });
  }
});

// Get store details
router.get('/:store_id', async (req, res) => {
  try {
    const { store_id } = req.params;
    const result = await storeService.getStoreDetails(store_id);
    res.status(200).json({
      status: 'success',
      message: 'Store details retrieved successfully',
      data: result
    });
  } catch (error) {
    res.status(400).json({
      status: 'failed',
      message: error.message
    });
  }
});

// Add these new routes
router.post('/open', async (req, res) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        status: 'failed',
        message: 'Authorization token is required'
      });
    }

    const token = authHeader.split(' ')[1];
    const { store_id } = req.body;

    if (!store_id) {
      return res.status(400).json({
        status: 'failed',
        message: 'Store ID is required'
      });
    }

    const result = await storeService.updateStoreStatus(store_id, token, true);
    res.status(200).json({
      status: 'success',
      message: 'Store opened successfully',
      data: result
    });
  } catch (error) {
    const statusCode = error.message.includes('unauthorized') || 
                      error.message.includes('Invalid token') || 
                      error.message.includes('expired session') ? 401 : 400;
    res.status(statusCode).json({
      status: 'failed',
      message: error.message
    });
  }
});

router.post('/close', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        status: 'failed',
        message: 'Authorization token is required'
      });
    }

    const token = authHeader.split(' ')[1];
    const { store_id } = req.body;

    if (!store_id) {
      return res.status(400).json({
        status: 'failed',
        message: 'Store ID is required'
      });
    }

    const result = await storeService.updateStoreStatus(store_id, token, false);
    res.status(200).json({
      status: 'success',
      message: 'Store closed successfully',
      data: result
    });
  } catch (error) {
    const statusCode = error.message.includes('unauthorized') || 
                      error.message.includes('Invalid token') || 
                      error.message.includes('expired session') ? 401 : 400;
    res.status(statusCode).json({
      status: 'failed',
      message: error.message
    });
  }
});

module.exports = router; 