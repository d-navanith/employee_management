const xlsx = require('xlsx');
const pdfParse = require('pdf-parse');
const prisma = require('../config/prisma');

// Canonical list of the 21 SmartHR attributes requested by HR
const CANONICAL_FIELDS = {
  employeeNo: {
    label: 'Employee No',
    aliases: ['employeeno', 'employee no', 'emp no', 'employee id', 'emp id', 'id', 'staff no', 'staff id', 'employee number', 'emp_no', 'emp#']
  },
  division: {
    label: 'Division',
    aliases: ['division', 'div', 'department', 'dept', 'business unit', 'unit', 'branch']
  },
  designation: {
    label: 'Designation',
    aliases: ['designation', 'job title', 'title', 'role', 'position', 'job designation']
  },
  basedShift: {
    label: 'Based Shift',
    aliases: ['based shift', 'shift', 'shift type', 'assigned shift', 'working shift', 'work shift']
  },
  joiningDate: {
    label: 'Joining date',
    aliases: ['joining date', 'date of joining', 'doj', 'join date', 'start date', 'hire date', 'appointed date']
  },
  resignedDate: {
    label: 'Resigned date',
    aliases: ['resigned date', 'resignation date', 'relieving date', 'relieved date', 'exit date', 'end date', 'termination date']
  },
  fullName: {
    label: 'Employee Full Name',
    aliases: ['employee full name', 'full name', 'employee name', 'name', 'full_name', 'emp name']
  },
  callingName: {
    label: 'Calling name',
    aliases: ['calling name', 'nick name', 'short name', 'known as', 'preferred name', 'call name', 'first name']
  },
  permanentAddress: {
    label: 'Permanent Address',
    aliases: ['permanent address', 'perm address', 'permanent_address', 'home address']
  },
  residentAddress: {
    label: 'Resident Address',
    aliases: ['resident address', 'residence address', 'residential address', 'current address', 'present address', 'mailing address', 'address']
  },
  birthDate: {
    label: 'Birthdate',
    aliases: ['birthdate', 'birth date', 'date of birth', 'dob', 'birthday']
  },
  nicNumber: {
    label: 'NIC Number',
    aliases: ['nic number', 'nic', 'nic no', 'national id', 'id card', 'national identity card', 'identity number', 'id number']
  },
  gender: {
    label: 'Gender',
    aliases: ['gender', 'sex']
  },
  civilStatus: {
    label: 'Civil Status',
    aliases: ['civil status', 'marital status', 'marriage status', 'marital']
  },
  email: {
    label: 'Email',
    aliases: ['email', 'e-mail', 'email address', 'company email', 'work email', 'personal email']
  },
  contactNumber: {
    label: 'Contact number',
    aliases: ['contact number', 'contact no', 'phone', 'phone number', 'mobile', 'mobile number', 'telephone', 'tel']
  },
  emergencyContact: {
    label: 'Emergency contact',
    aliases: ['emergency contact', 'emergency contact number', 'emergency phone', 'emergency mobile', 'emergency no', 'ice contact']
  },
  relationship: {
    label: 'Relationship',
    aliases: ['relationship', 'relation', 'emergency relation', 'kin relationship', 'kin relation', 'next of kin relation']
  },
  shiftTimings: {
    label: 'Shift Timings',
    aliases: ['shift timings', 'shift timing', 'shift hours', 'working hours', 'work hours', 'timings', 'schedule', 'timing']
  },
  salary: {
    label: 'Salary',
    aliases: ['salary', 'basic salary', 'gross salary', 'monthly salary', 'net salary', 'wage', 'pay', 'base pay']
  },
  employmentStatus: {
    label: 'Permanent / Probation',
    aliases: ['permanent / probation', 'permanent/probation', 'permanent or probation', 'employment status', 'employment type', 'status (permanent/probation)', 'confirmation status']
  }
};

