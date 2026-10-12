const prisma = require('../config/prisma');

// Helper to remove sensitive fields for VIEWER role
const sanitizeForViewer = (emp) => {
  return {
    id: emp.id,
    employeeId: emp.employeeId,
    firstName: emp.firstName,
    lastName: emp.lastName,
    designation: emp.designation,
    department: emp.department,
    shiftType: emp.shiftType,
    isStaff: emp.isStaff,
    status: emp.status,
    employmentType: emp.employmentType,
    company: emp.company,
    dateOfJoining: emp.dateOfJoining
    // SENSITIVE DATA EXCLUDED:
    // basicSalary, allowances, deductions, netSalary,
    // bankName, bankAccountNumber, paymentMethod,
    // nationalId, emergencyContactName, emergencyPhone, emergencyRelation,
    // personalEmail, permanentAddress, currentAddress, dateOfBirth, maritalStatus
  };
};

const getEmployees = async (req, res) => {
  try {
    const { search, department, status, shiftType, isStaff } = req.query;
    const isViewer = req.user.role === 'VIEWER';

    const where = {};

    if (department && department !== 'All') {
      where.department = department;
    }

    if (status && status !== 'All') {
      where.status = status;
    }

    if (shiftType && shiftType !== 'All') {
      where.shiftType = shiftType;
    }

    if (isStaff !== undefined && isStaff !== '') {
      where.isStaff = isStaff === 'true';
    }

    if (search) {
      const q = search.trim();
      where.OR = [
        { employeeId: { contains: q } },
        { firstName: { contains: q } },
        { lastName: { contains: q } },
        { department: { contains: q } },
        { designation: { contains: q } }
      ];
    }

    const employees = await prisma.employee.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    if (isViewer) {
      return res.json(employees.map(sanitizeForViewer));
    }

    res.json(employees);
  } catch (err) {
    console.error('getEmployees error:', err);
    res.status(500).json({ message: 'Failed to fetch employees list.' });
  }
};

const getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;
    const isViewer = req.user.role === 'VIEWER';

    const employee = await prisma.employee.findUnique({
      where: { id }
    });

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found.' });
    }

    if (isViewer) {
      return res.json(sanitizeForViewer(employee));
    }

    res.json(employee);
  } catch (err) {
    console.error('getEmployeeById error:', err);
    res.status(500).json({ message: 'Failed to retrieve employee.' });
  }
};

const getNextEmployeeId = async (req, res) => {
  try {
    const total = await prisma.employee.count();
    const nextNumber = String(total + 1).padStart(4, '0');
    res.json({ nextId: `HR-EMP-${nextNumber}` });
  } catch (err) {
    res.json({ nextId: `HR-EMP-0001` });
  }
};

const createEmployee = async (req, res) => {
  try {
    const data = req.body;

    // Check if employeeId is provided, if not generate
    if (!data.employeeId) {
      const total = await prisma.employee.count();
      data.employeeId = `HR-EMP-${String(total + 1).padStart(4, '0')}`;
    }

    // Check duplicate
    const existing = await prisma.employee.findUnique({
      where: { employeeId: data.employeeId }
    });
    if (existing) {
      return res.status(400).json({ message: `Employee ID ${data.employeeId} already exists.` });
    }

    // Ensure numeric types
    if (data.basicSalary !== undefined && data.basicSalary !== '') {
      data.basicSalary = parseFloat(data.basicSalary);
    }
    if (data.allowances !== undefined && data.allowances !== '') {
      data.allowances = parseFloat(data.allowances);
    }
    if (data.deductions !== undefined && data.deductions !== '') {
      data.deductions = parseFloat(data.deductions);
    }
    if (data.netSalary !== undefined && data.netSalary !== '') {
      data.netSalary = parseFloat(data.netSalary);
    }
    if (data.leaveBalance !== undefined && data.leaveBalance !== '') {
      data.leaveBalance = parseInt(data.leaveBalance, 10);
    }
    if (data.attendancePercentage !== undefined && data.attendancePercentage !== '') {
      data.attendancePercentage = parseFloat(data.attendancePercentage);
    }

    const employee = await prisma.employee.create({ data });

    // Log action
    await prisma.systemLog.create({
      data: {
        action: 'EMPLOYEE_CREATED',
        performedBy: req.user.email,
        details: `Created employee ${employee.employeeId} (${employee.firstName} ${employee.lastName || ''})`,
        level: 'INFO'
      }
    });

    res.status(201).json(employee);
  } catch (err) {
    console.error('createEmployee error:', err);
    res.status(500).json({ message: 'Failed to create employee record: ' + err.message });
  }
};

const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const data = { ...req.body };

    // Don't allow changing ID
    delete data.id;

    // Format numbers
    if (data.basicSalary !== undefined && data.basicSalary !== '') {
      data.basicSalary = parseFloat(data.basicSalary);
    }
    if (data.allowances !== undefined && data.allowances !== '') {
      data.allowances = parseFloat(data.allowances);
    }
    if (data.deductions !== undefined && data.deductions !== '') {
      data.deductions = parseFloat(data.deductions);
    }
    if (data.netSalary !== undefined && data.netSalary !== '') {
      data.netSalary = parseFloat(data.netSalary);
    }
    if (data.leaveBalance !== undefined && data.leaveBalance !== '') {
      data.leaveBalance = parseInt(data.leaveBalance, 10);
    }
    if (data.attendancePercentage !== undefined && data.attendancePercentage !== '') {
      data.attendancePercentage = parseFloat(data.attendancePercentage);
    }

    const updated = await prisma.employee.update({
      where: { id },
      data
    });

    // Log action
    await prisma.systemLog.create({
      data: {
        action: 'EMPLOYEE_UPDATED',
        performedBy: req.user.email,
        details: `Updated employee ${updated.employeeId} (${updated.firstName} ${updated.lastName || ''})`,
        level: 'INFO'
      }
    });

    res.json(updated);
  } catch (err) {
    console.error('updateEmployee error:', err);
    res.status(500).json({ message: 'Failed to update employee: ' + err.message });
  }
};

const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    const emp = await prisma.employee.findUnique({ where: { id } });
    if (!emp) {
      return res.status(404).json({ message: 'Employee not found.' });
    }

    await prisma.employee.delete({ where: { id } });

    // Log action
    await prisma.systemLog.create({
      data: {
        action: 'EMPLOYEE_DELETED',
        performedBy: req.user.email,
        details: `Deleted employee ${emp.employeeId} (${emp.firstName} ${emp.lastName || ''})`,
        level: 'WARN'
      }
    });

    res.json({ message: 'Employee deleted successfully.', id });
  } catch (err) {
    console.error('deleteEmployee error:', err);
    res.status(500).json({ message: 'Failed to delete employee.' });
  }
};

module.exports = {
  getEmployees,
  getEmployeeById,
  getNextEmployeeId,
  createEmployee,
  updateEmployee,
  deleteEmployee
};
