import { useState, useEffect } from 'react';
import api from '../api';
import { baseURL } from '../constants';

const ExploreUrls = () => {
  const [publicUrls, setPublicUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');

  useEffect(() => {
    const fetchPublicUrls = async () => {
      setLoading(true);
      try {
        // Use a public endpoint to fetch all URLs
        const response = await api.get('api/users/public_urls/');
        setPublicUrls(response.data);
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to fetch public URLs');
        console.error('Error fetching public URLs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPublicUrls();
  }, []);

  const handleVisitUrl = async (url) => {
    try {
        const redirectUrl = `${baseURL}api/${url.short_code}/`; // No 'api/' here
        window.open(redirectUrl, '_blank');
        // Update the visit count in the UI
        setPublicUrls(prevUrls =>
        prevUrls.map(u =>
            u.id === url.id ? { ...u, visit_count: (u.visit_count || 0) + 1 } : u
        )
      );
    } catch (err) {
      console.error('Error visiting URL:', err);
    }
  };
  

  // Sort URLs based on current sort settings
  const sortedUrls = [...publicUrls].sort((a, b) => {
    if (sortBy === 'visit_count') {
      return sortDirection === 'asc' 
        ? (a.visit_count || 0) - (b.visit_count || 0) 
        : (b.visit_count || 0) - (a.visit_count || 0);
    } else if (sortBy === 'created_at') {
      return sortDirection === 'asc' 
        ? new Date(a.created_at) - new Date(b.created_at)
        : new Date(b.created_at) - new Date(a.created_at);
    }
    return 0;
  });

  // Filter URLs based on search term
  const filteredUrls = sortedUrls.filter(url => 
    url.orginal_url.toLowerCase().includes(searchTerm.toLowerCase()) ||
    url.short_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Toggle sort direction
  const handleSortChange = (field) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('desc');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading public URLs...</p>
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
      <h2 className="text-xl font-semibold mb-4">Explore Public URLs</h2>
      
      {/* Search and filters */}
      <div className="mb-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search URLs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-80 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="absolute right-3 top-2.5 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Sort by:</span>
            <button 
              className={`px-3 py-1 text-sm rounded-md ${sortBy === 'visit_count' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}
              onClick={() => handleSortChange('visit_count')}
            >
              Popularity {sortBy === 'visit_count' && (sortDirection === 'asc' ? '↑' : '↓')}
            </button>
            <button 
              className={`px-3 py-1 text-sm rounded-md ${sortBy === 'created_at' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}
              onClick={() => handleSortChange('created_at')}
            >
              Date {sortBy === 'created_at' && (sortDirection === 'asc' ? '↑' : '↓')}
            </button>
          </div>
        </div>
      </div>
      
      {filteredUrls.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-gray-500">No public URLs found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Original URL</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Short URL</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">QR Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center cursor-pointer" onClick={() => handleSortChange('visit_count')}>
                    Visits
                    {sortBy === 'visit_count' && (
                      <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center cursor-pointer" onClick={() => handleSortChange('created_at')}>
                    Created On
                    {sortBy === 'created_at' && (
                      <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUrls.map((url) => (
                <tr key={url.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap truncate max-w-xs">
                    <a href={url.orginal_url} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">
                      {url.orginal_url}
                    </a>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <button
                        onClick={() => handleVisitUrl(url)}
                        className="text-blue-500 hover:underline text-left"
                      >
                        {url.short_code}
                      </button>
                      <button
                        onClick={() => {navigator.clipboard.writeText(baseURL + 'api/' + url.short_code)}}
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ExploreUrls;