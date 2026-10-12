const express = require('express');
const router = express.Router();
const {
  getEmployees,
  getEmployeeById,
  getNextEmployeeId,
  createEmployee,
  updateEmployee,
  deleteEmployee
} = require('../controllers/employeeController');
const authMiddleware = require('../middleware/authMiddleware');
const { requireRoles, ROLE_SYSTEM_DEVELOPER, ROLE_SUPER_ADMIN, ROLE_VIEWER } = require('../middleware/roleMiddleware');

router.use(authMiddleware);

// List & view single employee
router.get('/', requireRoles(ROLE_SYSTEM_DEVELOPER, ROLE_SUPER_ADMIN, ROLE_VIEWER), getEmployees);
router.get('/next-id', requireRoles(ROLE_SYSTEM_DEVELOPER, ROLE_SUPER_ADMIN), getNextEmployeeId);
router.get('/:id', requireRoles(ROLE_SYSTEM_DEVELOPER, ROLE_SUPER_ADMIN, ROLE_VIEWER), getEmployeeById);

// Manage/Create/Edit/Delete restricted to SYSTEM_DEVELOPER and SUPER_ADMIN
router.post('/', requireRoles(ROLE_SYSTEM_DEVELOPER, ROLE_SUPER_ADMIN), createEmployee);
router.put('/:id', requireRoles(ROLE_SYSTEM_DEVELOPER, ROLE_SUPER_ADMIN), updateEmployee);
router.delete('/:id', requireRoles(ROLE_SYSTEM_DEVELOPER, ROLE_SUPER_ADMIN), deleteEmployee);

module.exports = router;
