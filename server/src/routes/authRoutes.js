const express = require('express');
const router = express.Router();
const { 
  login, 
  getMe, 
  updateProfile, 
  changePassword,
  getSuperAdminSecretCode,
  updateSuperAdminSecretCode
} = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// Public route
router.post('/login', login);

// Authenticated user profile & password routes
router.get('/me', authMiddleware, getMe);
router.put('/profile', authMiddleware, updateProfile);
router.put('/change-password', authMiddleware, changePassword);

// Super Admin 2FA Secret Code management
router.get('/secret-code', authMiddleware, getSuperAdminSecretCode);
router.put('/secret-code', authMiddleware, updateSuperAdminSecretCode);

module.exports = router;
