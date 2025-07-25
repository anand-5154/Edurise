import React, { useState, useEffect } from 'react';
import apiService from '../../services/apiService';
import axiosInstance from '../../services/apiService';
import { toast } from 'react-toastify';
import { errorToast, successToast } from '../../components/Toast';

const InstructorSettings: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [errors, setErrors] = useState<{ currentPassword?: string; newPassword?: string; confirmPassword?: string; backend?: string }>({});

  // Bank info state
  const [bankInfo, setBankInfo] = useState({
    accountHolderName: '',
    accountNumber: '',
    ifsc: '',
    bankName: '',
    upiId: '',
  });
  const [bankInfoLoading, setBankInfoLoading] = useState(false);
  const [bankInfoEdit, setBankInfoEdit] = useState(false);

  const validatePassword = (password: string) => {
    // At least 8 chars, one uppercase, one lowercase, one digit, one special char
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/.test(password);
  };

  useEffect(() => {
    // Fetch bank info
    setBankInfoLoading(true);
    axiosInstance.get('/instructors/bank-info')
      .then(res => {
        if (res.data) {
          setBankInfo({
            accountHolderName: res.data.accountHolderName || '',
            accountNumber: res.data.accountNumber || '',
            ifsc: res.data.ifsc || '',
            bankName: res.data.bankName || '',
            upiId: res.data.upiId || '',
          });
        }
      })
      .catch(() => setBankInfo({ accountHolderName: '', accountNumber: '', ifsc: '', bankName: '', upiId: '' }))
      .finally(() => setBankInfoLoading(false));
  }, []);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    let newErrors: typeof errors = {};
    if (!currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }
    if (!newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (!validatePassword(newPassword)) {
      newErrors.newPassword = 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character.';
    }
    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'New passwords do not match';
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    setIsChangingPassword(true);
    try {
      await apiService.put('/instructors/change-password', {
        currentPassword,
        newPassword,
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setErrors({});
    } catch (error: any) {
      const backendMsg = error?.response?.data?.message || 'Failed to change password';
      // Try to map backend error to a field
      if (backendMsg.toLowerCase().includes('current password')) {
        setErrors({ currentPassword: backendMsg });
      } else if (backendMsg.toLowerCase().includes('password must')) {
        setErrors({ newPassword: backendMsg });
      } else {
        setErrors({ backend: backendMsg });
      }
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleBankInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBankInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleBankInfoSave = async () => {
    setBankInfoLoading(true);
    try {
      await axiosInstance.put('/instructors/bank-info', bankInfo);
      successToast('Bank information saved!');
      setBankInfoEdit(false);
    } catch (err) {
      errorToast('Failed to save bank information');
    } finally {
      setBankInfoLoading(false);
    }
  };

  const handleBankInfoDelete = async () => {
    setBankInfoLoading(true);
    try {
      await axiosInstance.delete('/instructors/bank-info');
      setBankInfo({ accountHolderName: '', accountNumber: '', ifsc: '', bankName: '', upiId: '' });
      successToast('Bank information deleted!');
      setBankInfoEdit(false);
    } catch (err) {
      errorToast('Failed to delete bank information');
    } finally {
      setBankInfoLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">Manage your instructor account settings</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h2 className="text-xl font-semibold mb-4">Change Password</h2>
          <form onSubmit={handleChangePassword} className="space-y-6">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">Current Password</label>
              <input
                id="currentPassword"
                name="currentPassword"
                type="password"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              {errors.currentPassword && <p className="text-red-500 text-xs mt-1">{errors.currentPassword}</p>}
            </div>
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">New Password</label>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              {errors.newPassword && <p className="text-red-500 text-xs mt-1">{errors.newPassword}</p>}
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm New Password</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
            </div>
            {errors.backend && <p className="text-red-500 text-xs mt-2">{errors.backend}</p>}
            <div>
              <button
                type="submit"
                className="w-full px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                disabled={isChangingPassword}
              >
                {isChangingPassword ? 'Changing...' : 'Change Password'}
              </button>
            </div>
          </form>
        </div>
        <div className="mt-10 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-purple-700">Manage Bank / Payment Information</h2>
          {bankInfoLoading ? (
            <div>Loading...</div>
          ) : (
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Account Holder Name</label>
                <input
                  type="text"
                  name="accountHolderName"
                  value={bankInfo.accountHolderName}
                  onChange={handleBankInfoChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  disabled={!bankInfoEdit}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Account Number</label>
                <input
                  type="text"
                  name="accountNumber"
                  value={bankInfo.accountNumber}
                  onChange={handleBankInfoChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  disabled={!bankInfoEdit}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">IFSC Code</label>
                <input
                  type="text"
                  name="ifsc"
                  value={bankInfo.ifsc}
                  onChange={handleBankInfoChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  disabled={!bankInfoEdit}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Bank Name</label>
                <input
                  type="text"
                  name="bankName"
                  value={bankInfo.bankName}
                  onChange={handleBankInfoChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  disabled={!bankInfoEdit}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">UPI ID (optional)</label>
                <input
                  type="text"
                  name="upiId"
                  value={bankInfo.upiId}
                  onChange={handleBankInfoChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  disabled={!bankInfoEdit}
                />
              </div>
              <div className="flex gap-4 mt-4">
                {bankInfoEdit ? (
                  <>
                    <button
                      type="button"
                      className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                      onClick={handleBankInfoSave}
                      disabled={bankInfoLoading}
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                      onClick={() => setBankInfoEdit(false)}
                      disabled={bankInfoLoading}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 ml-auto"
                      onClick={handleBankInfoDelete}
                      disabled={bankInfoLoading}
                    >
                      Delete
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                    onClick={() => setBankInfoEdit(true)}
                  >
                    Edit
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default InstructorSettings; 