const prisma = require('../config/prisma');

const getDashboardStats = async (req, res) => {
  try {
    const employees = await prisma.employee.findMany();

    const totalEmployees = employees.length;
    const activeEmployees = employees.filter(e => e.status === 'Active').length;
    const inactiveEmployees = employees.filter(e => e.status !== 'Active').length;

    // Shift breakdown (basedShift: Day, Night, General)
    const dayShiftWorkers = employees.filter(e => (e.basedShift === 'Day' || e.shiftType === 'Day')).length;
    const nightShiftWorkers = employees.filter(e => (e.basedShift === 'Night' || e.shiftType === 'Night')).length;
    const generalShiftWorkers = employees.filter(e => (e.basedShift === 'General' || e.shiftType === 'General')).length;

    // Permanent vs Probation
    const permanentCount = employees.filter(e => e.employmentStatus === 'Permanent').length;
    const probationCount = employees.filter(e => e.employmentStatus === 'Probation').length;

    // Staff vs Non-staff
    const staffCount = employees.filter(e => e.isStaff !== false).length;
    const workerCount = employees.filter(e => e.isStaff === false).length;

    // Joining & exit estimates based on year
    const currentYear = new Date().getFullYear();
    const newHiresThisYear = employees.filter(e => {
      const jDate = e.joiningDate || e.dateOfJoining;
      if (!jDate) return false;
      return jDate.startsWith(String(currentYear));
    }).length;

    const employeeExitsThisYear = employees.filter(e => {
      if (e.status !== 'Resigned' && e.status !== 'Relieved') return false;
      const rDate = e.resignedDate || e.relievingDate;
      if (!rDate) return false;
      return rDate.startsWith(String(currentYear));
    }).length;

    // Division breakdown
    const divMap = {};
    employees.forEach(e => {
      const d = e.division || e.department || 'General';
      divMap[d] = (divMap[d] || 0) + 1;
    });
    const departmentWiseCount = Object.keys(divMap).map(name => ({
      name,
      count: divMap[name]
    })).sort((a, b) => b.count - a.count);

    // Designation breakdown
    const desigMap = {};
    employees.forEach(e => {
      const d = e.designation || 'Staff';
      desigMap[d] = (desigMap[d] || 0) + 1;
    });
    const designationWiseCount = Object.keys(desigMap).map(name => ({
      name,
      count: desigMap[name]
    })).sort((a, b) => b.count - a.count);

    // Status breakdown (Permanent / Probation)
    const employmentStatusCount = [
      { name: 'Permanent', count: permanentCount },
      { name: 'Probation', count: probationCount }
    ];

    res.json({
      totalEmployees,
      activeEmployees,
      inactiveEmployees,
      dayShiftWorkers,
      nightShiftWorkers,
      generalShiftWorkers,
      permanentCount,
      probationCount,
      staffCount,
      workerCount,
      newHiresThisYear,
      employeeExitsThisYear,
      employeesJoiningThisQuarter: Math.min(newHiresThisYear, 3),
      employeesRelievingThisQuarter: employeeExitsThisYear,
      departmentWiseCount,
      designationWiseCount,
      employmentStatusCount,
      employmentTypeCount: employmentStatusCount,
      lastSynced: new Date().toLocaleTimeString()
    });
  } catch (err) {
    console.error('getDashboardStats error:', err);
    res.status(500).json({ message: 'Failed to compute dashboard metrics.' });
  }
};

module.exports = {
  getDashboardStats
};
