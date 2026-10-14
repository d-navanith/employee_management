import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  Plus, 
  Search, 
  User, 
  Trash2, 
  Edit3, 
  Eye, 
  Sun, 
  Moon, 
  Clock,
  Building,
  CheckCircle2,
  X,
  FileText,
  Shield,
  Phone,
  Mail,
  MapPin,
  Calendar,
  DollarSign,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import ImportAutomation from './ImportAutomation';

const EmployeeList = () => {
  const { canManageEmployees, isViewer } = useAuth();
  const navigate = useNavigate();

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshNotice, setRefreshNotice] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);

  // Filters matching clean standard UI
  const [idFilter, setIdFilter] = useState('');
  const [nameFilter, setNameFilter] = useState('');
  const [divisionFilter, setDivisionFilter] = useState('');
  const [shiftFilter, setShiftFilter] = useState('All');

  // Selected employee for View Details modal
  const [viewModalEmployee, setViewModalEmployee] = useState(null);

  const fetchEmployees = async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    else setLoading(true);

    try {
      const res = await api.get('/employees');
      setEmployees(res.data);
      if (isManual) {
        setRefreshNotice('Employee directory refreshed successfully!');
        setTimeout(() => setRefreshNotice(''), 3000);
      }
    } catch (err) {
      console.error('Failed to load employees', err);
      if (isManual) {
        setRefreshNotice('Failed to refresh directory.');
        setTimeout(() => setRefreshNotice(''), 3000);
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEmployees(false);
  }, []);

  const handleDelete = async (id, empNo) => {
    if (!window.confirm(`Are you sure you want to delete employee record ${empNo}?`)) return;
    try {
      await api.delete(`/employees/${id}`);
      setEmployees(employees.filter(e => e.id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete employee.');
    }
  };

  // Filter logic across the 21 fields
  const filteredEmployees = employees.filter((emp) => {
    const empNo = (emp.employeeNo || emp.employeeId || '').toLowerCase();
    const matchesId = !idFilter || empNo.includes(idFilter.toLowerCase());

    const fullName = (emp.fullName || `${emp.firstName || ''} ${emp.lastName || ''}`).toLowerCase();
    const callingName = (emp.callingName || '').toLowerCase();
    const matchesName = !nameFilter || fullName.includes(nameFilter.toLowerCase()) || callingName.includes(nameFilter.toLowerCase());

    const div = (emp.division || emp.department || '').toLowerCase();
    const matchesDiv = !divisionFilter || div.includes(divisionFilter.toLowerCase());

    const shift = emp.basedShift || emp.shiftType || 'Day';
    const matchesShift = shiftFilter === 'All' || shift === shiftFilter;

    return matchesId && matchesName && matchesDiv && matchesShift;
  });

  const clearFilters = () => {
    setIdFilter('');
    setNameFilter('');
    setDivisionFilter('');
    setShiftFilter('All');
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-7">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-950 tracking-tight">
            {isViewer ? 'Employee Directory' : 'Employees'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {isViewer 
              ? 'Workforce directory with sanitized role and contact information'
              : 'Manage employee master records across all 21 HR attributes'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Refresh Directory Button */}
          <button
            type="button"
            onClick={() => fetchEmployees(true)}
            disabled={isRefreshing}
            className="flex items-center gap-2 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 px-4 py-3 rounded-xl text-sm font-semibold shadow-xs transition-all cursor-pointer shrink-0 disabled:opacity-50"
            title="Refresh employee directory"
          >
            <RefreshCw size={16} className={isRefreshing ? 'animate-spin text-blue-600' : ''} />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>

          {/* Smart Auto-Import Button (Excel, Google Sheets, PDF) */}
          {canManageEmployees && (
            <button
              onClick={() => setShowImportModal(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white px-5 py-3 rounded-xl text-sm font-semibold shadow-xs transition-all cursor-pointer shrink-0"
              title="Automated Excel, Google Sheets, and PDF Ingestion"
            >
              <Sparkles size={16} className="text-amber-300" />
              <span>Smart Auto-Import</span>
            </button>
          )}

          {/* "+ Add Employee" button (Hidden for Viewer) */}
          {canManageEmployees && (
            <button
              onClick={() => navigate('/employees/new')}
              className="flex items-center gap-2 bg-black hover:bg-gray-900 text-white px-6 py-3 rounded-xl text-sm font-semibold shadow-xs transition-all cursor-pointer shrink-0"
            >
              <Plus size={18} />
              <span>Add Employee</span>
            </button>
          )}
        </div>
      </div>

      {/* Refresh Feedback Notice */}
      {refreshNotice && (
        <div className="flex items-center gap-2 text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 px-4 py-3 rounded-xl font-medium">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{refreshNotice}</span>
        </div>
      )}

      {/* 4 Clean Filter Inputs with enhanced sizing */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Filter 1: ID */}
        <div className="relative flex items-center">
          <input
            type="text"
            placeholder="Employee No (e.g. EMP-001)"
            value={idFilter}
            onChange={(e) => setIdFilter(e.target.value)}
            className="soft-input pr-11 text-sm font-medium"
          />
          <span className="absolute right-4 text-gray-400 font-mono text-lg select-none pointer-events-none font-bold">
            ≈
          </span>
        </div>

        {/* Filter 2: Name */}
        <div className="relative flex items-center">
          <input
            type="text"
            placeholder="Name or Calling Name"
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
            className="soft-input pr-11 text-sm font-medium"
          />
          <span className="absolute right-4 text-gray-400 font-mono text-lg select-none pointer-events-none font-bold">
            ≈
          </span>
        </div>

        {/* Filter 3: Division */}
        <div className="relative flex items-center">
          <input
            type="text"
            placeholder="Division / Department"
            value={divisionFilter}
            onChange={(e) => setDivisionFilter(e.target.value)}
            className="soft-input pr-11 text-sm font-medium"
          />
          <span className="absolute right-4 text-gray-400 font-mono text-lg select-none pointer-events-none font-bold">
            ≈
          </span>
        </div>

        {/* Filter 4: Shift Selector */}
        <div className="flex items-center">
          <select
            value={shiftFilter}
            onChange={(e) => setShiftFilter(e.target.value)}
            className="soft-input cursor-pointer text-sm font-medium"
          >
            <option value="All">All Shifts</option>
            <option value="Day">Day Shift</option>
            <option value="Night">Night Shift</option>
            <option value="General">General Shift</option>
          </select>
        </div>
      </div>

      {/* Main Table or Empty State */}
      {filteredEmployees.length === 0 ? (
        <div className="bg-white border border-gray-200/90 rounded-3xl py-28 flex flex-col items-center justify-center text-center shadow-xs">
          <div className="w-16 h-16 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-400 mb-4">
            <User size={30} />
          </div>
          <h3 className="text-lg font-bold text-gray-900">No Employee found</h3>
          <p className="text-sm text-gray-400 mt-1 max-w-sm">
            Clear the filters to see all records or create a new employee profile.
          </p>

          <div className="flex items-center gap-3 mt-6">
            {canManageEmployees && (
              <button
                onClick={() => navigate('/employees/new')}
                className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Plus size={15} />
                Create
              </button>
            )}

            <button
              onClick={clearFilters}
              className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      ) : (
        /* Populated Employee Records Table - Enlarged and High Readability */
        <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/80 text-xs font-bold text-gray-600 uppercase tracking-wider">
                  <th className="py-4.5 px-6">Emp No</th>
                  <th className="py-4.5 px-6">Employee Name</th>
                  <th className="py-4.5 px-6">Division</th>
                  <th className="py-4.5 px-6">Designation</th>
                  <th className="py-4.5 px-6">Based Shift & Timings</th>
                  <th className="py-4.5 px-6">Status / Term</th>
                  <th className="py-4.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredEmployees.map((emp) => {
                  const empNo = emp.employeeNo || emp.employeeId;
                  const fullName = emp.fullName || `${emp.firstName || ''} ${emp.lastName || ''}`.trim();
                  const callingName = emp.callingName;
                  const shift = emp.basedShift || emp.shiftType || 'Day';
                  const isNight = shift === 'Night';

                  return (
                    <tr key={emp.id} className="hover:bg-blue-50/20 transition-colors">
                      <td className="py-5 px-6 font-mono font-bold text-sm text-gray-900">
                        {empNo}
                      </td>
                      <td className="py-5 px-6">
                        <div className="font-semibold text-base text-gray-950">{fullName}</div>
                        {callingName && (
                          <div className="text-xs text-gray-500 mt-0.5">
                            Calling name: <span className="font-semibold text-gray-800">{callingName}</span>
                          </div>
                        )}
                      </td>
                      <td className="py-5 px-6 text-sm font-semibold text-gray-800">
                        {emp.division || emp.department || '—'}
                      </td>
                      <td className="py-5 px-6 text-sm text-gray-700">
                        {emp.designation || '—'}
                      </td>
                      <td className="py-5 px-6">
                        <div className="flex flex-col gap-1.5 items-start">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                            isNight
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {isNight ? <Moon size={13} /> : <Sun size={13} />}
                            {shift} Shift
                          </span>
                          {emp.shiftTimings && (
                            <span className="text-xs text-gray-500 flex items-center gap-1.5 font-medium">
                              <Clock size={12} className="text-gray-400" />
                              {emp.shiftTimings}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-5 px-6">
                        <div className="flex flex-col gap-1 items-start">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                            emp.employmentStatus === 'Permanent'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}>
                            {emp.employmentStatus || 'Probation'}
                          </span>
                          <span className="text-xs text-gray-500 font-medium pl-1">
                            {emp.status || 'Active'}
                          </span>
                        </div>
                      </td>
                      <td className="py-5 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setViewModalEmployee(emp)}
                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer"
                            title="View Full Profile (21 Fields)"
                          >
                            <Eye size={18} />
                          </button>

                          {canManageEmployees && (
                            <>
                              <button
                                onClick={() => navigate(`/employees/edit/${emp.id}`)}
                                className="p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors cursor-pointer"
                                title="Edit Employee"
                              >
                                <Edit3 size={18} />
                              </button>
                              <button
                                onClick={() => handleDelete(emp.id, empNo)}
                                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                                title="Delete Employee"
                              >
                                <Trash2 size={18} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View 21-Field Employee Details Modal - Enhanced Sizing */}
      {viewModalEmployee && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 sm:p-7 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-xs z-10">
              <div className="flex items-center gap-4">
                <div className="w-13 h-13 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 text-xl font-bold">
                  {viewModalEmployee.callingName ? viewModalEmployee.callingName[0] : 'E'}
                </div>
                <div>
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-950">
                      {viewModalEmployee.fullName || `${viewModalEmployee.firstName || ''} ${viewModalEmployee.lastName || ''}`}
                    </h3>
                    <span className="font-mono text-sm bg-gray-100 text-gray-800 px-2.5 py-0.5 rounded-lg font-bold border border-gray-200">
                      {viewModalEmployee.employeeNo || viewModalEmployee.employeeId}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Calling Name: <span className="text-gray-950 font-bold">{viewModalEmployee.callingName || '—'}</span> • <span className="text-gray-700 font-medium">{viewModalEmployee.designation || 'Staff'}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewModalEmployee(null)}
                className="p-2.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body - 21 Fields Structured */}
            <div className="p-6 sm:p-8 space-y-7">
              {/* Group 1: Organization & Shift */}
              <div className="bg-gray-50/80 border border-gray-200/80 rounded-2xl p-5 space-y-4">
                <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wider flex items-center gap-2">
                  <Building size={16} className="text-blue-600" />
                  Organization & Shift Details
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                  <div>
                    <span className="text-gray-400 block text-xs font-medium">Division</span>
                    <span className="font-bold text-sm text-gray-900 mt-0.5 block">{viewModalEmployee.division || viewModalEmployee.department || '—'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-xs font-medium">Designation</span>
                    <span className="font-bold text-sm text-gray-900 mt-0.5 block">{viewModalEmployee.designation || '—'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-xs font-medium">Based Shift</span>
                    <span className="font-bold text-sm text-blue-700 mt-0.5 block">{viewModalEmployee.basedShift || viewModalEmployee.shiftType || 'Day'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-xs font-medium">Shift Timings</span>
                    <span className="font-bold text-sm text-gray-900 mt-0.5 block">{viewModalEmployee.shiftTimings || 'Standard'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-xs font-medium">Employment Status</span>
                    <span className="font-bold text-sm text-emerald-700 mt-0.5 block">{viewModalEmployee.employmentStatus || 'Probation'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-xs font-medium">Joining Date</span>
                    <span className="font-bold text-sm text-gray-900 mt-0.5 block">{viewModalEmployee.joiningDate || viewModalEmployee.dateOfJoining || '—'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-xs font-medium">Resigned Date</span>
                    <span className="font-bold text-sm text-gray-900 mt-0.5 block">{viewModalEmployee.resignedDate || viewModalEmployee.relievingDate || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-xs font-medium">Overall Status</span>
                    <span className="font-bold text-sm text-gray-900 mt-0.5 block">{viewModalEmployee.status || 'Active'}</span>
                  </div>
                </div>
              </div>

              {/* Group 2: Personal Identity */}
              <div className="bg-gray-50/80 border border-gray-200/80 rounded-2xl p-5 space-y-4">
                <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wider flex items-center gap-2">
                  <User size={16} className="text-emerald-600" />
                  Personal Identity
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                  <div>
                    <span className="text-gray-400 block text-xs font-medium">Gender</span>
                    <span className="font-bold text-sm text-gray-900 mt-0.5 block">{viewModalEmployee.gender || '—'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-xs font-medium">Birthdate</span>
                    <span className="font-bold text-sm text-gray-900 mt-0.5 block">{viewModalEmployee.birthDate || viewModalEmployee.dateOfBirth || '—'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-xs font-medium">Civil Status</span>
                    <span className="font-bold text-sm text-gray-900 mt-0.5 block">{viewModalEmployee.civilStatus || viewModalEmployee.maritalStatus || 'Single'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-xs font-medium">NIC Number</span>
                    {isViewer ? (
                      <span className="text-gray-400 italic font-mono text-sm">[Restricted]</span>
                    ) : (
                      <span className="font-mono font-bold text-sm text-gray-900 mt-0.5 block">{viewModalEmployee.nicNumber || viewModalEmployee.nationalId || '—'}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Group 3: Contact & Address */}
              <div className="bg-gray-50/80 border border-gray-200/80 rounded-2xl p-5 space-y-4">
                <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wider flex items-center gap-2">
                  <MapPin size={16} className="text-indigo-600" />
                  Contact & Addresses
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <span className="text-gray-400 block text-xs font-medium">Email</span>
                    <span className="font-bold text-sm text-gray-900 mt-0.5 block">{viewModalEmployee.email || viewModalEmployee.companyEmail || '—'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-xs font-medium">Contact Number</span>
                    <span className="font-bold text-sm text-gray-900 mt-0.5 block">{viewModalEmployee.contactNumber || viewModalEmployee.mobile || '—'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-xs font-medium">Resident Address (Current)</span>
                    {isViewer ? (
                      <span className="text-gray-400 italic text-sm">[Restricted]</span>
                    ) : (
                      <span className="font-semibold text-sm text-gray-900 mt-0.5 block">{viewModalEmployee.residentAddress || viewModalEmployee.currentAddress || '—'}</span>
                    )}
                  </div>
                  <div>
                    <span className="text-gray-400 block text-xs font-medium">Permanent Address (Hometown)</span>
                    {isViewer ? (
                      <span className="text-gray-400 italic text-sm">[Restricted]</span>
                    ) : (
                      <span className="font-semibold text-sm text-gray-900 mt-0.5 block">{viewModalEmployee.permanentAddress || '—'}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Group 4: Emergency & Compensation */}
              <div className="bg-gray-50/80 border border-gray-200/80 rounded-2xl p-5 space-y-4">
                <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wider flex items-center gap-2">
                  <Shield size={16} className="text-amber-600" />
                  Emergency & Confidential Compensation
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <span className="text-gray-400 block text-xs font-medium">Emergency Contact</span>
                    {isViewer ? (
                      <span className="text-gray-400 italic text-sm">[Restricted]</span>
                    ) : (
                      <span className="font-bold text-sm text-gray-900 mt-0.5 block">{viewModalEmployee.emergencyContact || viewModalEmployee.emergencyPhone || '—'}</span>
                    )}
                  </div>
                  <div>
                    <span className="text-gray-400 block text-xs font-medium">Relationship</span>
                    {isViewer ? (
                      <span className="text-gray-400 italic text-sm">[Restricted]</span>
                    ) : (
                      <span className="font-bold text-sm text-gray-900 mt-0.5 block">{viewModalEmployee.relationship || viewModalEmployee.emergencyRelation || '—'}</span>
                    )}
                  </div>
                  <div>
                    <span className="text-gray-400 block text-xs font-medium">Monthly Salary</span>
                    {isViewer ? (
                      <span className="text-gray-400 italic text-sm">[Restricted - Viewer]</span>
                    ) : (
                      <span className="font-mono font-bold text-base text-emerald-700 mt-0.5 block">
                        {viewModalEmployee.salary !== undefined && viewModalEmployee.salary !== null
                          ? `$${Number(viewModalEmployee.salary).toLocaleString()}`
                          : (viewModalEmployee.basicSalary ? `$${Number(viewModalEmployee.basicSalary).toLocaleString()}` : '—')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-5 sm:p-6 border-t border-gray-100 flex items-center justify-end gap-3 bg-gray-50/60">
              {canManageEmployees && (
                <button
                  onClick={() => {
                    const empId = viewModalEmployee.id;
                    setViewModalEmployee(null);
                    navigate(`/employees/edit/${empId}`);
                  }}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors cursor-pointer flex items-center gap-2 shadow-xs"
                >
                  <Edit3 size={16} />
                  <span>Edit Profile</span>
                </button>
              )}
              <button
                onClick={() => setViewModalEmployee(null)}
                className="px-6 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-black transition-colors cursor-pointer shadow-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Smart Auto-Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-5xl w-full max-h-[92vh] overflow-y-auto shadow-2xl relative">
            <ImportAutomation
              isModal={true}
              onClose={() => setShowImportModal(false)}
              onComplete={() => {
                fetchEmployees(true);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeList;
