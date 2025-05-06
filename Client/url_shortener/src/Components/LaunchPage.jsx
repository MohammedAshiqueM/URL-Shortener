import { Link } from 'react-router-dom';

const LaunchPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header/Nav */}
      <nav className="bg-white shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">URL Shortener</h1>
          <div className="flex items-center space-x-4">
            <Link 
              to="/login"
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              Login
            </Link>
            <Link 
              to="/register"
              className="border border-blue-500 text-blue-500 hover:bg-blue-50 px-4 py-2 rounded"
            >
              Register
            </Link>
          </div>
        </div>
      </nav>
      
      <div className="container mx-auto px-4 py-8">
        {/* Hero section */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg text-white p-8 mb-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Shorten, Share, and Track Your Links</h2>
            <p className="text-xl mb-6">Create short URLs, QR codes, and monitor your link performance</p>
            <div className="flex justify-center space-x-4">
              <Link 
                to="/register" 
                className="bg-white text-blue-600 hover:bg-gray-100 px-6 py-3 rounded-lg font-medium"
              >
                Get Started for Free
              </Link>
              <Link 
                to="/login" 
                className="border border-white text-white hover:bg-blue-700 px-6 py-3 rounded-lg font-medium"
              >
                Login
              </Link>
            </div>
          </div>
        </div>

        {/* Features section */}
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-blue-500 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">URL Shortening</h3>
            <p className="text-gray-600">Create short, memorable links from long URLs with just one click.</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-blue-500 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">QR Codes</h3>
            <p className="text-gray-600">Generate QR codes for your links to make them easily scannable.</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-blue-500 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Link Analytics</h3>
            <p className="text-gray-600">Track clicks and monitor the performance of your shortened links.</p>
          </div>
        </div>

        {/* Call to action */}
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <h3 className="text-2xl font-bold mb-4">Ready to get started?</h3>
          <p className="text-gray-600 mb-6">Join thousands of users who are shortening their links with our service.</p>
          <Link 
            to="/register" 
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium inline-block"
          >
            Create Free Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LaunchPage;