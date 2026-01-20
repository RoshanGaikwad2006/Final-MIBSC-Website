import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

// Public Pages
import Layout from './components/Layout/Layout';
import Home from './pages/Home';
import About from './pages/About';
import Domains from './pages/Domains';
import Projects from './pages/Projects';
import Achievements from './pages/Achievements';
import Events from './pages/Events';
import Members from './pages/Members';
import Sponsors from './pages/Sponsors';
import Contact from './pages/Contact';
import Gallery from './pages/Gallery';

// Admin Pages
import AdminLayout from './components/Admin/AdminLayout';
import AdminLogin from './pages/Admin/AdminLogin';
import AdminDashboard from './pages/Admin/AdminDashboard';
import AdminEvents from './pages/Admin/AdminEvents';
import AdminAchievements from './pages/Admin/AdminAchievements';
import AdminProjects from './pages/Admin/AdminProjects';
import AdminMembers from './pages/Admin/AdminMembers';
import AdminSponsors from './pages/Admin/AdminSponsors';
import AdminContacts from './pages/Admin/AdminContacts';
import AdminGallery from './pages/Admin/AdminGallery';

// Protected Route Component
import ProtectedRoute from './components/Admin/ProtectedRoute';

import SystemBootLoader from './components/UI/SystemBootLoader';

function App() {
  const [isBooting, setIsBooting] = React.useState(true);

  // Function to dismiss loader
  const handleSystemReady = React.useCallback(() => {
    setIsBooting(false);
  }, []);

  if (isBooting) {
    return <SystemBootLoader onReady={handleSystemReady} />;
  }

  return (
    <AuthProvider>
      <div className="App">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="domains" element={<Domains />} />
            <Route path="projects" element={<Projects />} />
            <Route path="achievements" element={<Achievements />} />
            <Route path="events" element={<Events />} />
            <Route path="members" element={<Members />} />
            <Route path="sponsors" element={<Sponsors />} />
            <Route path="contact" element={<Contact />} />
            <Route path="gallery" element={<Gallery />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="events" element={<AdminEvents />} />
            <Route path="achievements" element={<AdminAchievements />} />
            <Route path="projects" element={<AdminProjects />} />
            <Route path="members" element={<AdminMembers />} />
            <Route path="sponsors" element={<AdminSponsors />} />
            <Route path="contacts" element={<AdminContacts />} />
            <Route path="gallery" element={<AdminGallery />} />
          </Route>

          {/* 404 Route */}
          <Route path="*" element={
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-secondary-800 mb-4">404</h1>
                <p className="text-secondary-600">Page not found</p>
              </div>
            </div>
          } />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;