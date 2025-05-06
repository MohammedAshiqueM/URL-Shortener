import { useState, useEffect, useContext } from 'react';
import api from '../api';
import AuthContext from '../AuthContext';

const Profile = () => {
  const { user, logout } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    last_name: '',
    email: '',
  });
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user || !user.user_id) return;
      
      setLoading(true);
      try {
        const response = await api.get(`api/users/${user.user_id}/`);
        setProfile(response.data);
        setFormData({
          username: response.data.username || '',
          last_name: response.data.last_name || '',
          email: response.data.email || '',
        });
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to fetch profile');
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await api.put(`users/${user.user_id}/`, formData);
      setProfile(response.data);
      setSuccessMessage('Profile updated successfully!');
      setEditMode(false);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update profile');
      console.error('Error updating profile:', err);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    const currentPassword = e.target.current_password.value;
    const newPassword = e.target.new_password.value;
    const confirmPassword = e.target.confirm_password.value;

    if (newPassword !== confirmPassword) {
      setError("New passwords don't match");
      return;
    }

    setError(null);
    setSuccessMessage(null);

    try {
      await api.post('users/change_password/', {
        current_password: currentPassword,
        new_password: newPassword,
      });
      setSuccessMessage('Password changed successfully!');
      e.target.reset();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to change password');
      console.error('Error changing password:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">Error</p>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 text-blue-600 hover:text-blue-800"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            {/* Profile Header */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold">
                    {profile?.username || 'User'} {profile?.last_name}
                  </h1>
                  <p className="text-blue-100">{profile?.email}</p>
                </div>
                <div className="flex space-x-2">
                  {!editMode && (
                    <button
                      onClick={() => setEditMode(true)}
                      className="bg-white text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-md font-medium"
                    >
                      Edit Profile
                    </button>
                  )}
                  <button
                    onClick={logout}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md font-medium"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>

            {/* Profile Content */}
            <div className="p-6">
              {successMessage && (
                <div className="mb-4 bg-green-100 border-l-4 border-green-500 p-4 text-green-700">
                  <p>{successMessage}</p>
                </div>
              )}

              {editMode ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                      First Name
                    </label>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="last_name"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setEditMode(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
                    <dl className="mt-2 divide-y divide-gray-200">
                      <div className="py-3 flex justify-between">
                        <dt className="text-sm font-medium text-gray-500">Username</dt>
                        <dd className="text-sm text-gray-900">{profile?.username || 'Not provided'}</dd>
                      </div>
                      <div className="py-3 flex justify-between">
                        <dt className="text-sm font-medium text-gray-500">Email</dt>
                        <dd className="text-sm text-gray-900">{profile?.email}</dd>
                      </div>
                    </dl>
                  </div>
                </div>
              )}

              {/* Change Password Section */}
              <div className="mt-8 border-t border-gray-200 pt-8">
                <h3 className="text-lg font-medium text-gray-900">Change Password</h3>
                <form onSubmit={handlePasswordChange} className="mt-4 space-y-4">
                  <div>
                    <label htmlFor="current_password" className="block text-sm font-medium text-gray-700">
                      Current Password
                    </label>
                    <input
                      type="password"
                      id="current_password"
                      name="current_password"
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="new_password" className="block text-sm font-medium text-gray-700">
                      New Password
                    </label>
                    <input
                      type="password"
                      id="new_password"
                      name="new_password"
                      required
                      minLength="8"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      id="confirm_password"
                      name="confirm_password"
                      required
                      minLength="8"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      type="submit"
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Change Password
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;