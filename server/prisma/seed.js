const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with updated HR fields...');

  // Clean existing data
  await prisma.user.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.systemLog.deleteMany();
  await prisma.systemSetting.deleteMany();

  // Create Users with hashed passwords
  const passwordHashAdmin = await bcrypt.hash('Admin@123', 10);
  const passwordHashViewer = await bcrypt.hash('Viewer@123', 10);

  const superAdmin = await prisma.user.create({
    data: {
      email: 'hr@smarthr.local',
      password: passwordHashAdmin,
      name: 'Super Admin (HR)',
      role: 'SUPER_ADMIN',
      status: 'ACTIVE'
    }
  });

  const viewer = await prisma.user.create({
    data: {
      email: 'viewer@smarthr.local',
      password: passwordHashViewer,
      name: 'Operations Viewer',
      role: 'VIEWER',
      status: 'ACTIVE'
    }
  });

  console.log('Created accounts:', {
    superAdmin: superAdmin.email,
    viewer: viewer.email
  });

  // Create System Settings
  await prisma.systemSetting.create({
    data: {
      id: 'system_config',
      maintenanceMode: false,
      maintenanceNotice: 'Scheduled maintenance notice: The system is operating normally.',
      allowViewerRegistration: true,
      systemVersion: 'v1.0.0',
      superAdminSecretCode: 'HR7788',
      lastBackupAt: new Date()
    }
  });

  // Create Initial System Logs
  await prisma.systemLog.create({
    data: {
      action: 'SYSTEM_INITIALIZATION',
      performedBy: 'hr@smarthr.local',
      details: 'Initial database seeding with 21 HR standard fields completed successfully.',
      level: 'INFO'
    }
  });

  // Seed sample employees with exact 21 HR fields
  const sampleEmployees = [
    {
      employeeNo: 'EMP-001',
      employeeId: 'EMP-001',
      fullName: 'Alexander James Sterling',
      callingName: 'Alex',
      gender: 'Male',
      birthDate: '1988-04-15',
      civilStatus: 'Married',
      nicNumber: '198810602341',
      division: 'Information Technology',
      designation: 'Lead Software Architect',
      basedShift: 'Day',
      shiftTimings: '08:30 AM - 05:30 PM',
      joiningDate: '2022-01-10',
      resignedDate: null,
      employmentStatus: 'Permanent',
      status: 'Active',
      email: 'alexander.s@smarthr.local',
      contactNumber: '+94 77 123 4567',
      residentAddress: 'No. 42, Flower Road, Colombo 07',
      permanentAddress: 'No. 15, Galle Road, Kalutara',
      emergencyContact: '+94 71 987 6543',
      relationship: 'Spouse',
      salary: 285000,
      // Backward compatibility fields
      firstName: 'Alexander',
      lastName: 'Sterling',
      department: 'Information Technology',
      branch: 'Colombo HQ',
      basicSalary: 285000,
      netSalary: 285000,
      isStaff: true,
      shiftType: 'Day',
      leaveBalance: 16,
      attendancePercentage: 99.2
    },
    {
      employeeNo: 'EMP-002',
      employeeId: 'EMP-002',
      fullName: 'Samantha Brooke Vance',
      callingName: 'Sam',
      gender: 'Female',
      birthDate: '1993-08-22',
      civilStatus: 'Single',
      nicNumber: '199363501289',
      division: 'Human Resources',
      designation: 'Senior HR Specialist',
      basedShift: 'Day',
      shiftTimings: '08:30 AM - 05:30 PM',
      joiningDate: '2021-06-15',
      resignedDate: null,
      employmentStatus: 'Permanent',
      status: 'Active',
      email: 'samantha.v@smarthr.local',
      contactNumber: '+94 76 234 5678',
      residentAddress: 'Apt 5B, Marina Heights, Dehiwala',
      permanentAddress: 'No. 88, Kandy Road, Peradeniya',
      emergencyContact: '+94 78 555 4321',
      relationship: 'Father',
      salary: 195000,
      firstName: 'Samantha',
      lastName: 'Vance',
      department: 'Human Resources',
      branch: 'Colombo HQ',
      basicSalary: 195000,
      netSalary: 195000,
      isStaff: true,
      shiftType: 'Day',
      leaveBalance: 12,
      attendancePercentage: 97.8
    },
    {
      employeeNo: 'EMP-003',
      employeeId: 'EMP-003',
      fullName: 'Marcus Aurelius Thorne',
      callingName: 'Marcus',
      gender: 'Male',
      birthDate: '1990-11-03',
      civilStatus: 'Married',
      nicNumber: '199030804512',
      division: 'Plant Operations',
      designation: 'Night Production Supervisor',
      basedShift: 'Night',
      shiftTimings: '08:00 PM - 05:00 AM',
      joiningDate: '2020-09-01',
      resignedDate: null,
      employmentStatus: 'Permanent',
      status: 'Active',
      email: 'marcus.t@smarthr.local',
      contactNumber: '+94 75 345 6789',
      residentAddress: '12/4 Industrial Zone Road, Biyagama',
      permanentAddress: 'No. 34, Old Negombo Road, Ja-Ela',
      emergencyContact: '+94 77 444 3210',
      relationship: 'Spouse',
      salary: 175000,
      firstName: 'Marcus',
      lastName: 'Thorne',
      department: 'Plant Operations',
      branch: 'Biyagama Plant',
      basicSalary: 175000,
      netSalary: 175000,
      isStaff: false,
      shiftType: 'Night',
      leaveBalance: 9,
      attendancePercentage: 98.1
    },
    {
      employeeNo: 'EMP-004',
      employeeId: 'EMP-004',
      fullName: 'Elena Rostova Chen',
      callingName: 'Elena',
      gender: 'Female',
      birthDate: '1996-02-18',
      civilStatus: 'Single',
      nicNumber: '199654903321',
      division: 'Information Technology',
      designation: 'Frontend Engineer',
      basedShift: 'Day',
      shiftTimings: '09:00 AM - 06:00 PM',
      joiningDate: '2023-03-01',
      resignedDate: null,
      employmentStatus: 'Permanent',
      status: 'Active',
      email: 'elena.c@smarthr.local',
      contactNumber: '+94 71 456 7890',
      residentAddress: '78 Havelock Road, Colombo 05',
      permanentAddress: '78 Havelock Road, Colombo 05',
      emergencyContact: '+94 71 888 9900',
      relationship: 'Mother',
      salary: 165000,
      firstName: 'Elena',
      lastName: 'Chen',
      department: 'Information Technology',
      branch: 'Colombo HQ',
      basicSalary: 165000,
      netSalary: 165000,
      isStaff: true,
      shiftType: 'Day',
      leaveBalance: 15,
      attendancePercentage: 99.5
    },
    {
      employeeNo: 'EMP-005',
      employeeId: 'EMP-005',
      fullName: 'Rohan Dinesh Fernando',
      callingName: 'Rohan',
      gender: 'Male',
      birthDate: '1998-05-12',
      civilStatus: 'Single',
      nicNumber: '199813309988',
      division: 'Logistics & Supply',
      designation: 'Night Shift Inventory Controller',
      basedShift: 'Night',
      shiftTimings: '07:30 PM - 04:30 AM',
      joiningDate: '2023-11-15',
      resignedDate: null,
      employmentStatus: 'Probation',
      status: 'Active',
      email: 'rohan.f@smarthr.local',
      contactNumber: '+94 72 567 8901',
      residentAddress: '45/B Temple Road, Kelaniya',
      permanentAddress: '45/B Temple Road, Kelaniya',
      emergencyContact: '+94 77 666 5544',
      relationship: 'Brother',
      salary: 110000,
      firstName: 'Rohan',
      lastName: 'Fernando',
      department: 'Logistics & Supply',
      branch: 'Kelaniya Hub',
      basicSalary: 110000,
      netSalary: 110000,
      isStaff: false,
      shiftType: 'Night',
      leaveBalance: 7,
      attendancePercentage: 95.0
    },
    {
      employeeNo: 'EMP-006',
      employeeId: 'EMP-006',
      fullName: 'Kavindi Malsha Jayasinghe',
      callingName: 'Kavindi',
      gender: 'Female',
      birthDate: '1999-10-30',
      civilStatus: 'Single',
      nicNumber: '199980501122',
      division: 'Finance',
      designation: 'Junior Accounts Associate',
      basedShift: 'Day',
      shiftTimings: '08:30 AM - 05:30 PM',
      joiningDate: '2024-02-01',
      resignedDate: null,
      employmentStatus: 'Probation',
      status: 'Active',
      email: 'kavindi.j@smarthr.local',
      contactNumber: '+94 70 678 9012',
      residentAddress: '22 Station Road, Nugegoda',
      permanentAddress: 'No. 102, Main Street, Kurunegala',
      emergencyContact: '+94 71 333 2211',
      relationship: 'Mother',
      salary: 95000,
      firstName: 'Kavindi',
      lastName: 'Jayasinghe',
      department: 'Finance',
      branch: 'Colombo HQ',
      basicSalary: 95000,
      netSalary: 95000,
      isStaff: true,
      shiftType: 'Day',
      leaveBalance: 8,
      attendancePercentage: 98.7
    }
  ];

  for (const empData of sampleEmployees) {
    const employee = await prisma.employee.create({
      data: empData
    });
    console.log(`Created employee: ${employee.employeeNo} - ${employee.fullName} (${employee.callingName})`);
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
