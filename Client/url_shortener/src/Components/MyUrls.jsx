import { useState, useEffect, useContext } from 'react';
import api from '../api';
import AuthContext from '../AuthContext';
import { baseURL } from '../constants';

const MyUrls = () => {
  const { user } = useContext(AuthContext);
  const [shortenedUrls, setShortenedUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [editUrlId, setEditUrlId] = useState(null);
  const [editUrl, setEditUrl] = useState('');
  const [urlError, setUrlError] = useState('');

  useEffect(() => {
    const fetchUserUrls = async () => {
      if (!user || !user.user_id) return;
      
      setLoading(true);
      try {
        // Fetch only the current user's URLs
        const response = await api.get(`api/users/${user.user_id}/shortened_url/`);
        setShortenedUrls(response.data);
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to fetch your URLs');
        console.error('Error fetching user URLs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserUrls();
  }, [user]);

  const handleCreateUrl = async (e) => {
    e.preventDefault();
    setUrlError('');
    
    if (!newUrl) {
      setUrlError('URL is required');
      return;
    }
    
    try {
      const response = await api.post('api/urls/', { 
        orginal_url: newUrl
      });
      
      // Add the new URL to the state
      setShortenedUrls([response.data, ...shortenedUrls]);
      
      // Clear form and close modal
      setNewUrl('');
      setShowCreateModal(false);
    } catch (err) {
      setUrlError(err.response?.data?.detail || 'Failed to create shortened URL');
      console.error('Error creating URL:', err);
    }
  };

  const handleEditUrl = async (e) => {
    e.preventDefault();
    setUrlError('');
    
    if (!editUrl) {
      setUrlError('URL is required');
      return;
    }
    
    try {
      const response = await api.put(`api/urls/${editUrlId}/`, { 
        orginal_url: editUrl
      });
      
      // Update the URL in the state
      setShortenedUrls(shortenedUrls.map(url => 
        url.id === editUrlId ? response.data : url
      ));
      
      // Clear form and close modal
      setEditUrl('');
      setEditUrlId(null);
      setShowEditModal(false);
    } catch (err) {
      setUrlError(err.response?.data?.detail || 'Failed to update shortened URL');
      console.error('Error updating URL:', err);
    }
  };

  const handleOpenEditModal = (url) => {
    setEditUrlId(url.id);
    setEditUrl(url.orginal_url);
    setShowEditModal(true);
  };

  const handleDeleteUrl = async (urlId) => {
    if (window.confirm('Are you sure you want to delete this URL?')) {
      try {
        await api.delete(`api/urls/${urlId}/`);
        
        // Remove the deleted URL from state
        setShortenedUrls(shortenedUrls.filter(url => url.id !== urlId));
      } catch (err) {
        console.error('Error deleting URL:', err);
        alert(err.response?.data?.detail || 'Failed to delete URL');
      }
    }
  };
  
  const handleVisitUrl = async (urlId) => {
    try {
      const response = await api.get(`api/urls/${urlId}/visit/`);
      window.open(response.data.redirect_to, '_blank');
    } catch (err) {
      console.error('Error visiting URL:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading your URLs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p className="font-bold">Error</p>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">My Shortened URLs</h2>
        <button 
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center"
          onClick={() => setShowCreateModal(true)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Create New URL
        </button>
      </div>
      
      {shortenedUrls.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-gray-500 mb-4">You haven't created any shortened URLs yet.</p>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Create your first shortened URL
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Original URL</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Short URL</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">QR Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visits</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created On</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {shortenedUrls.map((url) => (
                <tr key={url.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap truncate max-w-xs">
                    <a href={url.orginal_url} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">
                      {url.orginal_url}
                    </a>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <button
                        onClick={() => handleVisitUrl(url.id)}
                        className="text-blue-500 hover:underline text-left"
                      >
                        {url.short_code}
                      </button>
                      <button
                        onClick={() => {navigator.clipboard.writeText(window.location.origin + '/u/' + url.short_code)}}
                        className="text-xs text-gray-500 hover:text-gray-700 mt-1"
                      >
                        Copy to clipboard
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => window.open(`${baseURL}${url.qr_code}`, '_blank')}
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
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <button 
                        className="text-indigo-600 hover:text-indigo-900 cursor-pointer"
                        onClick={() => handleOpenEditModal(url)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                      <button 
                        className="text-red-600 hover:text-red-900 cursor-pointer" 
                        onClick={() => handleDeleteUrl(url.id)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Create URL Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Create Shortened URL</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-500 hover:text-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleCreateUrl}>
              <div className="mb-4">
                <label htmlFor="orginal_url" className="block text-sm font-medium text-gray-700 mb-1">
                  URL to Shorten:
                </label>
                <input
                  type="url"
                  id="orginal_url"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                {urlError && <p className="mt-1 text-sm text-red-600">{urlError}</p>}
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Edit URL Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Edit Shortened URL</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-500 hover:text-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleEditUrl}>
              <div className="mb-4">
                <label htmlFor="edit_orginal_url" className="block text-sm font-medium text-gray-700 mb-1">
                  URL to Update:
                </label>
                <input
                  type="url"
                  id="edit_orginal_url"
                  value={editUrl}
                  onChange={(e) => setEditUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                {urlError && <p className="mt-1 text-sm text-red-600">{urlError}</p>}
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyUrls;