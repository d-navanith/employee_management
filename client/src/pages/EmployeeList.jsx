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
  DollarSign
} from 'lucide-react';

const EmployeeList = () => {
  const { canManageEmployees, isViewer } = useAuth();
  const navigate = useNavigate();

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters matching clean standard UI
  const [idFilter, setIdFilter] = useState('');
  const [nameFilter, setNameFilter] = useState('');
  const [divisionFilter, setDivisionFilter] = useState('');
  const [shiftFilter, setShiftFilter] = useState('All');

  // Selected employee for View Details modal
  const [viewModalEmployee, setViewModalEmployee] = useState(null);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await api.get('/employees');
      setEmployees(res.data);
    } catch (err) {
      console.error('Failed to load employees', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
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
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-950">
            {isViewer ? 'Employee Directory' : 'Employees'}
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            {isViewer 
              ? 'Workforce directory with sanitized role and contact information'
              : 'Manage employee master records across all 21 HR attributes'}
          </p>
        </div>

        {/* "+ Add Employee" button (Hidden for Viewer) */}
        {canManageEmployees && (
          <button
            onClick={() => navigate('/employees/new')}
            className="flex items-center gap-2 bg-black hover:bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-medium shadow-xs transition-all cursor-pointer"
          >
            <Plus size={16} />
            <span>Add Employee</span>
          </button>
        )}
      </div>

      {/* 4 Clean Filter Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Filter 1: ID */}
        <div className="relative flex items-center">
          <input
            type="text"
            placeholder="Employee No (e.g. EMP-001)"
            value={idFilter}
            onChange={(e) => setIdFilter(e.target.value)}
            className="soft-input pr-10"
          />
          <span className="absolute right-3.5 text-gray-400 font-mono text-base select-none pointer-events-none">
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
            className="soft-input pr-10"
          />
          <span className="absolute right-3.5 text-gray-400 font-mono text-base select-none pointer-events-none">
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
            className="soft-input pr-10"
          />
          <span className="absolute right-3.5 text-gray-400 font-mono text-base select-none pointer-events-none">
            ≈
          </span>
        </div>

        {/* Filter 4: Shift Selector */}
        <div className="flex items-center">
          <select
            value={shiftFilter}
            onChange={(e) => setShiftFilter(e.target.value)}
            className="soft-input cursor-pointer"
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
        <div className="bg-white border border-gray-100 rounded-3xl py-24 flex flex-col items-center justify-center text-center shadow-xs">
          <div className="w-14 h-14 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 mb-4">
            <User size={26} />
          </div>
          <h3 className="text-base font-semibold text-gray-900">No Employee found</h3>
          <p className="text-xs text-gray-400 mt-1 max-w-sm">
            Clear the filters to see all records or create a new employee profile.
          </p>

          <div className="flex items-center gap-2.5 mt-6">
            {canManageEmployees && (
              <button
                onClick={() => navigate('/employees/new')}
                className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-xl text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Plus size={13} />
                Create
              </button>
            )}

            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-xl text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      ) : (
        /* Populated Employee Records Table */
        <div className="bg-white border border-gray-200/80 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/70 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="py-3 px-5">Emp No</th>
                  <th className="py-3 px-5">Employee Name</th>
                  <th className="py-3 px-5">Division</th>
                  <th className="py-3 px-5">Designation</th>
                  <th className="py-3 px-5">Based Shift & Timings</th>
                  <th className="py-3 px-5">Status / Term</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {filteredEmployees.map((emp) => {
                  const empNo = emp.employeeNo || emp.employeeId;
                  const fullName = emp.fullName || `${emp.firstName || ''} ${emp.lastName || ''}`.trim();
                  const callingName = emp.callingName;
                  const shift = emp.basedShift || emp.shiftType || 'Day';
                  const isNight = shift === 'Night';

                  return (
                    <tr key={emp.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-3.5 px-5 font-mono font-medium text-gray-900">
                        {empNo}
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="font-medium text-gray-900">{fullName}</div>
                        {callingName && (
                          <div className="text-[11px] text-gray-500">
                            Calling name: <span className="font-semibold text-gray-700">{callingName}</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-5 text-gray-700 font-medium">
                        {emp.division || emp.department || '—'}
                      </td>
                      <td className="py-3.5 px-5 text-gray-600">
                        {emp.designation || '—'}
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="flex flex-col gap-1 items-start">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                            isNight
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                              : 'bg-amber-50 text-amber-700 border border-amber-100'
                          }`}>
                            {isNight ? <Moon size={11} /> : <Sun size={11} />}
                            {shift} Shift
                          </span>
                          {emp.shiftTimings && (
                            <span className="text-[10px] text-gray-500 flex items-center gap-1">
                              <Clock size={10} />
                              {emp.shiftTimings}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="flex flex-col gap-1 items-start">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            emp.employmentStatus === 'Permanent'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                              : 'bg-blue-50 text-blue-700 border border-blue-100'
                          }`}>
                            {emp.employmentStatus || 'Probation'}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {emp.status || 'Active'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setViewModalEmployee(emp)}
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="View Full Profile (21 Fields)"
                          >
                            <Eye size={15} />
                          </button>

                          {canManageEmployees && (
                            <>
                              <button
                                onClick={() => navigate(`/employees/${emp.id}/edit`)}
                                className="p-1.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                                title="Edit Employee"
                              >
                                <Edit3 size={15} />
                              </button>
                              <button
                                onClick={() => handleDelete(emp.id, empNo)}
                                className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                title="Delete Employee"
                              >
                                <Trash2 size={15} />
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

      {/* View 21-Field Employee Details Modal */}
      {viewModalEmployee && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-xs z-10">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold">
                  {viewModalEmployee.callingName ? viewModalEmployee.callingName[0] : 'E'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-gray-900">
                      {viewModalEmployee.fullName || `${viewModalEmployee.firstName || ''} ${viewModalEmployee.lastName || ''}`}
                    </h3>
                    <span className="font-mono text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md font-semibold">
                      {viewModalEmployee.employeeNo || viewModalEmployee.employeeId}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Calling Name: <span className="text-gray-900 font-semibold">{viewModalEmployee.callingName || '—'}</span> • {viewModalEmployee.designation || 'Staff'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewModalEmployee(null)}
                className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body - 21 Fields Structured */}
            <div className="p-6 space-y-6">
              {/* Group 1: Organization & Shift */}
              <div className="bg-gray-50/70 border border-gray-100 rounded-2xl p-4 space-y-3">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Building size={14} className="text-blue-600" />
                  Organization & Shift Details
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-gray-400 block text-[11px]">Division</span>
                    <span className="font-medium text-gray-800">{viewModalEmployee.division || viewModalEmployee.department || '—'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[11px]">Designation</span>
                    <span className="font-medium text-gray-800">{viewModalEmployee.designation || '—'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[11px]">Based Shift</span>
                    <span className="font-semibold text-blue-700">{viewModalEmployee.basedShift || viewModalEmployee.shiftType || 'Day'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[11px]">Shift Timings</span>
                    <span className="font-medium text-gray-800">{viewModalEmployee.shiftTimings || 'Standard'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[11px]">Employment Status</span>
                    <span className="font-semibold text-emerald-700">{viewModalEmployee.employmentStatus || 'Probation'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[11px]">Joining Date</span>
                    <span className="font-medium text-gray-800">{viewModalEmployee.joiningDate || viewModalEmployee.dateOfJoining || '—'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[11px]">Resigned Date</span>
                    <span className="font-medium text-gray-800">{viewModalEmployee.resignedDate || viewModalEmployee.relievingDate || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[11px]">Overall Status</span>
                    <span className="font-medium text-gray-800">{viewModalEmployee.status || 'Active'}</span>
                  </div>
                </div>
              </div>

              {/* Group 2: Personal Identity */}
              <div className="bg-gray-50/70 border border-gray-100 rounded-2xl p-4 space-y-3">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                  <User size={14} className="text-emerald-600" />
                  Personal Identity
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-gray-400 block text-[11px]">Gender</span>
                    <span className="font-medium text-gray-800">{viewModalEmployee.gender || '—'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[11px]">Birthdate</span>
                    <span className="font-medium text-gray-800">{viewModalEmployee.birthDate || viewModalEmployee.dateOfBirth || '—'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[11px]">Civil Status</span>
                    <span className="font-medium text-gray-800">{viewModalEmployee.civilStatus || viewModalEmployee.maritalStatus || 'Single'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[11px]">NIC Number</span>
                    {isViewer ? (
                      <span className="text-gray-400 italic font-mono">[Restricted]</span>
                    ) : (
                      <span className="font-mono font-medium text-gray-800">{viewModalEmployee.nicNumber || viewModalEmployee.nationalId || '—'}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Group 3: Contact & Address */}
              <div className="bg-gray-50/70 border border-gray-100 rounded-2xl p-4 space-y-3">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin size={14} className="text-indigo-600" />
                  Contact & Addresses
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-gray-400 block text-[11px]">Email</span>
                    <span className="font-medium text-gray-800">{viewModalEmployee.email || viewModalEmployee.companyEmail || '—'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[11px]">Contact Number</span>
                    <span className="font-medium text-gray-800">{viewModalEmployee.contactNumber || viewModalEmployee.mobile || '—'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[11px]">Resident Address (Current)</span>
                    {isViewer ? (
                      <span className="text-gray-400 italic">[Restricted]</span>
                    ) : (
                      <span className="font-medium text-gray-800">{viewModalEmployee.residentAddress || viewModalEmployee.currentAddress || '—'}</span>
                    )}
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[11px]">Permanent Address (Hometown)</span>
                    {isViewer ? (
                      <span className="text-gray-400 italic">[Restricted]</span>
                    ) : (
                      <span className="font-medium text-gray-800">{viewModalEmployee.permanentAddress || '—'}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Group 4: Emergency & Compensation */}
              <div className="bg-gray-50/70 border border-gray-100 rounded-2xl p-4 space-y-3">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Shield size={14} className="text-amber-600" />
                  Emergency & Confidential Compensation
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-gray-400 block text-[11px]">Emergency Contact</span>
                    {isViewer ? (
                      <span className="text-gray-400 italic">[Restricted]</span>
                    ) : (
                      <span className="font-medium text-gray-800">{viewModalEmployee.emergencyContact || viewModalEmployee.emergencyPhone || '—'}</span>
                    )}
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[11px]">Relationship</span>
                    {isViewer ? (
                      <span className="text-gray-400 italic">[Restricted]</span>
                    ) : (
                      <span className="font-medium text-gray-800">{viewModalEmployee.relationship || viewModalEmployee.emergencyRelation || '—'}</span>
                    )}
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[11px]">Salary</span>
                    {isViewer ? (
                      <span className="text-gray-400 italic">[Restricted - Viewer]</span>
                    ) : (
                      <span className="font-mono font-bold text-emerald-700">
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
            <div className="p-4 border-t border-gray-100 flex items-center justify-end bg-gray-50/50">
              <button
                onClick={() => setViewModalEmployee(null)}
                className="px-5 py-2 bg-gray-900 text-white rounded-xl text-xs font-medium hover:bg-black transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeList;