// Normalize string for fuzzy header matching
const normalizeHeader = (header) => {
  if (!header) return '';
  return String(header)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

// Map raw column header to canonical field key
const matchFieldKey = (rawHeader) => {
  const norm = normalizeHeader(rawHeader);
  if (!norm) return null;

  for (const [key, meta] of Object.entries(CANONICAL_FIELDS)) {
    if (norm === normalizeHeader(meta.label)) return key;
    if (meta.aliases.some(alias => normalizeHeader(alias) === norm)) return key;
  }

  // Substring match fallback for variations
  for (const [key, meta] of Object.entries(CANONICAL_FIELDS)) {
    if (meta.aliases.some(alias => norm.includes(normalizeHeader(alias)))) {
      return key;
    }
  }

  return null;
};

// Format date values (Excel serial numbers, timestamps, strings)
const sanitizeDate = (val) => {
  if (val === null || val === undefined || val === '') return null;

  // Excel serial number
  if (typeof val === 'number') {
    const excelEpoch = new Date(Math.round((val - 25569) * 86400 * 1000));
    if (!isNaN(excelEpoch.getTime())) {
      return excelEpoch.toISOString().split('T')[0];
    }
  }

  const str = String(val).trim();
  if (!str) return null;

  // If already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;

  // Try parsing regular date strings (DD/MM/YYYY, MM/DD/YYYY, etc.)
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime()) && parsed.getFullYear() > 1900 && parsed.getFullYear() < 2100) {
    return parsed.toISOString().split('T')[0];
  }

  return str;
};

// Sanitize and normalize field value based on key
const sanitizeFieldValue = (key, rawVal) => {
  if (rawVal === null || rawVal === undefined) return null;
  const strVal = String(rawVal).trim();
  if (strVal === '' || strVal.toLowerCase() === 'n/a' || strVal.toLowerCase() === 'null') return null;

  switch (key) {
    case 'salary': {
      if (typeof rawVal === 'number') return rawVal;
      // Strip currency symbols and commas
      const cleaned = strVal.replace(/[^0-9.-]/g, '');
      const num = parseFloat(cleaned);
      return isNaN(num) ? null : num;
    }

    case 'gender': {
      const lower = strVal.toLowerCase();
      if (lower.startsWith('m')) return 'Male';
      if (lower.startsWith('f')) return 'Female';
      return 'Other';
    }

    case 'civilStatus': {
      const lower = strVal.toLowerCase();
      if (lower.includes('marr')) return 'Married';
      if (lower.includes('sing')) return 'Single';
      if (lower.includes('div')) return 'Divorced';
      if (lower.includes('wid')) return 'Widowed';
      return strVal;
    }

    case 'basedShift': {
      const lower = strVal.toLowerCase();
      if (lower.includes('night')) return 'Night';
      if (lower.includes('gen')) return 'General';
      return 'Day';
    }

    case 'employmentStatus': {
      const lower = strVal.toLowerCase();
      if (lower.includes('perm')) return 'Permanent';
      if (lower.includes('prob')) return 'Probation';
      return strVal;
    }

    case 'joiningDate':
    case 'resignedDate':
    case 'birthDate': {
      return sanitizeDate(rawVal);
    }

    default:
      return strVal;
  }
};

/**
 * Parses Excel / CSV Buffer and returns detected columns + parsed records
 */
