import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  Check, 
  ArrowLeft, 
  User, 
  Building2, 
  Clock, 
  MapPin, 
  PhoneCall, 
  ShieldCheck, 
  DollarSign, 
  Calendar,
  AlertCircle
} from 'lucide-react';

const EmployeeForm = () => {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const { isViewer } = useAuth();

  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState('');

  // Exactly 21 HR standard fields
  const [formData, setFormData] = useState({
    employeeNo: '',
    division: '',
    designation: '',
    basedShift: 'Day',
    joiningDate: new Date().toISOString().split('T')[0],
    resignedDate: '',
    fullName: '',
    callingName: '',
    permanentAddress: '',
    residentAddress: '',
    birthDate: '',
    nicNumber: '',
    gender: 'Male',
    civilStatus: 'Single',
    email: '',
    contactNumber: '',
    emergencyContact: '',
    relationship: '',
    shiftTimings: '08:30 AM - 05:30 PM',
    salary: '',
    employmentStatus: 'Probation',
    status: 'Active'
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
          const data = res.data;
          setFormData({
            employeeNo: data.employeeNo || data.employeeId || '',
            division: data.division || data.department || '',
            designation: data.designation || '',
            basedShift: data.basedShift || data.shiftType || 'Day',
            joiningDate: data.joiningDate || data.dateOfJoining || '',
            resignedDate: data.resignedDate || data.relievingDate || '',
            fullName: data.fullName || `${data.firstName || ''} ${data.lastName || ''}`.trim(),
            callingName: data.callingName || data.firstName || '',
            permanentAddress: data.permanentAddress || '',
            residentAddress: data.residentAddress || data.currentAddress || '',
            birthDate: data.birthDate || data.dateOfBirth || '',
            nicNumber: data.nicNumber || data.nationalId || '',
            gender: data.gender || 'Male',
            civilStatus: data.civilStatus || data.maritalStatus || 'Single',
            email: data.email || data.companyEmail || '',
            contactNumber: data.contactNumber || data.mobile || '',
            emergencyContact: data.emergencyContact || data.emergencyPhone || '',
            relationship: data.relationship || data.emergencyRelation || '',
            shiftTimings: data.shiftTimings || '08:30 AM - 05:30 PM',
            salary: (data.salary !== undefined && data.salary !== null) ? data.salary : (data.basicSalary ?? ''),
            employmentStatus: data.employmentStatus || 'Probation',
            status: data.status || 'Active'
          });
        } catch (err) {
          setError(err.response?.data?.message || 'Failed to load employee details.');
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
            setFormData(prev => ({ ...prev, employeeNo: res.data.nextId }));
          }
        } catch (err) {
          console.error(err);
        }
      };
      fetchNextId();
    }
  }, [id, isEditing, isViewer, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.employeeNo.trim()) {
      setError('Employee No is mandatory.');
      setLoading(false);
      return;
    }

    if (!formData.fullName.trim()) {
      setError('Employee Full Name is mandatory.');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        ...formData,
        employeeId: formData.employeeNo
      };

      if (isEditing) {
        await api.put(`/employees/${id}`, payload);
      } else {
        await api.post('/employees', payload);
      }

      setSaveSuccess(true);
      setTimeout(() => {
        navigate('/employees');
      }, 1000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to save employee profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/employees')}
            className="p-2 border border-gray-200 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer text-gray-600"
            title="Back to list"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditing ? `Edit Employee ${formData.employeeNo}` : 'New Employee Entry'}
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Enter HR standard master profile across all 21 verified attributes
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/employees')}
            className="px-4 py-2 border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="hr-employee-form"
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl text-sm font-medium shadow-xs transition-all cursor-pointer disabled:opacity-50"
          >
            {saveSuccess ? (
              <>
                <Check size={16} />
                <span>Saved Successfully!</span>
              </>
            ) : (
              <span>{isEditing ? 'Update Record' : 'Save Employee'}</span>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-700 text-sm">
          <AlertCircle size={18} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main 21 Fields Form Layout */}
      <form id="hr-employee-form" onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Employment & Organization (6 fields) */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <Building2 className="text-blue-600" size={18} />
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
              1. Organization & Shift Details
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Field 1: Employee No */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Employee No <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="employeeNo"
                value={formData.employeeNo}
                onChange={handleChange}
                required
                placeholder="e.g. EMP-001"
                className="soft-input font-mono font-medium"
              />
            </div>

            {/* Field 2: Division */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Division
              </label>
              <input
                type="text"
                name="division"
                value={formData.division}
                onChange={handleChange}
                placeholder="e.g. Information Technology"
                className="soft-input"
              />
            </div>

            {/* Field 3: Designation */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Designation
              </label>
              <input
                type="text"
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                placeholder="e.g. Senior Software Engineer"
                className="soft-input"
              />
            </div>

            {/* Field 4: Based Shift */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Based Shift
              </label>
              <select
                name="basedShift"
                value={formData.basedShift}
                onChange={handleChange}
                className="soft-input cursor-pointer"
              >
                <option value="Day">Day Shift</option>
                <option value="Night">Night Shift</option>
                <option value="General">General Shift</option>
              </select>
            </div>

            {/* Field 19: Shift Timings */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Shift Timings
              </label>
              <input
                type="text"
                name="shiftTimings"
                value={formData.shiftTimings}
                onChange={handleChange}
                placeholder="e.g. 08:30 AM - 05:30 PM"
                className="soft-input"
              />
            </div>

            {/* Field 21: Permanent / Probation */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Permanent / Probation
              </label>
              <select
                name="employmentStatus"
                value={formData.employmentStatus}
                onChange={handleChange}
                className="soft-input cursor-pointer"
              >
                <option value="Permanent">Permanent</option>
                <option value="Probation">Probation</option>
              </select>
            </div>

            {/* Field 5: Joining date */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Joining Date
              </label>
              <input
                type="date"
                name="joiningDate"
                value={formData.joiningDate}
                onChange={handleChange}
                className="soft-input"
              />
            </div>

            {/* Field 6: Resigned date */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Resigned Date (If Applicable)
              </label>
              <input
                type="date"
                name="resignedDate"
                value={formData.resignedDate}
                onChange={handleChange}
                className="soft-input"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Record Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="soft-input cursor-pointer"
              >
                <option value="Active">Active</option>
                <option value="Resigned">Resigned</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Personal Identity Details (6 fields) */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <User className="text-emerald-600" size={18} />
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
              2. Personal Identity & Bio
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Field 7: Employee Full Name */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Employee Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                placeholder="e.g. Alexander James Sterling"
                className="soft-input font-medium"
              />
            </div>

            {/* Field 8: Calling name */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Calling Name
              </label>
              <input
                type="text"
                name="callingName"
                value={formData.callingName}
                onChange={handleChange}
                placeholder="e.g. Alex"
                className="soft-input"
              />
            </div>

            {/* Field 12: NIC Number */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                NIC Number (Confidential)
              </label>
              <input
                type="text"
                name="nicNumber"
                value={formData.nicNumber}
                onChange={handleChange}
                placeholder="e.g. 199012345678"
                className="soft-input font-mono"
              />
            </div>

            {/* Field 11: Birthdate */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Birthdate
              </label>
              <input
                type="date"
                name="birthDate"
                value={formData.birthDate}
                onChange={handleChange}
                className="soft-input"
              />
            </div>

            {/* Field 13: Gender */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Gender
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="soft-input cursor-pointer"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Field 14: Civil Status */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Civil Status
              </label>
              <select
                name="civilStatus"
                value={formData.civilStatus}
                onChange={handleChange}
                className="soft-input cursor-pointer"
              >
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="Divorced">Divorced</option>
                <option value="Widowed">Widowed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: Contact Details & Addresses (4 fields) */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <MapPin className="text-indigo-600" size={18} />
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
              3. Contact & Address Records
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Field 15: Email */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="e.g. employee@company.com"
                className="soft-input"
              />
            </div>

            {/* Field 16: Contact number */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Contact Number
              </label>
              <input
                type="tel"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleChange}
                placeholder="e.g. +94 77 123 4567"
                className="soft-input"
              />
            </div>

            {/* Field 10: Resident Address */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Resident Address (Current)
              </label>
              <textarea
                name="residentAddress"
                rows={2}
                value={formData.residentAddress}
                onChange={handleChange}
                placeholder="e.g. Apt 4B, Colombo 03"
                className="soft-input resize-none"
              />
            </div>

            {/* Field 9: Permanent Address */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Permanent Address (Hometown)
              </label>
              <textarea
                name="permanentAddress"
                rows={2}
                value={formData.permanentAddress}
                onChange={handleChange}
                placeholder="e.g. No. 12, Main Street, Kandy"
                className="soft-input resize-none"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Emergency Contacts & Confidential Salary (3 fields) */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <ShieldCheck className="text-amber-600" size={18} />
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
              4. Emergency Contact & Confidential Compensation
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Field 17: Emergency contact */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Emergency Contact Number
              </label>
              <input
                type="tel"
                name="emergencyContact"
                value={formData.emergencyContact}
                onChange={handleChange}
                placeholder="e.g. +94 71 987 6543"
                className="soft-input"
              />
            </div>

            {/* Field 18: Relationship */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Relationship
              </label>
              <input
                type="text"
                name="relationship"
                value={formData.relationship}
                onChange={handleChange}
                placeholder="e.g. Spouse, Father, Mother"
                className="soft-input"
              />
            </div>

            {/* Field 20: Salary */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center justify-between">
                <span>Monthly Salary</span>
                <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full font-medium">
                  Confidential
                </span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="salary"
                  value={formData.salary}
                  onChange={handleChange}
                  placeholder="e.g. 150000"
                  className="soft-input pl-8 font-mono"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-medium">
                  $
                </span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EmployeeForm;
