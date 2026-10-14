const prisma = require('../config/prisma');

// Helper to remove sensitive fields (Salary, NIC, etc.) for VIEWER role
const sanitizeForViewer = (emp) => {
  return {
    id: emp.id,
    employeeNo: emp.employeeNo || emp.employeeId,
    employeeId: emp.employeeId || emp.employeeNo,
    fullName: emp.fullName || `${emp.firstName || ''} ${emp.lastName || ''}`.trim(),
    callingName: emp.callingName || emp.firstName,
    gender: emp.gender,
    birthDate: emp.birthDate || emp.dateOfBirth,
    civilStatus: emp.civilStatus || emp.maritalStatus,
    division: emp.division || emp.department,
    designation: emp.designation,
    basedShift: emp.basedShift || emp.shiftType || 'Day',
    shiftTimings: emp.shiftTimings,
    joiningDate: emp.joiningDate || emp.dateOfJoining,
    resignedDate: emp.resignedDate || emp.relievingDate,
    employmentStatus: emp.employmentStatus || 'Probation',
    status: emp.status,
    email: emp.email || emp.companyEmail,
    contactNumber: emp.contactNumber || emp.mobile,
    // Note: SENSITIVE DATA EXCLUDED FOR VIEWER:
    // salary, nicNumber, emergencyContact, relationship, permanentAddress, residentAddress
  };
};

const getEmployees = async (req, res) => {
  try {
    const { search, division, department, status, basedShift, shiftType, employmentStatus } = req.query;
    const isViewer = req.user.role === 'VIEWER';

    const where = {};

    const targetDiv = division || department;
    if (targetDiv && targetDiv !== 'All') {
      where.OR = [
        { division: targetDiv },
        { department: targetDiv }
      ];
    }

    if (status && status !== 'All') {
      where.status = status;
    }

    const targetShift = basedShift || shiftType;
    if (targetShift && targetShift !== 'All') {
      where.OR = [
        { basedShift: targetShift },
        { shiftType: targetShift }
      ];
    }

    if (employmentStatus && employmentStatus !== 'All') {
      where.employmentStatus = employmentStatus;
    }

    if (search) {
      const q = search.trim();
      where.OR = [
        { employeeNo: { contains: q } },
        { employeeId: { contains: q } },
        { fullName: { contains: q } },
        { callingName: { contains: q } },
        { division: { contains: q } },
        { designation: { contains: q } },
        { email: { contains: q } }
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
    const nextNumber = String(total + 1).padStart(3, '0');
    res.json({ nextId: `EMP-${nextNumber}` });
  } catch (err) {
    res.json({ nextId: `EMP-001` });
  }
};

const createEmployee = async (req, res) => {
  try {
    const data = { ...req.body };

    // Format employeeNo
    if (!data.employeeNo) {
      if (data.employeeId) {
        data.employeeNo = data.employeeId;
      } else {
        const total = await prisma.employee.count();
        data.employeeNo = `EMP-${String(total + 1).padStart(3, '0')}`;
      }
    }
    if (!data.employeeId) {
      data.employeeId = data.employeeNo;
    }

    // Check duplicate
    const existing = await prisma.employee.findFirst({
      where: {
        OR: [
          { employeeNo: data.employeeNo },
          { employeeId: data.employeeId }
        ]
      }
    });
    if (existing) {
      return res.status(400).json({ message: `Employee No ${data.employeeNo} already exists in system.` });
    }

    // Maintain backward compatibility fields
    if (data.fullName && !data.firstName) {
      const parts = data.fullName.trim().split(' ');
      data.firstName = parts[0] || '';
      data.lastName = parts.slice(1).join(' ') || '';
    }
    if (data.division && !data.department) {
      data.department = data.division;
    }
    if (data.basedShift && !data.shiftType) {
      data.shiftType = data.basedShift;
    }

    // Ensure numeric types
    if (data.salary !== undefined && data.salary !== '') {
      data.salary = parseFloat(data.salary);
      data.basicSalary = data.salary;
      data.netSalary = data.salary;
    }
    if (data.basicSalary !== undefined && data.basicSalary !== '') {
      data.basicSalary = parseFloat(data.basicSalary);
    }

    const employee = await prisma.employee.create({ data });

    // Log action
    await prisma.systemLog.create({
      data: {
        action: 'EMPLOYEE_CREATED',
        performedBy: req.user.email,
        details: `Created employee ${employee.employeeNo} (${employee.fullName || employee.callingName})`,
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

    // Don't allow changing internal ID
    delete data.id;

    if (data.employeeNo && !data.employeeId) {
      data.employeeId = data.employeeNo;
    }

    // Maintain backward compatibility fields
    if (data.fullName && !data.firstName) {
      const parts = data.fullName.trim().split(' ');
      data.firstName = parts[0] || '';
      data.lastName = parts.slice(1).join(' ') || '';
    }
    if (data.division && !data.department) {
      data.department = data.division;
    }
    if (data.basedShift && !data.shiftType) {
      data.shiftType = data.basedShift;
    }

    // Format numbers
    if (data.salary !== undefined && data.salary !== '') {
      data.salary = parseFloat(data.salary);
      data.basicSalary = data.salary;
      data.netSalary = data.salary;
    }
    if (data.basicSalary !== undefined && data.basicSalary !== '') {
      data.basicSalary = parseFloat(data.basicSalary);
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
        details: `Updated employee ${updated.employeeNo} (${updated.fullName || updated.callingName})`,
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
        details: `Deleted employee ${emp.employeeNo || emp.employeeId} (${emp.fullName || emp.callingName})`,
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