const parseSpreadsheetBuffer = (buffer) => {
  const workbook = xlsx.read(buffer, { type: 'buffer', cellDates: true });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) throw new Error('Uploaded spreadsheet has no valid sheets.');

  const worksheet = workbook.Sheets[sheetName];
  const rawRows = xlsx.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
  if (!rawRows || rawRows.length < 2) {
    throw new Error('Spreadsheet appears to be empty or has no data rows.');
  }

  // Find header row: scan first 10 rows to find one with the most canonical field matches
  let bestHeaderRowIndex = 0;
  let maxMatchedHeaders = 0;
  let headerMapping = {};

  for (let r = 0; r < Math.min(rawRows.length, 10); r++) {
    const row = rawRows[r];
    if (!Array.isArray(row)) continue;

    let matchCount = 0;
    const currentMapping = {};

    row.forEach((colVal, colIdx) => {
      if (colVal !== undefined && colVal !== '') {
        const matchedKey = matchFieldKey(colVal);
        if (matchedKey) {
          matchCount++;
          currentMapping[colIdx] = matchedKey;
        }
      }
    });

    if (matchCount > maxMatchedHeaders) {
      maxMatchedHeaders = matchCount;
      bestHeaderRowIndex = r;
      headerMapping = currentMapping;
    }
  }

  const detectedColumns = [];
  const rawHeaderRow = rawRows[bestHeaderRowIndex] || [];
  rawHeaderRow.forEach((h, idx) => {
    const fieldKey = headerMapping[idx] || matchFieldKey(h);
    detectedColumns.push({
      columnIndex: idx,
      rawHeader: String(h || `Column ${idx + 1}`),
      mappedField: fieldKey,
      mappedFieldLabel: fieldKey ? CANONICAL_FIELDS[fieldKey]?.label : 'Unmapped / Ignored'
    });
  });

  // Extract data rows
  const parsedEmployees = [];
  for (let r = bestHeaderRowIndex + 1; r < rawRows.length; r++) {
    const row = rawRows[r];
    if (!Array.isArray(row) || row.every(cell => cell === '' || cell === null || cell === undefined)) {
      continue; // Skip blank rows
    }

    const empObj = {};
    Object.entries(headerMapping).forEach(([colIdxStr, fieldKey]) => {
      const colIdx = parseInt(colIdxStr, 10);
      const cellValue = row[colIdx];
      const sanitized = sanitizeFieldValue(fieldKey, cellValue);
      if (sanitized !== null) {
        empObj[fieldKey] = sanitized;
      }
    });

    // An employee record must have at least an identifier or a full name
    if (empObj.employeeNo || empObj.fullName || empObj.callingName) {
      parsedEmployees.push(empObj);
    }
  }

  return {
    sheetName,
    totalRows: rawRows.length,
    detectedColumns,
    matchedFieldCount: Object.keys(headerMapping).length,
    records: parsedEmployees
  };
};

/**
 * Fetches Google Sheet via exported CSV URL and parses it
 */
