const express = require('express');
const router = express.Router();
const {
  getSystemSettings,
  updateSystemSettings,
  getSystemLogs,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  triggerBackup
} = require('../controllers/systemController');
const authMiddleware = require('../middleware/authMiddleware');
const { requireRoles, ROLE_SUPER_ADMIN } = require('../middleware/roleMiddleware');

router.use(authMiddleware);
// Full system maintenance & role management is now granted to SUPER_ADMIN
router.use(requireRoles(ROLE_SUPER_ADMIN));

router.get('/settings', getSystemSettings);
router.put('/settings', updateSystemSettings);

router.get('/logs', getSystemLogs);

router.get('/users', getUsers);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

router.post('/backup', triggerBackup);

module.exports = router;
