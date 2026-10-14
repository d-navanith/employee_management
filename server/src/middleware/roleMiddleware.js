/**
 * Role-Based Access Control (RBAC) Middleware
 * Validates whether the authenticated user has sufficient privilege.
 */
const requireRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Forbidden: Access restricted. Required role: [${allowedRoles.join(', ')}], current role: ${req.user.role}`
      });
    }

    next();
  };
};

module.exports = {
  requireRoles,
  ROLE_SUPER_ADMIN: 'SUPER_ADMIN',
  ROLE_VIEWER: 'VIEWER'
};
