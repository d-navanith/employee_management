import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { 
  FileSpreadsheet, 
  FileText, 
  Link2, 
  UploadCloud, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Download, 
  ArrowRight, 
  Sparkles, 
  UserCheck, 
  Layers, 
  Database,
  Info,
  X
} from 'lucide-react';

const CANONICAL_LABELS = [
  'Employee No',
  'Division',
  'Designation',
  'Based Shift',
  'Joining date',
  'Resigned date',
  'Employee Full Name',
  'Calling name',
  'Permanent Address',
  'Resident Address',
  'Birthdate',
  'NIC Number',
  'Gender',
  'Civil Status',
  'Email',
  'Contact number',
  'Emergency contact',
  'Relationship',
  'Shift Timings',
  'Salary',
  'Permanent / Probation'
];

const ImportAutomation = ({ onClose, isModal = false, onComplete }) => {
  const navigate = useNavigate();

  // Mode: 'file' or 'googlesheets'
  const [activeTab, setActiveTab] = useState('file');

  // Input States
  const [selectedFile, setSelectedFile] = useState(null);
  const [googleSheetUrl, setGoogleSheetUrl] = useState('');
  const [dragOver, setDragOver] = useState(false);

  // Processing States
  const [analyzing, setAnalyzing] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [downloadingTemplate, setDownloadingTemplate] = useState(false);

  // Analysis / Preview State
  const [analysisResult, setAnalysisResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [syncSuccessResult, setSyncSuccessResult] = useState(null);

  // Download Sample Template
  const handleDownloadTemplate = async () => {
    setDownloadingTemplate(true);
    try {
      const res = await api.get('/employees/import/template', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'SmartHR_Employee_Template.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(err);
      alert('Failed to download template: ' + (err.response?.data?.message || err.message));
    } finally {
      setDownloadingTemplate(false);
    }
  };

  // Handle File Selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setAnalysisResult(null);
      setErrorMsg('');
      setSyncSuccessResult(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
      setAnalysisResult(null);
      setErrorMsg('');
      setSyncSuccessResult(null);
    }
  };

  // Step 1: Run Smart Auto-Detection & Preview
  const handleAnalyze = async () => {
    setErrorMsg('');
    setSyncSuccessResult(null);

    if (activeTab === 'file' && !selectedFile) {
      setErrorMsg('Please select or drag an Excel (.xlsx, .xls), CSV (.csv), or PDF (.pdf) file.');
      return;
    }
    if (activeTab === 'googlesheets' && !googleSheetUrl.trim()) {
      setErrorMsg('Please enter a valid Google Sheets URL.');
      return;
    }

    setAnalyzing(true);
    const formData = new FormData();
    if (activeTab === 'file') {
      formData.append('file', selectedFile);
    } else {
      formData.append('googleSheetUrl', googleSheetUrl.trim());
    }

    try {
      const res = await api.post('/employees/import/preview', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setAnalysisResult(res.data);
    } catch (err) {
      console.error('Preview error:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to analyze source data.');
    } finally {
      setAnalyzing(false);
    }
  };

  // Step 2: Confirm and Update Database
  const handleConfirmSync = async () => {
    if (!analysisResult?.records || analysisResult.records.length === 0) return;

    setSyncing(true);
    setErrorMsg('');

    try {
      // Strip UI preview metadata (_importAction, _existingId, _matchedName) before sending to server
      const cleanRecords = analysisResult.records.map((rec) => {
        const clean = {};
        for (const [k, v] of Object.entries(rec)) {
          if (!k.startsWith('_')) {
            clean[k] = v;
          }
        }
        return clean;
      });

      const res = await api.post('/employees/import/confirm', {
        records: cleanRecords
      });

      setSyncSuccessResult(res.data);
      if (onComplete) onComplete();
    } catch (err) {
      console.error('Sync error:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to update database.');
    } finally {
      setSyncing(false);
    }
  };

  // Reset form
  const handleReset = () => {
    setSelectedFile(null);
    setGoogleSheetUrl('');
    setAnalysisResult(null);
    setErrorMsg('');
    setSyncSuccessResult(null);
  };

  return (
    <div className={`space-y-7 ${isModal ? 'p-1' : 'w-full max-w-6xl mx-auto pb-16'}`}>
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Sparkles size={20} />
            </span>
            <h1 className="text-2xl font-bold text-gray-950 tracking-tight">
              SmartHR Automated Ingestion & Sync
            </h1>
          </div>
          <p className="text-sm text-gray-500 mt-1 max-w-2xl">
            Upload any HR employee spreadsheet (Excel/CSV), Google Sheets link, or PDF. 
            The system automatically detects all 21 HR attributes and synchronizes them into the system.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleDownloadTemplate}
            disabled={downloadingTemplate}
            className="flex items-center gap-2 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer disabled:opacity-50"
            title="Download formatted sample template"
          >
            <Download size={14} className={downloadingTemplate ? 'animate-spin' : ''} />
            <span>Download 21-Field Template</span>
          </button>

          {isModal && onClose && (
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Success Completion / Warning Banner */}
      {syncSuccessResult && (
        <div className={`p-6 border rounded-3xl space-y-4 ${
          syncSuccessResult.createdCount > 0 || syncSuccessResult.updatedCount > 0
            ? 'bg-emerald-50 border-emerald-200'
            : 'bg-amber-50 border-amber-200'
        }`}>
          <div className="flex items-start gap-3">
            {syncSuccessResult.createdCount > 0 || syncSuccessResult.updatedCount > 0 ? (
              <CheckCircle2 size={24} className="text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle size={24} className="text-amber-600 shrink-0 mt-0.5" />
            )}
            <div>
              <h3 className={`text-base font-bold ${
                syncSuccessResult.createdCount > 0 || syncSuccessResult.updatedCount > 0
                  ? 'text-emerald-950'
                  : 'text-amber-950'
              }`}>
                {syncSuccessResult.message}
              </h3>
              <p className={`text-xs mt-1 ${
                syncSuccessResult.createdCount > 0 || syncSuccessResult.updatedCount > 0
                  ? 'text-emerald-800'
                  : 'text-amber-800'
              }`}>
                Database has been updated with {syncSuccessResult.createdCount} new employee records created and {syncSuccessResult.updatedCount} existing records updated.
              </p>
            </div>
          </div>

          {/* Row level errors if any */}
          {syncSuccessResult.errorCount > 0 && syncSuccessResult.errors?.length > 0 && (
            <div className="p-3 bg-amber-100/70 border border-amber-300 rounded-2xl text-xs text-amber-900 space-y-1">
              <span className="font-bold">Row-level issues ({syncSuccessResult.errorCount}):</span>
              <ul className="list-disc list-inside space-y-0.5">
                {syncSuccessResult.errors.map((e, idx) => (
                  <li key={idx}><span className="font-semibold">{e.employeeNo}</span>: {e.message}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                if (onComplete) onComplete();
                if (isModal && onClose) onClose();
                navigate('/employees');
              }}
              className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer shadow-xs"
            >
              <span>View Employee Directory</span>
              <ArrowRight size={14} />
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-2 bg-white border border-emerald-300 text-emerald-900 hover:bg-emerald-100 px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              <RefreshCw size={14} />
              <span>Import Another File</span>
            </button>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs font-medium text-red-800 flex items-center gap-3">
          <AlertCircle size={18} className="text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Source Selection & Input Section (Hidden if already succeeded) */}
      {!syncSuccessResult && (
        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-6">
          {/* Format Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              type="button"
              onClick={() => { setActiveTab('file'); setErrorMsg(''); }}
              className={`flex items-center gap-2 px-6 py-3 font-semibold text-sm border-b-2 transition-all cursor-pointer ${
                activeTab === 'file'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              <FileSpreadsheet size={16} />
              <span>Spreadsheet / PDF File (.xlsx, .xls, .csv, .pdf)</span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('googlesheets'); setErrorMsg(''); }}
              className={`flex items-center gap-2 px-6 py-3 font-semibold text-sm border-b-2 transition-all cursor-pointer ${
                activeTab === 'googlesheets'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              <Link2 size={16} />
              <span>Google Sheets Link</span>
            </button>
          </div>

          {/* Tab 1: File Upload */}
          {activeTab === 'file' && (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
                dragOver 
                  ? 'border-indigo-500 bg-indigo-50/50' 
                  : selectedFile 
                    ? 'border-emerald-400 bg-emerald-50/30'
                    : 'border-gray-200 hover:border-gray-300 bg-gray-50/50'
              }`}
            >
              <input
                type="file"
                id="hr-file-upload"
                accept=".xlsx,.xls,.csv,.pdf"
                onChange={handleFileChange}
                className="hidden"
              />

              {selectedFile ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    {selectedFile.name.endsWith('.pdf') ? <FileText size={24} /> : <FileSpreadsheet size={24} />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{selectedFile.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {(selectedFile.size / 1024).toFixed(1)} KB • Ready for automated field detection
                    </p>
                  </div>
                  <label
                    htmlFor="hr-file-upload"
                    className="text-xs font-semibold text-indigo-600 hover:underline cursor-pointer"
                  >
                    Change File
                  </label>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <UploadCloud size={24} />
                  </div>
                  <div>
                    <label
                      htmlFor="hr-file-upload"
                      className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                    >
                      Click to upload
                    </label>
                    <span className="text-sm text-gray-500"> or drag and drop</span>
                    <p className="text-xs text-gray-400 mt-1">
                      Microsoft Excel (.xlsx, .xls), CSV (.csv), or Adobe PDF (.pdf)
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Google Sheets */}
          {activeTab === 'googlesheets' && (
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                Google Sheets Share URL
              </label>
              <div className="relative">
                <input
                  type="url"
                  placeholder="https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit?usp=sharing"
                  value={googleSheetUrl}
                  onChange={(e) => {
                    setGoogleSheetUrl(e.target.value);
                    setAnalysisResult(null);
                    setErrorMsg('');
                  }}
                  className="w-full pl-10 pr-24 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <Link2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                {navigator.clipboard && (
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        const text = await navigator.clipboard.readText();
                        if (text) setGoogleSheetUrl(text);
                      } catch {}
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 text-xs font-semibold bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-700 transition-colors cursor-pointer"
                  >
                    Paste
                  </button>
                )}
              </div>
              <p className="text-[11px] text-gray-500 flex items-center gap-1.5">
                <Info size={13} className="text-indigo-500 shrink-0" />
                <span>Ensure the Google Sheet link sharing is set to <strong>"Anyone with the link can view"</strong> so the system can automatically read the columns.</span>
              </p>
            </div>
          )}

          {/* Analyze / Preview Trigger */}
          <div className="flex items-center justify-between pt-2">
            <div className="text-xs text-gray-500">
              The engine automatically maps all 21 HR fields (Employee No, Shift, Salary, NIC, etc.)
            </div>

            <button
              type="button"
              onClick={handleAnalyze}
              disabled={analyzing || (activeTab === 'file' ? !selectedFile : !googleSheetUrl.trim())}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-xs font-semibold transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              <Sparkles size={14} className={analyzing ? 'animate-spin' : ''} />
              <span>{analyzing ? 'Auto-Detecting...' : 'Analyze & Auto-Detect Fields'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Auto-Detection Preview Results */}
      {analysisResult && !syncSuccessResult && (
        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800">
                  {analysisResult.sourceType}
                </span>
                <h3 className="text-base font-bold text-gray-950">
                  Auto-Detection Report
                </h3>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Detected <strong>{analysisResult.totalRecords}</strong> employee rows from <em>{analysisResult.fileName}</em>.
              </p>
            </div>

            {/* Ingestion Action Stats */}
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                {analysisResult.willCreateCount} To Create
              </span>
              <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                {analysisResult.willUpdateCount} To Update (Existing)
              </span>
            </div>
          </div>

          {/* Detected Column Mapping Badges */}
          {analysisResult.detectedColumns?.length > 0 && (
            <div className="space-y-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Detected Column Mappings ({analysisResult.matchedFieldCount} Matched)
              </span>
              <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-2 bg-gray-50 rounded-2xl border border-gray-100">
                {analysisResult.detectedColumns.map((col, idx) => (
                  <div
                    key={idx}
                    className={`text-[11px] px-2.5 py-1 rounded-lg border flex items-center gap-1.5 ${
                      col.mappedField
                        ? 'bg-white border-emerald-200 text-emerald-900 shadow-2xs'
                        : 'bg-gray-100 border-gray-200 text-gray-500'
                    }`}
                  >
                    <span className="font-medium text-gray-600">{col.rawHeader}</span>
                    <ArrowRight size={10} className="text-gray-400" />
                    <span className="font-bold text-gray-900">{col.mappedFieldLabel}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Preview Table of Rows */}
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Preview Parsed Employee Records ({analysisResult.records.length})
            </span>
            <div className="overflow-x-auto border border-gray-200 rounded-2xl max-h-80 overflow-y-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-gray-100 text-gray-600 font-semibold sticky top-0 z-10">
                  <tr>
                    <th className="py-2.5 px-3">Action</th>
                    <th className="py-2.5 px-3">Employee No</th>
                    <th className="py-2.5 px-3">Full Name</th>
                    <th className="py-2.5 px-3">Division</th>
                    <th className="py-2.5 px-3">Designation</th>
                    <th className="py-2.5 px-3">Based Shift</th>
                    <th className="py-2.5 px-3">Salary</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">NIC</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {analysisResult.records.slice(0, 50).map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-2 px-3">
                        {row._importAction === 'UPDATE' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                            UPDATE
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            CREATE
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3 font-semibold text-gray-900">{row.employeeNo || '-'}</td>
                      <td className="py-2 px-3 text-gray-800 font-medium">{row.fullName || row.callingName || '-'}</td>
                      <td className="py-2 px-3 text-gray-600">{row.division || '-'}</td>
                      <td className="py-2 px-3 text-gray-600">{row.designation || '-'}</td>
                      <td className="py-2 px-3 text-gray-600">{row.basedShift || 'Day'}</td>
                      <td className="py-2 px-3 text-gray-600 font-mono">
                        {row.salary ? `LKR ${Number(row.salary).toLocaleString()}` : '-'}
                      </td>
                      <td className="py-2 px-3 text-gray-600">{row.employmentStatus || 'Probation'}</td>
                      <td className="py-2 px-3 text-gray-500 font-mono">{row.nicNumber || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {analysisResult.records.length > 50 && (
              <p className="text-[11px] text-gray-400 text-right">
                Showing first 50 rows of {analysisResult.records.length} records.
              </p>
            )}
          </div>

          {/* Confirmation & One-Click DB Update */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-gray-100">
            <div className="text-xs text-gray-500">
              Clicking below will immediately upsert these records into the master database.
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleReset}
                disabled={syncing}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel / Reset
              </button>

              <button
                type="button"
                onClick={handleConfirmSync}
                disabled={syncing}
                className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
              >
                <Database size={15} className={syncing ? 'animate-spin' : ''} />
                <span>{syncing ? 'Updating Database...' : `Apply & Update ${analysisResult.totalRecords} Records`}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Informative 21 HR Attributes Reference Card */}
      <div className="bg-gray-50 border border-gray-200 rounded-3xl p-6">
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-2">
          <Layers size={14} className="text-indigo-600" />
          Supported SmartHR Canonical Attributes (21 Fields)
        </h4>
        <p className="text-[11px] text-gray-500 mt-1">
          Our intelligent AI header-matcher automatically recognizes aliases, variations, and abbreviations for all 21 HR fields:
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2 mt-3">
          {CANONICAL_LABELS.map((label, idx) => (
            <div key={idx} className="bg-white border border-gray-200 rounded-lg p-2 text-center text-[10px] font-medium text-gray-700 shadow-2xs">
              {label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ImportAutomation;
