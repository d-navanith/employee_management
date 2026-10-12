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
  Download, 
  FileText,
  Building,
  CheckCircle2,
  X
} from 'lucide-react';

const EmployeeList = () => {
  const { canManageEmployees, isViewer, isDeveloper } = useAuth();
  const navigate = useNavigate();

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters matching screenshot 3
  const [idFilter, setIdFilter] = useState('');
  const [nameFilter, setNameFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [shiftFilter, setShiftFilter] = useState('All');

  // Selected employee for Viewer modal
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

  const handleDelete = async (id, empId) => {
    if (!window.confirm(`Are you sure you want to delete employee record ${empId}?`)) return;
    try {
      await api.delete(`/employees/${id}`);
      setEmployees(employees.filter(e => e.id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete employee.');
    }
  };

  // Filter logic
  const filteredEmployees = employees.filter((emp) => {
    const matchesId = !idFilter || emp.employeeId.toLowerCase().includes(idFilter.toLowerCase());
    const fullName = `${emp.firstName || ''} ${emp.middleName || ''} ${emp.lastName || ''}`.trim();
    const matchesName = !nameFilter || fullName.toLowerCase().includes(nameFilter.toLowerCase());
    const matchesDept = !deptFilter || (emp.department && emp.department.toLowerCase().includes(deptFilter.toLowerCase()));
    const matchesShift = shiftFilter === 'All' || emp.shiftType === shiftFilter;
    return matchesId && matchesName && matchesDept && matchesShift;
  });

  const clearFilters = () => {
    setIdFilter('');
    setNameFilter('');
    setDeptFilter('');
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
              ? 'Sanitized workforce directory without personal or financial data'
              : 'Manage employee master records, roles, profiles and contracts'}
          </p>
        </div>

        {/* "+ Add Employee" button matching Screenshot 3 (Hidden for Viewer) */}
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

      {/* Filter Bar with input style matching screenshot 3 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Filter 1: ID with '≈' */}
        <div className="relative flex items-center">
          <input
            type="text"
            placeholder="ID"
            value={idFilter}
            onChange={(e) => setIdFilter(e.target.value)}
            className="soft-input pr-10"
          />
          <span className="absolute right-3.5 text-gray-400 font-mono text-base select-none pointer-events-none">
            ≈
          </span>
        </div>

        {/* Filter 2: Full Name with '≈' */}
        <div className="relative flex items-center">
          <input
            type="text"
            placeholder="Full Name"
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
            className="soft-input pr-10"
          />
          <span className="absolute right-3.5 text-gray-400 font-mono text-base select-none pointer-events-none">
            ≈
          </span>
        </div>

        {/* Filter 3: Department with '≈' */}
        <div className="relative flex items-center">
          <input
            type="text"
            placeholder="Department"
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
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
        /* Empty State matching Screenshot 3 */
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

            <button
              onClick={() => alert('Smart HR API Documentation is accessible under /api/health')}
              className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-xl text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <FileText size={13} />
              Documentation
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
                  <th className="py-3 px-5">ID</th>
                  <th className="py-3 px-5">Employee Name</th>
                  <th className="py-3 px-5">Designation</th>
                  <th className="py-3 px-5">Department</th>
                  <th className="py-3 px-5">Shift</th>
                  <th className="py-3 px-5">Type</th>
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {filteredEmployees.map((emp) => {
                  const fullName = `${emp.firstName || ''} ${emp.lastName || ''}`.trim();
                  return (
                    <tr key={emp.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-3.5 px-5 font-mono font-medium text-gray-900">
                        {emp.employeeId}
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="font-medium text-gray-900">{fullName}</div>
                        <div className="text-[11px] text-gray-400">{emp.company || 'akoma'}</div>
                      </td>
                      <td className="py-3.5 px-5 text-gray-600">
                        {emp.designation || '—'}
                      </td>
                      <td className="py-3.5 px-5 text-gray-600">
                        {emp.department || '—'}
                      </td>
                      <td className="py-3.5 px-5">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                          emp.shiftType === 'Night'
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                            : 'bg-amber-50 text-amber-700 border border-amber-100'
                        }`}>
                          {emp.shiftType === 'Night' ? <Moon size={11} /> : <Sun size={11} />}
                          {emp.shiftType || 'Day'}
                        </span>
                      </td>
                      <td className="py-3.5 px-5">
                        <span className={`text-[11px] font-medium ${emp.isStaff ? 'text-emerald-700' : 'text-gray-500'}`}>
                          {emp.isStaff ? 'Staff' : 'Worker'}
                        </span>
                      </td>
                      <td className="py-3.5 px-5">
                        <span className={`px-2 py-0.5 rounded-md text-[11px] font-medium ${
                          emp.status === 'Active' 
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {emp.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {canManageEmployees ? (
                            <>
                              <button
                                onClick={() => navigate(`/employees/edit/${emp.id}`)}
                                title="Edit Employee"
                                className="p-1.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                              >
                                <Edit3 size={15} />
                              </button>
                              <button
                                onClick={() => handleDelete(emp.id, emp.employeeId)}
                                title="Delete Employee"
                                className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              >
                                <Trash2 size={15} />
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => setViewModalEmployee(emp)}
                              className="px-2.5 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <Eye size={13} />
                              Details
                            </button>
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

      {/* Viewer Modal (Sanitized summary popup for Viewer role) */}
      {viewModalEmployee && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 relative">
            <button
              onClick={() => setViewModalEmployee(null)}
              className="absolute top-5 right-5 p-1 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-sm">
                {viewModalEmployee.firstName?.charAt(0)}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-base">
                  {viewModalEmployee.firstName} {viewModalEmployee.lastName}
                </h3>
                <span className="font-mono text-xs text-gray-400">{viewModalEmployee.employeeId}</span>
              </div>
            </div>

            <div className="mt-6 border-t border-gray-100 pt-4 space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500">Department</span>
                <span className="font-medium text-gray-900">{viewModalEmployee.department || '—'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500">Designation</span>
                <span className="font-medium text-gray-900">{viewModalEmployee.designation || '—'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500">Shift</span>
                <span className="font-semibold text-gray-900">{viewModalEmployee.shiftType} Shift</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500">Workforce Category</span>
                <span className="font-medium text-gray-900">{viewModalEmployee.isStaff ? 'Staff' : 'Worker'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500">Employment Type</span>
                <span className="font-medium text-gray-900">{viewModalEmployee.employmentType}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-500">Status</span>
                <span className="font-semibold text-emerald-600">{viewModalEmployee.status}</span>
              </div>
            </div>

            <button
              onClick={() => setViewModalEmployee(null)}
              className="mt-6 w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeList;
