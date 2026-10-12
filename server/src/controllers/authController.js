const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');

const login = async (req, res) => {
  try {
    const { email, password, secretCode } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials. User not found.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials. Incorrect password.' });
    }

    if (user.status !== 'ACTIVE') {
      return res.status(403).json({ message: 'Account is suspended. Please contact System Developer.' });
    }

    // Check system maintenance mode
    const systemSettings = await prisma.systemSetting.findUnique({
      where: { id: 'system_config' }
    });

    if (systemSettings?.maintenanceMode && user.role !== 'SYSTEM_DEVELOPER') {
      return res.status(503).json({
        message: systemSettings.maintenanceNotice || 'System is under maintenance. Only System Developer can log in.',
        isMaintenance: true
      });
    }

    // SUPER ADMIN SECRET CODE VERIFICATION
    if (user.role === 'SUPER_ADMIN') {
      const expectedSecretCode = (systemSettings?.superAdminSecretCode || process.env.SUPER_ADMIN_SECRET_CODE || 'HR-SEC-7788').trim();

      if (!secretCode || !secretCode.trim()) {
        return res.status(403).json({
          message: 'Super Admin Secret Code is required. Please provide your security token to enter.',
          requiresSecretCode: true
        });
      }

      if (secretCode.trim() !== expectedSecretCode) {
        // Record security audit warning
        try {
          await prisma.systemLog.create({
            data: {
              action: 'SUPER_ADMIN_TOKEN_FAILED',
              performedBy: user.email,
              details: `Super Admin sign-in rejected: Incorrect secret security code entered.`,
              level: 'WARN'
            }
          });
        } catch (e) {
          // Non-fatal
        }

        return res.status(403).json({
          message: 'Invalid Super Admin Secret Code. Security token did not match.',
          requiresSecretCode: true
        });
      }
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'smarthr_secure_jwt_secret_key_9823487123',
      { expiresIn: '7d' }
    );

    // Record login log
    try {
      await prisma.systemLog.create({
        data: {
          action: 'USER_LOGIN',
          performedBy: user.email,
          details: `User with role ${user.role} logged in successfully${user.role === 'SUPER_ADMIN' ? ' (Secret Token verified)' : ''}`,
          level: 'INFO'
        }
      });
    } catch (e) {
      // Non-fatal
    }

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Internal server error during login.' });
  }
};

const getMe = async (req, res) => {
  try {
    res.json({ user: req.user });
  } catch (err) {
    console.error('GetMe error:', err);
    res.status(500).json({ message: 'Failed to retrieve profile.' });
  }
};

module.exports = {
  login,
  getMe
};
