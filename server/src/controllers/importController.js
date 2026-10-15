const multer = require('multer');
const prisma = require('../config/prisma');
const {
  CANONICAL_FIELDS,
  parseSpreadsheetBuffer,
  parseGoogleSheetUrl,
  parsePdfBuffer,
  upsertEmployees,
  generateSampleTemplate
} = require('../services/smartIngestionService');

// Multer memory storage (files stored in memory buffer for immediate parsing)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB max
  fileFilter: (req, file, cb) => {
    const original = file.originalname.toLowerCase();
    if (
      original.endsWith('.xlsx') ||
      original.endsWith('.xls') ||
      original.endsWith('.csv') ||
      original.endsWith('.pdf')
    ) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file format. Please upload an Excel (.xlsx, .xls), CSV (.csv), or PDF (.pdf) file.'));
    }
  }
});

/**
 * Downloads standard 21-column Excel template
 */
const downloadTemplate = (req, res) => {
  try {
    const buffer = generateSampleTemplate();
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="SmartHR_Employee_Template.xlsx"');
    res.send(buffer);
  } catch (err) {
    console.error('downloadTemplate error:', err);
    res.status(500).json({ message: 'Failed to generate template: ' + err.message });
  }
};

/**
 * Parses buffer or Google Sheet and attaches DB status (WILL_CREATE vs WILL_UPDATE)
 */
const parseSource = async (req) => {
  const file = req.file;
  const googleSheetUrl = req.body?.googleSheetUrl || req.query?.googleSheetUrl;

  let parseResult = null;
  let sourceType = 'Unknown';
  let fileName = 'Direct Input';

  if (file) {
    fileName = file.originalname;
    const lowerName = fileName.toLowerCase();

    if (lowerName.endsWith('.pdf')) {
      sourceType = 'PDF Document';
      parseResult = await parsePdfBuffer(file.buffer);
    } else {
      sourceType = lowerName.endsWith('.csv') ? 'CSV File' : 'Excel Spreadsheet';
      parseResult = parseSpreadsheetBuffer(file.buffer);
    }
  } else if (googleSheetUrl) {
    sourceType = 'Google Sheets';
    fileName = googleSheetUrl;
    parseResult = await parseGoogleSheetUrl(googleSheetUrl);
  } else {
    throw new Error('Please upload an Excel, CSV, or PDF file, or provide a Google Sheets URL.');
  }

  // Cross-reference parsed records with existing database records
  const records = parseResult.records || [];
  const existingEmployees = await prisma.employee.findMany({
    select: { id: true, employeeNo: true, fullName: true, callingName: true }
  });

  const existingMap = new Map();
  existingEmployees.forEach(e => {
    if (e.employeeNo) existingMap.set(e.employeeNo.toLowerCase(), e);
  });

  let willCreateCount = 0;
  let willUpdateCount = 0;

  const enrichedRecords = records.map((rec, index) => {
    const empNo = (rec.employeeNo || '').toLowerCase();
    const existing = empNo ? existingMap.get(empNo) : null;

    if (existing) {
      willUpdateCount++;
      return {
        ...rec,
        _importAction: 'UPDATE',
        _existingId: existing.id,
        _matchedName: existing.fullName || existing.callingName
      };
    } else {
      willCreateCount++;
      return {
        ...rec,
        _importAction: 'CREATE'
      };
    }
  });

  return {
    sourceType,
    fileName,
    matchedFieldCount: parseResult.matchedFieldCount || 0,
    detectedColumns: parseResult.detectedColumns || [],
    totalRecords: enrichedRecords.length,
    willCreateCount,
    willUpdateCount,
    records: enrichedRecords
  };
};

/**
 * Endpoint: Preview parsed data & detected mappings
 */
const previewImport = async (req, res) => {
  try {
    const analysis = await parseSource(req);
    res.json(analysis);
  } catch (err) {
    console.error('previewImport error:', err);
    res.status(400).json({ message: err.message || 'Failed to parse file or Google Sheet.' });
  }
};

/**
 * Endpoint: Commit parsed records to database (Upsert)
 */
const confirmImport = async (req, res) => {
  try {
    const { records } = req.body;
    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ message: 'No records provided to update.' });
    }

    const cleanRecords = records.map((rec) => {
      const clean = {};
      for (const [k, v] of Object.entries(rec)) {
        if (!k.startsWith('_')) {
          clean[k] = v;
        }
      }
      return clean;
    });

    const result = await upsertEmployees(cleanRecords, req.user?.email || 'admin');

    if (result.errorCount > 0 && result.createdCount === 0 && result.updatedCount === 0) {
      return res.status(400).json({
        message: `Failed to import records: ${result.errors[0]?.message || 'Validation error'}`,
        ...result
      });
    }

    let summaryMsg = `Successfully synchronized ${result.totalReceived} employee records.`;
    if (result.createdCount > 0 && result.updatedCount > 0) {
      summaryMsg = `Successfully synchronized: ${result.createdCount} created, ${result.updatedCount} updated.`;
    } else if (result.createdCount > 0) {
      summaryMsg = `Successfully created ${result.createdCount} new employee record(s).`;
    } else if (result.updatedCount > 0) {
      summaryMsg = `Successfully updated ${result.updatedCount} existing employee record(s).`;
    }

    res.json({
      message: summaryMsg,
      ...result
    });
  } catch (err) {
    console.error('confirmImport error:', err);
    res.status(500).json({ message: 'Failed to update employee records: ' + err.message });
  }
};

/**
 * Endpoint: Full automatic ingestion in one step (Parse + Auto-Understand + Auto-Update)
 */
const autoIngest = async (req, res) => {
  try {
    const analysis = await parseSource(req);
    if (!analysis.records || analysis.records.length === 0) {
      return res.status(400).json({ message: 'No valid employee records were found in the uploaded file or Google Sheet.' });
    }

    const result = await upsertEmployees(analysis.records, req.user?.email || 'admin');
    res.json({
      message: `Automated SmartHR Sync Complete! Processed ${result.totalReceived} records (${result.createdCount} created, ${result.updatedCount} updated).`,
      sourceType: analysis.sourceType,
      fileName: analysis.fileName,
      detectedColumns: analysis.detectedColumns,
      matchedFieldCount: analysis.matchedFieldCount,
      ...result
    });
  } catch (err) {
    console.error('autoIngest error:', err);
    res.status(400).json({ message: err.message || 'Auto-ingestion failed.' });
  }
};

module.exports = {
  upload,
  downloadTemplate,
  previewImport,
  confirmImport,
  autoIngest
};
