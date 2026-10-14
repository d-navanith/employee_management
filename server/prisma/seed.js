const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

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
      details: 'Initial database seeding and system configuration completed successfully.',
      level: 'INFO'
    }
  });

  // Seed sample employees
  const sampleEmployees = [
    {
      employeeId: 'HR-EMP-0001',
      series: 'HR-EMP-',
      salutation: 'Mr',
      firstName: 'Alexander',
      middleName: 'James',
      lastName: 'Sterling',
      gender: 'Male',
      dateOfBirth: '1988-04-15',
      dateOfJoining: '2022-01-10',
      status: 'Active',
      company: 'akoma',
      designation: 'Lead Software Architect',
      branch: 'Headquarters',
      department: 'Engineering',
      reportsTo: 'CTO',
      grade: 'Grade-A',
      employmentType: 'Full-time',
      shiftType: 'Day',
      isStaff: true,
      mobile: '+1 555-019-2831',
      companyEmail: 'alexander.s@akoma.com',
      personalEmail: 'alex.sterling.dev@gmail.com',
      currentAddress: '742 Evergreen Terrace, Suite 402, Springfield',
      currentAddressIs: 'Rented',
      permanentAddress: '742 Evergreen Terrace, Suite 402, Springfield',
      permanentAddressIs: 'Rented',
      emergencyContactName: 'Clara Sterling',
      emergencyPhone: '+1 555-019-2832',
      emergencyRelation: 'Spouse',
      leaveBalance: 16,
      attendancePercentage: 99.2,
      basicSalary: 9500,
      allowances: 1200,
      deductions: 800,
      netSalary: 9900,
      bankName: 'Silicon Valley Bank',
      bankAccountNumber: '9843210984',
      paymentMethod: 'Bank Transfer',
      maritalStatus: 'Married',
      bloodGroup: 'O+',
      nationality: 'United States',
      nationalId: 'US-849-20-4102',
      bio: 'Principal tech lead driving high availability architecture.',
      confirmationDate: '2022-04-10'
    },
    {
      employeeId: 'HR-EMP-0002',
      series: 'HR-EMP-',
      salutation: 'Ms',
      firstName: 'Elena',
      middleName: 'Marie',
      lastName: 'Vance',
      gender: 'Female',
      dateOfBirth: '1992-08-22',
      dateOfJoining: '2023-03-01',
      status: 'Active',
      company: 'akoma',
      designation: 'Senior HR Manager',
      branch: 'Headquarters',
      department: 'Human Resources',
      reportsTo: 'Director of HR',
      grade: 'Grade-B',
      employmentType: 'Full-time',
      shiftType: 'Day',
      isStaff: true,
      mobile: '+1 555-018-9941',
      companyEmail: 'elena.vance@akoma.com',
      personalEmail: 'elena.vance92@yahoo.com',
      currentAddress: '120 Ocean View Blvd, Apt 14B, Miami',
      currentAddressIs: 'Owned',
      permanentAddress: '120 Ocean View Blvd, Apt 14B, Miami',
      permanentAddressIs: 'Owned',
      emergencyContactName: 'David Vance',
      emergencyPhone: '+1 555-018-9942',
      emergencyRelation: 'Brother',
      leaveBalance: 14,
      attendancePercentage: 97.5,
      basicSalary: 7200,
      allowances: 900,
      deductions: 500,
      netSalary: 7600,
      bankName: 'Chase Bank',
      bankAccountNumber: '1287463920',
      paymentMethod: 'Bank Transfer',
      maritalStatus: 'Single',
      bloodGroup: 'A+',
      nationality: 'United States',
      nationalId: 'US-772-10-8831',
      bio: 'HR operations lead overseeing talent lifecycle and onboarding.',
      confirmationDate: '2023-06-01'
    },
    {
      employeeId: 'HR-EMP-0003',
      series: 'HR-EMP-',
      salutation: 'Mr',
      firstName: 'Marcus',
      middleName: 'D.',
      lastName: 'Chen',
      gender: 'Male',
      dateOfBirth: '1995-11-04',
      dateOfJoining: '2023-11-15',
      status: 'Active',
      company: 'akoma',
      designation: 'Night Shift Plant Supervisor',
      branch: 'Plant North',
      department: 'Operations',
      reportsTo: 'Operations Director',
      grade: 'Grade-B',
      employmentType: 'Full-time',
      shiftType: 'Night',
      isStaff: false, // shift worker
      mobile: '+1 555-012-4412',
      companyEmail: 'marcus.chen@akoma.com',
      personalEmail: 'marcus.chen.ops@gmail.com',
      currentAddress: '404 Industrial Way, Suite 3, Detroit',
      currentAddressIs: 'Rented',
      permanentAddress: '404 Industrial Way, Suite 3, Detroit',
      permanentAddressIs: 'Rented',
      emergencyContactName: 'Lin Chen',
      emergencyPhone: '+1 555-012-4413',
      emergencyRelation: 'Mother',
      leaveBalance: 10,
      attendancePercentage: 96.0,
      basicSalary: 5500,
      allowances: 1500, // night differential
      deductions: 400,
      netSalary: 6600,
      bankName: 'Bank of America',
      bankAccountNumber: '7829103948',
      paymentMethod: 'Bank Transfer',
      maritalStatus: 'Single',
      bloodGroup: 'B+',
      nationality: 'United States',
      nationalId: 'US-339-18-9921',
      bio: 'Leading night shift operations, assembly line throughput and safety protocols.',
      confirmationDate: '2024-02-15'
    },
    {
      employeeId: 'HR-EMP-0004',
      series: 'HR-EMP-',
      salutation: 'Ms',
      firstName: 'Sophia',
      middleName: 'Grace',
      lastName: 'Rodriguez',
      gender: 'Female',
      dateOfBirth: '1998-02-19',
      dateOfJoining: '2024-02-01',
      status: 'Active',
      company: 'akoma',
      designation: 'Production Line Operator',
      branch: 'Plant North',
      department: 'Operations',
      reportsTo: 'Marcus Chen',
      grade: 'Grade-C',
      employmentType: 'Full-time',
      shiftType: 'Night',
      isStaff: false, // shift worker
      mobile: '+1 555-017-3390',
      companyEmail: 'sophia.r@akoma.com',
      personalEmail: 'sophia.rodriguez98@gmail.com',
      currentAddress: '88 Oakridge Street, Detroit',
      currentAddressIs: 'Rented',
      permanentAddress: '88 Oakridge Street, Detroit',
      permanentAddressIs: 'Rented',
      emergencyContactName: 'Mateo Rodriguez',
      emergencyPhone: '+1 555-017-3391',
      emergencyRelation: 'Father',
      leaveBalance: 12,
      attendancePercentage: 98.0,
      basicSalary: 4200,
      allowances: 1100,
      deductions: 300,
      netSalary: 5000,
      bankName: 'Wells Fargo',
      bankAccountNumber: '4492817263',
      paymentMethod: 'Bank Transfer',
      maritalStatus: 'Single',
      bloodGroup: 'AB+',
      nationality: 'United States',
      nationalId: 'US-551-92-0043',
      bio: 'Night shift assembly technician specialized in component calibration.',
      confirmationDate: '2024-05-01'
    },
    {
      employeeId: 'HR-EMP-0005',
      series: 'HR-EMP-',
      salutation: 'Mr',
      firstName: 'Liam',
      middleName: 'Thomas',
      lastName: 'O\'Connor',
      gender: 'Male',
      dateOfBirth: '1991-06-30',
      dateOfJoining: '2021-09-01',
      status: 'Active',
      company: 'akoma',
      designation: 'Senior Financial Analyst',
      branch: 'Headquarters',
      department: 'Finance',
      reportsTo: 'Chief Financial Officer',
      grade: 'Grade-A',
      employmentType: 'Full-time',
      shiftType: 'Day',
      isStaff: true,
      mobile: '+1 555-014-8822',
      companyEmail: 'liam.oconnor@akoma.com',
      personalEmail: 'liam.oc91@gmail.com',
      currentAddress: '314 Market Street, Boston',
      currentAddressIs: 'Owned',
      permanentAddress: '314 Market Street, Boston',
      permanentAddressIs: 'Owned',
      emergencyContactName: 'Maeve O\'Connor',
      emergencyPhone: '+1 555-014-8823',
      emergencyRelation: 'Spouse',
      leaveBalance: 15,
      attendancePercentage: 99.0,
      basicSalary: 8800,
      allowances: 800,
      deductions: 700,
      netSalary: 8900,
      bankName: 'Citibank',
      bankAccountNumber: '6628193821',
      paymentMethod: 'Bank Transfer',
      maritalStatus: 'Married',
      bloodGroup: 'O-',
      nationality: 'United States',
      nationalId: 'US-901-44-1294',
      bio: 'Quarterly financial forecaster and operational budget coordinator.',
      confirmationDate: '2021-12-01'
    },
    {
      employeeId: 'HR-EMP-0006',
      series: 'HR-EMP-',
      salutation: 'Ms',
      firstName: 'Tara',
      middleName: 'K.',
      lastName: 'Patel',
      gender: 'Female',
      dateOfBirth: '1996-09-12',
      dateOfJoining: '2024-08-15',
      status: 'Active',
      company: 'akoma',
      designation: 'Day Shift Quality Inspector',
      branch: 'Plant South',
      department: 'Operations',
      reportsTo: 'Operations Director',
      grade: 'Grade-C',
      employmentType: 'Full-time',
      shiftType: 'Day',
      isStaff: false, // shift worker
      mobile: '+1 555-016-7733',
      companyEmail: 'tara.patel@akoma.com',
      personalEmail: 'tara.patel.qa@gmail.com',
      currentAddress: '15 Harmony Lane, Austin',
      currentAddressIs: 'Rented',
      permanentAddress: '15 Harmony Lane, Austin',
      permanentAddressIs: 'Rented',
      emergencyContactName: 'Raj Patel',
      emergencyPhone: '+1 555-016-7734',
      emergencyRelation: 'Father',
      leaveBalance: 12,
      attendancePercentage: 98.8,
      basicSalary: 4500,
      allowances: 600,
      deductions: 350,
      netSalary: 4750,
      bankName: 'Chase Bank',
      bankAccountNumber: '8839201948',
      paymentMethod: 'Bank Transfer',
      maritalStatus: 'Single',
      bloodGroup: 'A-',
      nationality: 'United States',
      nationalId: 'US-228-44-8391',
      bio: 'Ensuring manufacturing conformance and ISO compliance during day shift operations.',
      confirmationDate: '2024-11-15'
    }
  ];

  for (const emp of sampleEmployees) {
    await prisma.employee.create({ data: emp });
  }

  console.log(`Seeded ${sampleEmployees.length} employees successfully.`);
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
