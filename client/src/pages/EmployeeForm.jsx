import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Check, ArrowLeft, ShieldAlert } from 'lucide-react';

const TABS = [
  'Overview',
  'Address & Contacts',
  'Attendance & Leaves',
  'Salary',
  'Personal Details',
  'Profile',
  'Joining',
  'Exit'
];

const EmployeeForm = () => {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const { canManageEmployees, isViewer } = useAuth();

  const [activeTab, setActiveTab] = useState('Overview');
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    // Overview
    employeeId: '',
    series: 'HR-EMP-',
    salutation: 'Mr',
    firstName: '',
    middleName: '',
    lastName: '',
    gender: 'Male',
    dateOfBirth: '',
    dateOfJoining: new Date().toISOString().split('T')[0],
    status: 'Active',
    company: 'akoma',
    designation: '',
    branch: 'Headquarters',
    department: 'Engineering',
    reportsTo: '',
    grade: 'Grade-B',
    employmentType: 'Full-time',
    shiftType: 'Day',
    isStaff: true,

    // Address & Contacts
    mobile: '',
    companyEmail: '',
    personalEmail: '',
    currentAddress: '',
    currentAddressIs: 'Rented',
    permanentAddress: '',
    permanentAddressIs: 'Rented',
    emergencyContactName: '',
    emergencyPhone: '',
    emergencyRelation: '',

    // Attendance & Leaves
    leaveBalance: 14,
    attendancePercentage: 98.0,

    // Salary (SENSITIVE)
    basicSalary: '',
    allowances: '',
    deductions: '',
    netSalary: '',
    bankName: '',
    bankAccountNumber: '',
    paymentMethod: 'Bank Transfer',

    // Personal Details (SENSITIVE)
    maritalStatus: 'Single',
    bloodGroup: 'O+',
    nationality: 'United States',
    nationalId: '',

    // Profile
    bio: '',
    avatarUrl: '',

    // Joining & Exit
    confirmationDate: '',
    contractEndDate: '',
    relievingDate: '',
    exitReason: ''
  });

  useEffect(() => {
    if (isViewer) {
      alert('Viewer role does not have authorization to create or modify employee records.');
      navigate('/employees');
      return;
    }

    if (isEditing) {
      const loadEmployee = async () => {
        setLoading(true);
        try {
          const res = await api.get(`/employees/${id}`);
          setFormData(res.data);
        } catch (err) {
          setError(err.response?.data?.message || 'Failed to load employee.');
        } finally {
          setLoading(false);
        }
      };
      loadEmployee();
    } else {
      // Auto-fetch next suggested ID
      const fetchNextId = async () => {
        try {
          const res = await api.get('/employees/next-id');
          if (res.data?.nextId) {
            setFormData(prev => ({ ...prev, employeeId: res.data.nextId }));
          }
        } catch (e) {
          // Fallback
        }
      };
      fetchNextId();
    }
  }, [id, isEditing, isViewer]);

  // Recalculate net salary automatically
  useEffect(() => {
    const basic = parseFloat(formData.basicSalary) || 0;
    const allow = parseFloat(formData.allowances) || 0;
    const ded = parseFloat(formData.deductions) || 0;
    if (basic > 0 || allow > 0 || ded > 0) {
      setFormData(prev => ({
        ...prev,
        netSalary: Math.max(0, basic + allow - ded)
      }));
    }
  }, [formData.basicSalary, formData.allowances, formData.deductions]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isEditing) {
        await api.put(`/employees/${id}`, formData);
      } else {
        await api.post('/employees', formData);
      }

      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        navigate('/employees');
      }, 900);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save employee.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Bar matching Screenshots 1 & 2 */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-200 pb-3">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-6 overflow-x-auto w-full sm:w-auto scrollbar-none py-1">
          {TABS.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`text-sm whitespace-nowrap pb-2 transition-all cursor-pointer relative ${
                  isActive
                    ? 'font-semibold text-gray-900 border-b-2 border-gray-900'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Big Green Save Button matching Screenshot 1 & 2 */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => navigate('/employees')}
            className="px-4 py-2 text-xs font-medium text-gray-500 hover:text-gray-800 flex items-center gap-1 cursor-pointer"
          >
            <ArrowLeft size={14} /> Back
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="bg-[#10b981] hover:bg-[#059669] text-white px-8 py-2.5 rounded-xl font-medium text-sm transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {saveSuccess ? (
              <>
                <Check size={16} /> Saved!
              </>
            ) : (
              'Save'
            )}
          </button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700">
          {error}
        </div>
      )}

      {/* Form Content Area */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-2 sm:p-4">
        
        {/* ===================== TAB 1: OVERVIEW (Screenshot 2) ===================== */}
        {activeTab === 'Overview' && (
          <div className="space-y-8 max-w-5xl">
            {/* Top Row: Series, Gender, Date of Joining */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="soft-label">Series *</label>
                <select
                  name="series"
                  value={formData.series}
                  onChange={handleChange}
                  className="soft-input"
                >
                  <option value="HR-EMP-">HR-EMP-</option>
                  <option value="ENG-EMP-">ENG-EMP-</option>
                  <option value="OPS-EMP-">OPS-EMP-</option>
                </select>
              </div>

              <div>
                <label className="soft-label">Gender *</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="soft-input"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="soft-label">Date of Joining *</label>
                <input
                  type="date"
                  name="dateOfJoining"
                  required
                  value={formData.dateOfJoining}
                  onChange={handleChange}
                  className="soft-input"
                />
              </div>
            </div>

            {/* Row 2: First Name, Date of Birth, Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="soft-label">First Name *</label>
                <input
                  type="text"
                  name="firstName"
                  required
                  placeholder="First name"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="soft-input"
                />
              </div>

              <div>
                <label className="soft-label">Date of Birth *</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className="soft-input"
                />
              </div>

              <div>
                <label className="soft-label">Status *</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="soft-input"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Relieved">Relieved</option>
                  <option value="On Leave">On Leave</option>
                </select>
              </div>
            </div>

            {/* Row 3: Middle Name, Salutation */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="soft-label">Middle Name</label>
                <input
                  type="text"
                  name="middleName"
                  placeholder="Middle name"
                  value={formData.middleName}
                  onChange={handleChange}
                  className="soft-input"
                />
              </div>

              <div>
                <label className="soft-label">Salutation</label>
                <select
                  name="salutation"
                  value={formData.salutation}
                  onChange={handleChange}
                  className="soft-input"
                >
                  <option value="Mr">Mr</option>
                  <option value="Ms">Ms</option>
                  <option value="Mrs">Mrs</option>
                  <option value="Dr">Dr</option>
                </select>
              </div>

              <div>
                <label className="soft-label">Employee ID (Auto / Unique)</label>
                <input
                  type="text"
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleChange}
                  className="soft-input font-mono font-semibold"
                />
              </div>
            </div>

            {/* Row 4: Last Name */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="soft-label">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  placeholder="Last name"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="soft-input"
                />
              </div>
            </div>

            {/* Section: Company Details */}
            <div className="pt-6 border-t border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900 mb-6">Company Details</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="soft-label">Company *</label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    className="soft-input"
                  />
                </div>

                <div>
                  <label className="soft-label">Designation</label>
                  <input
                    type="text"
                    name="designation"
                    placeholder="e.g. Lead Software Architect"
                    value={formData.designation}
                    onChange={handleChange}
                    className="soft-input"
                  />
                </div>

                <div>
                  <label className="soft-label">Branch</label>
                  <input
                    type="text"
                    name="branch"
                    value={formData.branch}
                    onChange={handleChange}
                    className="soft-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                <div>
                  <label className="soft-label">Department</label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="soft-input"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Operations">Operations</option>
                    <option value="Finance">Finance</option>
                    <option value="Sales">Sales</option>
                  </select>
                </div>

                <div>
                  <label className="soft-label">Reports to</label>
                  <input
                    type="text"
                    name="reportsTo"
                    placeholder="e.g. CTO / Director"
                    value={formData.reportsTo}
                    onChange={handleChange}
                    className="soft-input"
                  />
                </div>

                <div>
                  <label className="soft-label">Grade</label>
                  <input
                    type="text"
                    name="grade"
                    value={formData.grade}
                    onChange={handleChange}
                    className="soft-input"
                  />
                </div>
              </div>

              {/* Employment Type & Shift Details (For Viewer metrics) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                <div>
                  <label className="soft-label">Employment Type</label>
                  <select
                    name="employmentType"
                    value={formData.employmentType}
                    onChange={handleChange}
                    className="soft-input"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Intern">Intern</option>
                  </select>
                </div>

                <div>
                  <label className="soft-label">Work Shift (Day / Night)</label>
                  <select
                    name="shiftType"
                    value={formData.shiftType}
                    onChange={handleChange}
                    className="soft-input"
                  >
                    <option value="Day">Day Shift</option>
                    <option value="Night">Night Shift</option>
                    <option value="General">General Shift</option>
                  </select>
                </div>

                <div>
                  <label className="soft-label">Workforce Category</label>
                  <select
                    name="isStaff"
                    value={formData.isStaff ? 'true' : 'false'}
                    onChange={(e) => setFormData(prev => ({ ...prev, isStaff: e.target.value === 'true' }))}
                    className="soft-input"
                  >
                    <option value="true">Staff (Administrative / Technical)</option>
                    <option value="false">Plant / Shift Worker</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===================== TAB 2: ADDRESS & CONTACTS (Screenshot 1) ===================== */}
        {activeTab === 'Address & Contacts' && (
          <div className="space-y-8 max-w-5xl">
            {/* Top Row: Mobile & Company Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="soft-label">Mobile</label>
                <input
                  type="text"
                  name="mobile"
                  placeholder="+1 555-019-2831"
                  value={formData.mobile}
                  onChange={handleChange}
                  className="soft-input"
                />
              </div>

              <div>
                <label className="soft-label">Company Email</label>
                <input
                  type="email"
                  name="companyEmail"
                  placeholder="name@akoma.com"
                  value={formData.companyEmail}
                  onChange={handleChange}
                  className="soft-input"
                />
                <span className="text-[11px] text-gray-400 mt-1 block">
                  Provide Email Address registered in company
                </span>
              </div>
            </div>

            {/* Row 2: Personal Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="soft-label">Personal Email</label>
                <input
                  type="email"
                  name="personalEmail"
                  placeholder="personal@gmail.com"
                  value={formData.personalEmail}
                  onChange={handleChange}
                  className="soft-input"
                />
              </div>
            </div>

            {/* Section: Address v */}
            <div className="pt-6 border-t border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900 mb-6 flex items-center gap-1">
                Address <span className="text-gray-400 text-xs">⌄</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="soft-label">Current Address</label>
                  <textarea
                    rows={4}
                    name="currentAddress"
                    placeholder="Enter current residential address..."
                    value={formData.currentAddress}
                    onChange={handleChange}
                    className="soft-input resize-y"
                  />
                  <div className="mt-3">
                    <label className="soft-label">Current Address Is</label>
                    <select
                      name="currentAddressIs"
                      value={formData.currentAddressIs}
                      onChange={handleChange}
                      className="soft-input"
                    >
                      <option value="Rented">Rented</option>
                      <option value="Owned">Owned</option>
                      <option value="Parental">Parental</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="soft-label">Permanent Address</label>
                  <textarea
                    rows={4}
                    name="permanentAddress"
                    placeholder="Enter permanent address..."
                    value={formData.permanentAddress}
                    onChange={handleChange}
                    className="soft-input resize-y"
                  />
                  <div className="mt-3">
                    <label className="soft-label">Permanent Address Is</label>
                    <select
                      name="permanentAddressIs"
                      value={formData.permanentAddressIs}
                      onChange={handleChange}
                      className="soft-input"
                    >
                      <option value="Rented">Rented</option>
                      <option value="Owned">Owned</option>
                      <option value="Parental">Parental</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Section: Emergency Contact */}
            <div className="pt-6 border-t border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900 mb-6">Emergency Contact</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="soft-label">Emergency Contact Name</label>
                  <input
                    type="text"
                    name="emergencyContactName"
                    placeholder="Contact full name"
                    value={formData.emergencyContactName}
                    onChange={handleChange}
                    className="soft-input"
                  />
                </div>

                <div>
                  <label className="soft-label">Emergency Phone</label>
                  <input
                    type="text"
                    name="emergencyPhone"
                    placeholder="+1 555-..."
                    value={formData.emergencyPhone}
                    onChange={handleChange}
                    className="soft-input"
                  />
                </div>

                <div>
                  <label className="soft-label">Relation</label>
                  <input
                    type="text"
                    name="emergencyRelation"
                    placeholder="Spouse / Parent / Sibling"
                    value={formData.emergencyRelation}
                    onChange={handleChange}
                    className="soft-input"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===================== TAB 3: ATTENDANCE & LEAVES ===================== */}
        {activeTab === 'Attendance & Leaves' && (
          <div className="space-y-6 max-w-3xl">
            <h3 className="text-sm font-semibold text-gray-900">Leave Balance & Annual Attendance</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="soft-label">Annual Leave Balance (Days)</label>
                <input
                  type="number"
                  name="leaveBalance"
                  value={formData.leaveBalance}
                  onChange={handleChange}
                  className="soft-input"
                />
              </div>

              <div>
                <label className="soft-label">Attendance Percentage (%)</label>
                <input
                  type="number"
                  step="0.1"
                  name="attendancePercentage"
                  value={formData.attendancePercentage}
                  onChange={handleChange}
                  className="soft-input"
                />
              </div>
            </div>
          </div>
        )}

        {/* ===================== TAB 4: SALARY (SENSITIVE) ===================== */}
        {activeTab === 'Salary' && (
          <div className="space-y-6 max-w-4xl">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <label className="soft-label">Basic Salary ($)</label>
                <input
                  type="number"
                  name="basicSalary"
                  placeholder="0.00"
                  value={formData.basicSalary || ''}
                  onChange={handleChange}
                  className="soft-input"
                />
              </div>

              <div>
                <label className="soft-label">Allowances ($)</label>
                <input
                  type="number"
                  name="allowances"
                  placeholder="0.00"
                  value={formData.allowances || ''}
                  onChange={handleChange}
                  className="soft-input"
                />
              </div>

              <div>
                <label className="soft-label">Deductions ($)</label>
                <input
                  type="number"
                  name="deductions"
                  placeholder="0.00"
                  value={formData.deductions || ''}
                  onChange={handleChange}
                  className="soft-input"
                />
              </div>

              <div>
                <label className="soft-label">Net Salary ($)</label>
                <input
                  type="number"
                  readOnly
                  name="netSalary"
                  value={formData.netSalary || ''}
                  className="soft-input bg-gray-200/70 font-semibold"
                />
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Banking & Disbursement</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="soft-label">Bank Name</label>
                  <input
                    type="text"
                    name="bankName"
                    placeholder="e.g. JPMorgan Chase"
                    value={formData.bankName}
                    onChange={handleChange}
                    className="soft-input"
                  />
                </div>

                <div>
                  <label className="soft-label">Account Number</label>
                  <input
                    type="text"
                    name="bankAccountNumber"
                    placeholder="•••• •••• ••••"
                    value={formData.bankAccountNumber}
                    onChange={handleChange}
                    className="soft-input"
                  />
                </div>

                <div>
                  <label className="soft-label">Payment Method</label>
                  <select
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleChange}
                    className="soft-input"
                  >
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===================== TAB 5: PERSONAL DETAILS (SENSITIVE) ===================== */}
        {activeTab === 'Personal Details' && (
          <div className="space-y-6 max-w-4xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="soft-label">Marital Status</label>
                <select
                  name="maritalStatus"
                  value={formData.maritalStatus}
                  onChange={handleChange}
                  className="soft-input"
                >
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Divorced">Divorced</option>
                  <option value="Widowed">Widowed</option>
                </select>
              </div>

              <div>
                <label className="soft-label">Blood Group</label>
                <select
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleChange}
                  className="soft-input"
                >
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>

              <div>
                <label className="soft-label">Nationality</label>
                <input
                  type="text"
                  name="nationality"
                  value={formData.nationality}
                  onChange={handleChange}
                  className="soft-input"
                />
              </div>

              <div>
                <label className="soft-label">National ID / Passport Number</label>
                <input
                  type="text"
                  name="nationalId"
                  placeholder="ID / Passport #"
                  value={formData.nationalId}
                  onChange={handleChange}
                  className="soft-input"
                />
              </div>
            </div>
          </div>
        )}

        {/* ===================== TAB 6: PROFILE ===================== */}
        {activeTab === 'Profile' && (
          <div className="space-y-6 max-w-3xl">
            <div>
              <label className="soft-label">Professional Biography</label>
              <textarea
                rows={5}
                name="bio"
                placeholder="Brief professional background, certifications..."
                value={formData.bio}
                onChange={handleChange}
                className="soft-input resize-y"
              />
            </div>
          </div>
        )}

        {/* ===================== TAB 7: JOINING ===================== */}
        {activeTab === 'Joining' && (
          <div className="space-y-6 max-w-3xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="soft-label">Probation Confirmation Date</label>
                <input
                  type="date"
                  name="confirmationDate"
                  value={formData.confirmationDate}
                  onChange={handleChange}
                  className="soft-input"
                />
              </div>

              <div>
                <label className="soft-label">Contract End Date (If applicable)</label>
                <input
                  type="date"
                  name="contractEndDate"
                  value={formData.contractEndDate}
                  onChange={handleChange}
                  className="soft-input"
                />
              </div>
            </div>
          </div>
        )}

        {/* ===================== TAB 8: EXIT ===================== */}
        {activeTab === 'Exit' && (
          <div className="space-y-6 max-w-3xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="soft-label">Relieving Date</label>
                <input
                  type="date"
                  name="relievingDate"
                  value={formData.relievingDate}
                  onChange={handleChange}
                  className="soft-input"
                />
              </div>

              <div>
                <label className="soft-label">Exit Reason / Notes</label>
                <input
                  type="text"
                  name="exitReason"
                  placeholder="e.g. Relocated, Resigned"
                  value={formData.exitReason}
                  onChange={handleChange}
                  className="soft-input"
                />
              </div>
            </div>
          </div>
        )}

      </form>
    </div>
  );
};

export default EmployeeForm;
