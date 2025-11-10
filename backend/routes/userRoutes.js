// routes/userRoutes.js
const auth = require('../middleware/auth');
const express = require('express');
const router = express.Router();

// Здесь будут другие пользовательские маршруты
router.get('/profile', auth, (req, res) => {
  res.json({ message: 'User profile' });
});

module.exports = router;