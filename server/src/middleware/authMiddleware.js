const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'smarthr_secure_jwt_secret_key_9823487123');

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, name: true, role: true, status: true }
    });

    if (!user) {
      return res.status(401).json({ message: 'User not found or session expired.' });
    }

    if (user.status !== 'ACTIVE') {
      return res.status(403).json({ message: 'Account is deactivated. Contact system developer.' });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (err) {
    console.error('Auth verification error:', err.message);
    return res.status(401).json({ message: 'Invalid or expired authentication token.' });
  }
};

module.exports = authMiddleware;
