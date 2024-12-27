const express = require('express');
const router = express.Router();
const authService = require('../services/auth.service');



router.post('/request-otp', async (req, res) => {
  try {
    const { phone_number, owner_id } = req.body;
    
    // Basic validation
    if (!phone_number || !owner_id) {
      return res.status(400).json({ 
        error: 'Both phone number and owner ID are required' 
      });
    }

    const result = await authService.requestOtp(phone_number, owner_id);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/login-with-otp', async (req, res) => {
  try {
    const { phone_number, owner_id, otp } = req.body;
    
    // Basic validation
    if (!phone_number || !owner_id || !otp) {
      return res.status(400).json({ 
        error: 'Phone number, owner ID and OTP are required' 
      });
    }

    const token = await authService.loginWithOtp(phone_number, owner_id, otp);
    res.json({ token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/show-otp', async (req, res) => {
  try {
    const { phone_number, owner_id } = req.body;
    
    // Basic validation
    if (!phone_number || !owner_id) {
      return res.status(400).json({ 
        error: 'Both phone number and owner ID are required' 
      });
    }

    const otpDetails = await authService.showOtp(phone_number, owner_id);
    res.json(otpDetails);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/logout', async (req, res) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ 
                error: 'Authorization token is required' 
            });
        }

        // Extract token (remove 'Bearer ' prefix)
        const token = authHeader.split(' ')[1];

        const result = await authService.logout(token);
        res.json(result);
    } catch (error) {
        if (error.message === 'Invalid token' || error.message === 'Invalid or expired session') {
            res.status(401).json({ error: error.message });
        } else {
            res.status(400).json({ error: error.message });
        }
    }
});


module.exports = router; 