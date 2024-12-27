const express = require('express');
const router = express.Router();
const multer = require('multer');
const profileService = require('../services/profile.service');
const authMiddleware = require('../middleware/auth.middleware');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

router.put('/', authMiddleware, async (req, res) => {
  try {
    const user = await profileService.updateProfile(req.userId, req.body);
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/image', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      throw new Error('No image file provided');
    }
    const imagePath = `/uploads/${req.file.filename}`;
    const user = await profileService.updateImage(req.userId, imagePath);
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/language', authMiddleware, async (req, res) => {
  try {
    const { language } = req.body;
    const user = await profileService.updateLanguage(req.userId, language);
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/location', authMiddleware, async (req, res) => {
  try {
    const { longitude, latitude } = req.body;
    const user = await profileService.updateLocation(req.userId, [longitude, latitude]);
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router; 