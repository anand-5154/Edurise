import React, { useState, useEffect } from 'react';
import { User, Camera, Save, Edit, X } from 'lucide-react';
import apiService from '../../services/apiService';
import { toast } from 'react-toastify';

interface InstructorData {
  _id: string;
  name: string;
  username: string;
  email: string;
  phone: string;
  profilePicture?: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  googleId?: string;
  education?: string[];
  yearsOfExperience?: string[];
}

const InstructorProfile: React.FC = () => {
  const [instructorData, setInstructorData] = useState<InstructorData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [editedData, setEditedData] = useState<Partial<InstructorData>>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    fetchInstructorProfile();
  }, []);

  const fetchInstructorProfile = async () => {
    try {
      const response = await apiService.get('/instructors/profile');
      setInstructorData(response.data);
      setEditedData(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching instructor profile:', error);
      toast.error('Failed to load profile data');
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size should be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const uploadProfilePicture = async () => {
    if (!selectedFile) return null;
    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('profilePicture', selectedFile);
      const response = await apiService.post('/instructors/upload-profile-picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.profilePicture;
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      toast.error('Failed to upload profile picture');
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      let profilePictureUrl = editedData.profilePicture;
      if (selectedFile) {
        const uploadedUrl = await uploadProfilePicture();
        if (uploadedUrl) {
          profilePictureUrl = uploadedUrl;
        } else {
          return;
        }
      }
      const updateData = {
        ...editedData,
        profilePicture: profilePictureUrl,
        education: editedData.education,
        yearsOfExperience: editedData.yearsOfExperience,
      };
      console.log('Saving profile with data:', updateData);
      const response = await apiService.put('/instructors/profile', updateData);
      setInstructorData(response.data);
      setEditedData(response.data);
      setIsEditing(false);
      setSelectedFile(null);
      setPreviewUrl(null);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedData(instructorData || {});
    setIsEditing(false);
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (!currentPassword || !newPassword) {
      toast.error('Please fill all password fields');
      return;
    }
    setIsChangingPassword(true);
    try {
      await apiService.put('/instructors/change-password', {
        currentPassword,
        newPassword,
      });
      toast.success('Password changed successfully!');
      setShowChangePassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Add helper functions for handling array fields
  const handleArrayInputChange = (field: 'education' | 'yearsOfExperience', idx: number, value: string) => {
    setEditedData(prev => ({
      ...prev,
      [field]: prev[field]?.map((item, i) => (i === idx ? value : item)) || [],
    }));
  };
  const handleAddArrayField = (field: 'education' | 'yearsOfExperience') => {
    setEditedData(prev => ({
      ...prev,
      [field]: [...(prev[field] || []), ''],
    }));
  };
  const handleRemoveArrayField = (field: 'education' | 'yearsOfExperience', idx: number) => {
    setEditedData(prev => ({
      ...prev,
      [field]: prev[field]?.filter((_, i) => i !== idx) || [],
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!instructorData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Profile Not Found</h2>
          <p className="text-gray-600">Unable to load instructor profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Instructor Profile</h1>
          <p className="text-gray-600 mt-2">Manage your instructor account information and settings</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-8 border-b border-gray-200">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Profile preview" className="w-full h-full object-cover" />
                  ) : instructorData.profilePicture ? (
                    <img src={instructorData.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-12 h-12 text-gray-400" />
                  )}
                </div>
                <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
                  <Camera className="w-4 h-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900">
                  {isEditing ? editedData.name : instructorData.name}
                </h2>
                <p className="text-gray-600">{instructorData.email}</p>
                <p className="text-sm text-gray-500 capitalize">{instructorData.role}</p>
              </div>
              <div className="flex space-x-3">
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit Profile</span>
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleSave}
                      disabled={isSaving || isUploading}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      {isSaving ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      <span>Cancel</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="p-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={editedData.name || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                ) : (
                  <p className="text-gray-900">{instructorData.name}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="username"
                    value={editedData.username || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter username"
                  />
                ) : (
                  <p className="text-gray-900">{instructorData.username || 'Not set'}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <p className="text-gray-900">{instructorData.email}</p>
                <p className="text-sm text-gray-500">Email cannot be changed</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={editedData.phone || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter phone number"
                  />
                ) : (
                  <p className="text-gray-900">{instructorData.phone || 'Not provided'}</p>
                )}
              </div>
              {/* Education Field */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Education</label>
                {isEditing ? (
                  <div>
                    {(editedData.education || ['']).map((edu, idx) => (
                      <div key={idx} className="flex items-center mb-2">
                        <input
                          type="text"
                          value={edu}
                          onChange={e => handleArrayInputChange('education', idx, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder={`Education #${idx + 1}`}
                        />
                        <button type="button" onClick={() => handleRemoveArrayField('education', idx)} className="ml-2 text-red-600">Remove</button>
                      </div>
                    ))}
                    <button type="button" onClick={() => handleAddArrayField('education')} className="mt-2 px-3 py-1 bg-blue-100 text-blue-700 rounded">Add Education</button>
                  </div>
                ) : (
                  <ul className="list-disc ml-5">
                    {(instructorData.education || []).length > 0 ? instructorData.education.map((edu, idx) => (
                      <li key={idx} className="text-gray-900">{edu}</li>
                    )) : <li className="text-gray-500">Not provided</li>}
                  </ul>
                )}
              </div>
              {/* Years of Experience Field */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience</label>
                {isEditing ? (
                  <div>
                    {(editedData.yearsOfExperience || ['']).map((exp, idx) => (
                      <div key={idx} className="flex items-center mb-2">
                  <input
                    type="text"
                          value={exp}
                          onChange={e => handleArrayInputChange('yearsOfExperience', idx, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder={`Experience #${idx + 1}`}
                        />
                        <button type="button" onClick={() => handleRemoveArrayField('yearsOfExperience', idx)} className="ml-2 text-red-600">Remove</button>
                      </div>
                    ))}
                    <button type="button" onClick={() => handleAddArrayField('yearsOfExperience')} className="mt-2 px-3 py-1 bg-blue-100 text-blue-700 rounded">Add Experience</button>
                  </div>
                ) : (
                  <ul className="list-disc ml-5">
                    {(instructorData.yearsOfExperience || []).length > 0 ? instructorData.yearsOfExperience.map((exp, idx) => (
                      <li key={idx} className="text-gray-900">{exp}</li>
                    )) : <li className="text-gray-500">Not provided</li>}
                  </ul>
                )}
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Account Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Account Type</label>
                  <p className="text-gray-900 capitalize">{instructorData.role}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Member Since</label>
                  <p className="text-gray-900">{new Date(instructorData.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Change Password Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mt-8 p-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h3>
          {instructorData.googleId && (
            <div className="mb-4 text-blue-700 bg-blue-50 border border-blue-200 rounded p-3 text-sm">
              Setting a password will allow you to log in with email and password in addition to Google.
            </div>
          )}
          {!showChangePassword ? (
            <button
              onClick={() => setShowChangePassword(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Change Password
            </button>
          ) : (
            <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {isChangingPassword ? 'Changing...' : 'Change Password'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowChangePassword(false);
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                  }}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default InstructorProfile; 