const parseGoogleSheetUrl = async (inputUrl) => {
  if (!inputUrl || typeof inputUrl !== 'string') {
    throw new Error('Please provide a valid Google Sheets URL.');
  }

  // Extract spreadsheet ID
  const idMatch = inputUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (!idMatch || !idMatch[1]) {
    throw new Error('Could not identify a valid Google Spreadsheet ID from the URL. Please make sure the link is in the format: https://docs.google.com/spreadsheets/d/...');
  }

  const sheetId = idMatch[1];
  // Extract optional gid
  const gidMatch = inputUrl.match(/[#&]gid=([0-9]+)/);
  const gid = gidMatch ? gidMatch[1] : '0';

  const exportUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;

  try {
    const response = await fetch(exportUrl, {
      headers: {
        'User-Agent': 'SmartHR-Automation-System/1.0'
      },
      signal: AbortSignal.timeout(15000)
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403 || response.status === 404) {
        throw new Error('Google Sheet is restricted or private. Please ensure the Google Sheet link access is set to "Anyone with the link can view", or download the file as XLSX/CSV and upload it directly.');
      }
      throw new Error(`Google Sheets responded with HTTP ${response.status}: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return parseSpreadsheetBuffer(Buffer.from(arrayBuffer));
  } catch (err) {
    throw new Error('Failed to fetch Google Sheet: ' + (err.message || 'Network error'));
  }
};

/**
 * Parses PDF buffer using both Key-Value patterns and Tabular extraction
 */
const parsePdfBuffer = async (buffer) => {
  const data = await pdfParse(buffer);
  const text = data.text || '';
  if (!text.trim()) {
    throw new Error('The uploaded PDF does not contain extractable text. Please ensure it is not a scanned image PDF.');
  }

  const records = [];

  // Strategy A: Key-Value block extraction
  // Matches blocks where lines start with known labels e.g. "Employee No: EMP-001" or "Designation - Engineer"
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

  let currentEmployee = null;
  let kvMatchCount = 0;

  for (const line of lines) {
    // Check if line contains a field label delimiter (:, -, =)
    const delimiterMatch = line.match(/^([^:-=]+)[:=\-]\s*(.*)$/);
    if (delimiterMatch) {
      const rawKey = delimiterMatch[1].trim();
      const rawVal = delimiterMatch[2].trim();
      const matchedField = matchFieldKey(rawKey);

      if (matchedField) {
        kvMatchCount++;
        // If we encounter a new employeeNo and we already have fields, push previous
        if (matchedField === 'employeeNo' && currentEmployee && (currentEmployee.employeeNo || currentEmployee.fullName)) {
          records.push(currentEmployee);
          currentEmployee = {};
        }

        if (!currentEmployee) currentEmployee = {};
        const sanitized = sanitizeFieldValue(matchedField, rawVal);
        if (sanitized !== null) {
          currentEmployee[matchedField] = sanitized;
        }
      }
    }
  }

  if (currentEmployee && (currentEmployee.employeeNo || currentEmployee.fullName)) {
    records.push(currentEmployee);
  }

  // Strategy B: If Key-Value extracted fewer than 1 record, try table row extraction
  if (records.length === 0) {
    // Look for lines containing tabs or multiple spaces or pipes '|'
    const tableLines = lines.filter(l => l.includes('\t') || l.includes('|') || /\s{2,}/.test(l));
    if (tableLines.length >= 2) {
      // Treat first row as headers
      const delimiter = tableLines[0].includes('|') ? '|' : (tableLines[0].includes('\t') ? '\t' : /\s{2,}/);
      const headers = tableLines[0].split(delimiter).map(h => h.trim()).filter(Boolean);
      const headerMapping = {};
      headers.forEach((h, idx) => {
        const field = matchFieldKey(h);
        if (field) headerMapping[idx] = field;
      });

      if (Object.keys(headerMapping).length > 0) {
        for (let i = 1; i < tableLines.length; i++) {
          const cells = tableLines[i].split(delimiter).map(c => c.trim()).filter(Boolean);
          const emp = {};
          Object.entries(headerMapping).forEach(([colIdx, fieldKey]) => {
            const idx = parseInt(colIdx, 10);
            if (cells[idx]) {
              const val = sanitizeFieldValue(fieldKey, cells[idx]);
              if (val !== null) emp[fieldKey] = val;
            }
          });
          if (emp.employeeNo || emp.fullName) {
            records.push(emp);
          }
        }
      }
    }
  }

  if (records.length === 0) {
    throw new Error('Unable to automatically extract employee records from the PDF. Please check that the PDF contains readable text with field labels or a clear table, or use Excel / Google Sheets.');
  }

  return {
    sourceType: 'PDF Document',
    pages: data.numpages,
    records
  };
};

const ALLOWED_PRISMA_EMPLOYEE_FIELDS = new Set([
  'employeeNo', 'employeeId', 'fullName', 'callingName', 'gender', 'birthDate',
  'civilStatus', 'nicNumber', 'division', 'designation', 'basedShift',
  'shiftTimings', 'joiningDate', 'resignedDate', 'employmentStatus', 'status',
  'email', 'contactNumber', 'residentAddress', 'permanentAddress',
  'emergencyContact', 'relationship', 'salary', 'firstName', 'middleName',
  'lastName', 'company', 'branch', 'department', 'reportsTo', 'grade',
  'employmentType', 'shiftType', 'isStaff', 'mobile', 'companyEmail',
  'personalEmail', 'currentAddress', 'currentAddressIs', 'permanentAddressIs',
  'emergencyContactName', 'emergencyPhone', 'emergencyRelation', 'leaveBalance',
  'attendancePercentage', 'basicSalary', 'allowances', 'deductions', 'netSalary',
  'bankName', 'bankAccountNumber', 'paymentMethod', 'maritalStatus', 'bloodGroup',
  'nationality', 'nationalId', 'bio', 'avatarUrl', 'confirmationDate',
  'contractEndDate', 'relievingDate', 'exitReason'
]);

/**
 * Upserts array of parsed employee objects into database
 */
const upsertEmployees = async (records, performedByEmail = 'system') => {
  if (!Array.isArray(records) || records.length === 0) {
    throw new Error('No employee records provided for update.');
  }

  let createdCount = 0;
  let updatedCount = 0;
  const errors = [];
  const processedRecords = [];

  for (let i = 0; i < records.length; i++) {
    const rawData = { ...records[i] };

    try {
      // 1. Clean and filter rawData: strictly keep only valid Prisma Employee fields, remove preview metadata
      const cleanData = {};
      for (const [key, val] of Object.entries(rawData)) {
        if (!key.startsWith('_') && ALLOWED_PRISMA_EMPLOYEE_FIELDS.has(key) && val !== null && val !== undefined && val !== '') {
          cleanData[key] = val;
        }
      }

      // 2. Determine or assign Employee No & ID
      if (!cleanData.employeeNo) {
        if (cleanData.employeeId) {
          cleanData.employeeNo = cleanData.employeeId;
        } else {
          const count = await prisma.employee.count();
          cleanData.employeeNo = `EMP-${String(count + 1).padStart(3, '0')}`;
        }
      }
      cleanData.employeeNo = String(cleanData.employeeNo).trim();
      cleanData.employeeId = cleanData.employeeNo;

      // 3. Name handling
      if (!cleanData.fullName) {
        cleanData.fullName = cleanData.callingName || cleanData.employeeNo || 'Employee';
      }
      if (cleanData.fullName && !cleanData.firstName) {
        const parts = cleanData.fullName.trim().split(' ');
        cleanData.firstName = parts[0] || '';
        cleanData.lastName = parts.slice(1).join(' ') || '';
      }

      // 4. Backward compatibility organization fields
      if (cleanData.division && !cleanData.department) {
        cleanData.department = cleanData.division;
      }
      if (cleanData.basedShift && !cleanData.shiftType) {
        cleanData.shiftType = cleanData.basedShift;
      }

      // 5. Numeric compensation safety
      if (cleanData.salary !== undefined && cleanData.salary !== null && !isNaN(cleanData.salary)) {
        cleanData.salary = parseFloat(cleanData.salary);
        cleanData.basicSalary = cleanData.salary;
        cleanData.netSalary = cleanData.salary;
      } else {
        delete cleanData.salary;
      }

      // 6. Status determination
      if (cleanData.resignedDate && String(cleanData.resignedDate).trim() !== '') {
        if (cleanData.employmentStatus === 'Permanent' || cleanData.employmentStatus === 'Probation') {
          cleanData.status = 'Active';
        } else {
          cleanData.status = 'Resigned';
        }
      } else if (!cleanData.status) {
        cleanData.status = 'Active';
      }

      // 7. Check if employee already exists by employeeNo or employeeId
      const existing = await prisma.employee.findFirst({
        where: {
          OR: [
            { employeeNo: cleanData.employeeNo },
            { employeeId: cleanData.employeeNo }
          ]
        }
      });

      if (existing) {
        // Prepare clean update payload
        const updatePayload = { ...cleanData };
        delete updatePayload.id;
        delete updatePayload.createdAt;
        delete updatePayload.updatedAt;

        const updated = await prisma.employee.update({
          where: { id: existing.id },
          data: updatePayload
        });
        updatedCount++;
        processedRecords.push({ action: 'UPDATED', employeeNo: updated.employeeNo, fullName: updated.fullName });
      } else {
        // Create new
        const created = await prisma.employee.create({
          data: cleanData
        });
        createdCount++;
        processedRecords.push({ action: 'CREATED', employeeNo: created.employeeNo, fullName: created.fullName });
      }
    } catch (itemErr) {
      console.error(`Error processing employee record at index ${i}:`, itemErr);
      errors.push({
        index: i,
        employeeNo: rawData.employeeNo || 'Unknown',
        message: itemErr.message
      });
    }
  }

  // Create audit log
  await prisma.systemLog.create({
    data: {
      action: 'EMPLOYEE_AUTO_IMPORT',
      performedBy: performedByEmail,
      details: `SmartHR Auto-Ingestion processed ${records.length} records (${createdCount} created, ${updatedCount} updated, ${errors.length} errors).`,
      level: errors.length > 0 ? 'WARN' : 'INFO'
    }
  });

  return {
    totalReceived: records.length,
    createdCount,
    updatedCount,
    errorCount: errors.length,
    errors,
    processedRecords
  };
};

/**
 * Generates an Excel template buffer containing the 21 standard HR columns
 */
const generateSampleTemplate = () => {
  const headers = Object.values(CANONICAL_FIELDS).map(f => f.label);
  const sampleData = [
    {
      'Employee No': 'EMP-101',
      'Division': 'Human Resources',
      'Designation': 'Talent Acquisition Partner',
      'Based Shift': 'Day',
      'Joining date': '2024-01-15',
      'Resigned date': '',
      'Employee Full Name': 'Sarah Anne Jenkins',
      'Calling name': 'Sarah',
      'Permanent Address': '45 Queen Street, Colombo 03',
      'Resident Address': '45 Queen Street, Colombo 03',
      'Birthdate': '1994-06-20',
      'NIC Number': '199467201948',
      'Gender': 'Female',
      'Civil Status': 'Single',
      'Email': 'sarah.j@company.com',
      'Contact number': '+94 77 123 4567',
      'Emergency contact': '+94 71 987 6543',
      'Relationship': 'Father',
      'Shift Timings': '08:30 AM - 05:00 PM',
      'Salary': 165000,
      'Permanent / Probation': 'Permanent'
    },
    {
      'Employee No': 'EMP-102',
      'Division': 'Engineering',
      'Designation': 'Senior Fullstack Engineer',
      'Based Shift': 'General',
      'Joining date': '2023-11-01',
      'Resigned date': '',
      'Employee Full Name': 'David Nuwan Perera',
      'Calling name': 'Nuwan',
      'Permanent Address': '12 Galle Road, Moratuwa',
      'Resident Address': '88 Havelock Road, Colombo 05',
      'Birthdate': '1991-09-12',
      'NIC Number': '199125603819',
      'Gender': 'Male',
      'Civil Status': 'Married',
      'Email': 'nuwan.p@company.com',
      'Contact number': '+94 77 888 9999',
      'Emergency contact': '+94 70 111 2222',
      'Relationship': 'Spouse',
      'Shift Timings': '09:00 AM - 05:30 PM',
      'Salary': 280000,
      'Permanent / Probation': 'Permanent'
    }
  ];

  const ws = xlsx.utils.json_to_sheet(sampleData, { header: headers });
  const wb = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(wb, ws, 'SmartHR_Employees');
  return xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
};

module.exports = {
  CANONICAL_FIELDS,
  matchFieldKey,
  sanitizeFieldValue,
  parseSpreadsheetBuffer,
  parseGoogleSheetUrl,
  parsePdfBuffer,
  upsertEmployees,
  generateSampleTemplate
};
