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
const { requireRoles, ROLE_SYSTEM_DEVELOPER } = require('../middleware/roleMiddleware');

router.use(authMiddleware);
// Root level system maintenance & role management is exclusive to SYSTEM_DEVELOPER
router.use(requireRoles(ROLE_SYSTEM_DEVELOPER));

router.get('/settings', getSystemSettings);
router.put('/settings', updateSystemSettings);

router.get('/logs', getSystemLogs);

router.get('/users', getUsers);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

router.post('/backup', triggerBackup);

module.exports = router;
