import { useState, useEffect, useContext } from 'react';
import api from '../api';
import AuthContext from '../AuthContext';

const AdminHomePage = () => {
  const { user, logout } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userUrls, setUserUrls] = useState([]);
  const [showUserDetail, setShowUserDetail] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [actionUser, setActionUser] = useState(null);
  const [actionType, setActionType] = useState('');
  
  useEffect(() => {
    const fetchUsers = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        const response = await api.get('api/users/');
        setUsers(response.data);
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to fetch users');
        console.error('Error fetching users:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [user]);
  
  const handleViewUser = async (userId) => {
    try {
      setShowUserDetail(true);
      
      const userResponse = await api.get(`api/users/${userId}/`);
      setSelectedUser(userResponse.data);
      
      const urlsResponse = await api.get(`api/users/${userId}/shortened_url/`);
      setUserUrls(urlsResponse.data);
    } catch (err) {
      console.error('Error fetching user details:', err);
      alert(err.response?.data?.detail || 'Failed to fetch user details');
    }
  };

  const handleBlockUser = (user) => {
    setActionUser(user);
    setActionType(user.is_active ? 'block' : 'unblock');
    setShowConfirmModal(true);
  };

  const confirmUserAction = async () => {
    try {
      await api.post(`api/users/${actionUser.id}/block_user/`);
      
      // Update the user list
      setUsers(users.map(u => 
        u.id === actionUser.id ? { ...u, is_active: actionType !== 'block' } : u
      ));
      
      // Update selected user if currently viewing
      if (selectedUser && selectedUser.id === actionUser.id) {
        setSelectedUser({ ...selectedUser, is_active: actionType !== 'block' });
      }
      
      setShowConfirmModal(false);
      alert(`User ${actionType === 'block' ? 'blocked' : 'unblocked'} successfully`);
    } catch (err) {
      console.error(`Error ${actionType}ing user:`, err);
      alert(err.response?.data?.detail || `Failed to ${actionType} user`);
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/home';
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading data...</p>
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
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header/Nav */}
      <nav className="bg-indigo-600 shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
          <button 
            onClick={handleLogout}
            className="bg-white text-indigo-600 hover:bg-gray-100 px-4 py-2 rounded"
          >
            Logout
          </button>
        </div>
      </nav>
      
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">User Management</h2>
          <p className="text-gray-600 mb-4">Total Users: {users.length}</p>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Full Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shortened Links</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {`${user.username || ''} ${user.last_name || ''}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user.is_active ? 'Active' : 'Blocked'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.total_shortened_links || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap space-x-2">
                      <button 
                        className="text-indigo-600 hover:text-indigo-900"
                        onClick={() => handleViewUser(user.id)}
                      >
                        View
                      </button>
                      {user.role === 'regular' && (<button 
                        className={`${
                          user.is_active ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'
                        }`}
                        onClick={() => handleBlockUser(user)}
                      >
                        {user.is_active ? 'Block' : 'Unblock'}
                      </button>)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* User Detail Modal */}
      {showUserDetail && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">User Details</h3>
              <button onClick={() => setShowUserDetail(false)} className="text-gray-500 hover:text-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">User Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-600 text-sm">Full Name:</p>
                      <p>{`${selectedUser.username || ''} ${selectedUser.last_name || ''}`}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Email:</p>
                      <p>{selectedUser.email}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Status:</p>
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        selectedUser.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedUser.is_active ? 'Active' : 'Blocked'}
                      </span>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Shortened URLs:</p>
                      <p>{userUrls.length}</p>
                    </div>
                  </div>
                </div>
                <button 
                  className={`px-4 py-2 rounded-md ${
                    selectedUser.is_active 
                      ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                  onClick={() => handleBlockUser(selectedUser)}
                >
                  {selectedUser.is_active ? 'Block User' : 'Unblock User'}
                </button>
              </div>
            </div>
            
            <h4 className="font-medium text-gray-800 mb-2">Shortened URLs</h4>
            {userUrls.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Original URL</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Short URL</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">QR Code</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visit Count</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {userUrls.map((url) => (
                      <tr key={url.id}>
                        <td className="px-6 py-4 whitespace-nowrap truncate max-w-xs">
                          <a href={url.orginal_url} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">
                            {url.orginal_url}
                          </a>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <a href={url.short_code} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">
                            {url.short_code}
                          </a>
                          <button
                            onClick={() => {navigator.clipboard.writeText(url.short_code)}}
                            className="ml-2 text-xs text-gray-500 hover:text-gray-700"
                          >
                            Copy
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => window.open(`${url.qr_code}`, '_blank')}
                            className="text-green-600 hover:text-green-800"
                          >
                            View QR
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {url.visit_count || 0}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {new Date(url.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No shortened URLs found for this user.</p>
            )}
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && actionUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {actionType === 'block' ? 'Block User' : 'Unblock User'}
              </h3>
              <button onClick={() => setShowConfirmModal(false)} className="text-gray-500 hover:text-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <p className="mb-4">
              Are you sure you want to {actionType} {actionUser.username || actionUser.email}?
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmUserAction}
                className={`px-4 py-2 rounded-md text-white ${
                  actionType === 'block' 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {actionType === 'block' ? 'Block' : 'Unblock'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminHomePage;