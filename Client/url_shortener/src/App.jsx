import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import Login from './Components/Login';
import UserHomePage from './Components/UserHomePage';
import AdminHomePage from './Components/AdminHomePage';
import UserRegistration from './Components/UserRegistration';
import MyUrls from './Components/MyUrls';
import ExploreUrls from './Components/ExploreUrls';
import Profile from './Components/Profile';
import { ProtectedRoute, AdminRoute, UserRoute, PublicRoute } from './Components/ProtectedRoutes';
import LaunchPage from './Components/LaunchPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes - accessible when not logged in */}

          <Route element={<PublicRoute />}>
            <Route path="/" element={<LaunchPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<UserRegistration />} />
          </Route>
          
          {/* Admin routes */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminHomePage />} />
          </Route>
          
          {/* Regular user routes */}
          <Route element={<UserRoute />}>
            <Route path="/home" element={<UserHomePage />} />
          </Route>
          
          {/* Protected routes - accessible by any authenticated user */}
          <Route element={<ProtectedRoute />}>
            <Route path="/my-urls" element={<MyUrls />} />
            <Route path="/explore-urls" element={<ExploreUrls />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
          
          {/* Fallback route for paths that don't match */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;