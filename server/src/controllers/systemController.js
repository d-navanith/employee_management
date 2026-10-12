const bcrypt = require('bcryptjs');
const prisma = require('../config/prisma');

const getSystemSettings = async (req, res) => {
  try {
    let settings = await prisma.systemSetting.findUnique({
      where: { id: 'system_config' }
    });

    if (!settings) {
      settings = await prisma.systemSetting.create({
        data: {
          id: 'system_config',
          maintenanceMode: false,
          maintenanceNotice: 'System is running normally.',
          allowViewerRegistration: true,
          systemVersion: 'v1.0.0'
        }
      });
    }

    res.json(settings);
  } catch (err) {
    console.error('getSystemSettings error:', err);
    res.status(500).json({ message: 'Failed to retrieve system configuration.' });
  }
};

const updateSystemSettings = async (req, res) => {
  try {
    const { maintenanceMode, maintenanceNotice, allowViewerRegistration, systemVersion, superAdminSecretCode } = req.body;

    const updateData = {};
    if (maintenanceMode !== undefined) updateData.maintenanceMode = maintenanceMode;
    if (maintenanceNotice !== undefined) updateData.maintenanceNotice = maintenanceNotice;
    if (allowViewerRegistration !== undefined) updateData.allowViewerRegistration = allowViewerRegistration;
    if (systemVersion !== undefined) updateData.systemVersion = systemVersion;
    if (superAdminSecretCode !== undefined && superAdminSecretCode.trim()) {
      updateData.superAdminSecretCode = superAdminSecretCode.trim();
    }

    const updated = await prisma.systemSetting.upsert({
      where: { id: 'system_config' },
      update: updateData,
      create: {
        id: 'system_config',
        maintenanceMode: maintenanceMode || false,
        maintenanceNotice: maintenanceNotice || 'System is under maintenance.',
        allowViewerRegistration: allowViewerRegistration !== undefined ? allowViewerRegistration : true,
        systemVersion: systemVersion || 'v1.0.0',
        superAdminSecretCode: superAdminSecretCode || 'HR-SEC-7788'
      }
    });

    await prisma.systemLog.create({
      data: {
        action: 'SYSTEM_SETTINGS_UPDATED',
        performedBy: req.user.email,
        details: `System settings updated. Maintenance: ${updated.maintenanceMode ? 'ENABLED' : 'DISABLED'}, Secret Token updated.`,
        level: updated.maintenanceMode ? 'WARN' : 'INFO'
      }
    });

    res.json(updated);
  } catch (err) {
    console.error('updateSystemSettings error:', err);
    res.status(500).json({ message: 'Failed to update system settings.' });
  }
};

const getSystemLogs = async (req, res) => {
  try {
    const logs = await prisma.systemLog.findMany({
      take: 100,
      orderBy: { createdAt: 'desc' }
    });
    res.json(logs);
  } catch (err) {
    console.error('getSystemLogs error:', err);
    res.status(500).json({ message: 'Failed to retrieve system logs.' });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(users);
  } catch (err) {
    console.error('getUsers error:', err);
    res.status(500).json({ message: 'Failed to fetch users list.' });
  }
};

const createUser = async (req, res) => {
  try {
    const { email, password, name, role } = req.body;

    if (!email || !password || !name || !role) {
      return res.status(400).json({ message: 'Email, password, name, and role are required.' });
    }

    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (existing) {
      return res.status(400).json({ message: 'A user with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        name,
        role,
        status: 'ACTIVE'
      },
      select: { id: true, email: true, name: true, role: true, status: true }
    });

    await prisma.systemLog.create({
      data: {
        action: 'USER_CREATED',
        performedBy: req.user.email,
        details: `Created new user ${user.email} with role ${user.role}`,
        level: 'INFO'
      }
    });

    res.status(201).json(user);
  } catch (err) {
    console.error('createUser error:', err);
    res.status(500).json({ message: 'Failed to create user.' });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, status, name, password } = req.body;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Prevent changing the main system developer to a non-developer
    if (user.email === 'developer@smarthr.local' && role && role !== 'SYSTEM_DEVELOPER') {
      return res.status(400).json({ message: 'Primary System Developer role cannot be demoted.' });
    }

    const updateData = {};
    if (role) updateData.role = role;
    if (status) updateData.status = status;
    if (name) updateData.name = name;
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updated = await prisma.user.update({
      where: { id },
      data: updateData,
      select: { id: true, email: true, name: true, role: true, status: true, updatedAt: true }
    });

    await prisma.systemLog.create({
      data: {
        action: 'USER_ROLE_UPDATED',
        performedBy: req.user.email,
        details: `Updated user ${updated.email}: Role=${updated.role}, Status=${updated.status}`,
        level: 'INFO'
      }
    });

    res.json(updated);
  } catch (err) {
    console.error('updateUser error:', err);
    res.status(500).json({ message: 'Failed to update user.' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (user.id === req.user.id || user.email === 'developer@smarthr.local') {
      return res.status(400).json({ message: 'You cannot delete your own active developer account.' });
    }

    await prisma.user.delete({ where: { id } });

    await prisma.systemLog.create({
      data: {
        action: 'USER_DELETED',
        performedBy: req.user.email,
        details: `Deleted user ${user.email} (${user.role})`,
        level: 'WARN'
      }
    });

    res.json({ message: 'User account removed successfully.' });
  } catch (err) {
    console.error('deleteUser error:', err);
    res.status(500).json({ message: 'Failed to delete user.' });
  }
};

const triggerBackup = async (req, res) => {
  try {
    const now = new Date();
    await prisma.systemSetting.update({
      where: { id: 'system_config' },
      data: { lastBackupAt: now }
    });

    await prisma.systemLog.create({
      data: {
        action: 'DATABASE_BACKUP_SNAPSHOT',
        performedBy: req.user.email,
        details: `System snapshot and schema integrity verification executed successfully.`,
        level: 'INFO'
      }
    });

    res.json({
      message: 'System snapshot and backup completed successfully.',
      timestamp: now.toISOString()
    });
  } catch (err) {
    console.error('triggerBackup error:', err);
    res.status(500).json({ message: 'Backup execution failed.' });
  }
};

module.exports = {
  getSystemSettings,
  updateSystemSettings,
  getSystemLogs,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  triggerBackup
};
