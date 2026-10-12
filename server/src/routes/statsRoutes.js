const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/statsController');
const authMiddleware = require('../middleware/authMiddleware');
const { requireRoles, ROLE_SYSTEM_DEVELOPER, ROLE_SUPER_ADMIN, ROLE_VIEWER } = require('../middleware/roleMiddleware');

router.use(authMiddleware);

router.get(
  '/dashboard',
  requireRoles(ROLE_SYSTEM_DEVELOPER, ROLE_SUPER_ADMIN, ROLE_VIEWER),
  getDashboardStats
);

module.exports = router;
