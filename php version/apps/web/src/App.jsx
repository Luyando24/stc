
import React from 'react';
import { Route, Routes, BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/contexts/AuthContext.jsx';
import { AdminAuthProvider } from '@/contexts/AdminAuthContext.jsx';
import ScrollToTop from '@/components/ScrollToTop.jsx';
import ChatWidget from '@/components/ChatWidget.jsx';

// Public Pages
import HomePage from '@/pages/HomePage.jsx';
import AirCargoPage from '@/pages/AirCargoPage.jsx';
import ChinaAfricaPage from '@/pages/ChinaAfricaPage.jsx';
import SeaCargoPage from '@/pages/SeaCargoPage.jsx';
import BlogPage from '@/pages/BlogPage.jsx';
import ContactPage from '@/pages/ContactPage.jsx';
import AboutPage from '@/pages/AboutPage.jsx';
import TrackingPage from '@/pages/TrackingPage.jsx';
import ProcurementGallery from '@/pages/ProcurementGallery.jsx';
import ProductDetailPage from '@/pages/ProductDetailPage.jsx';
import QuoteConfirmationPage from '@/pages/QuoteConfirmationPage.jsx';

// Admin Components & Pages
import AdminLayout from '@/components/admin/AdminLayout.jsx';
import AdminProtectedRoute from '@/components/admin/AdminProtectedRoute.jsx';
import AdminLoginPage from '@/pages/admin/AdminLoginPage.jsx';
import AdminRegistrationPage from '@/pages/admin/AdminRegistrationPage.jsx';
import SuperAdminDashboard from '@/pages/admin/SuperAdminDashboard.jsx';
import AdminApprovalRequestsPage from '@/pages/admin/AdminApprovalRequestsPage.jsx';
import AdminManagementPage from '@/pages/admin/AdminManagementPage.jsx';
import AdminActivityLogsPage from '@/pages/admin/AdminActivityLogsPage.jsx';
import AdminProductManagement from '@/pages/admin/AdminProductManagement.jsx';

function App() {
  return (
    <AuthProvider>
      <AdminAuthProvider>
        <Router>
          <ScrollToTop />
          <Toaster position="top-right" richColors />
          
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/air-cargo" element={<AirCargoPage />} />
            <Route path="/china-africa" element={<ChinaAfricaPage />} />
            <Route path="/sea-cargo-liberia" element={<SeaCargoPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/track" element={<TrackingPage />} />
            
            <Route path="/procurement" element={<ProcurementGallery />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/procurement/quote-confirmation" element={<QuoteConfirmationPage />} />
            
            {/* Admin Auth Routes */}
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin/register" element={<AdminRegistrationPage />} />

            {/* Admin Protected Routes */}
            <Route path="/admin" element={
              <AdminProtectedRoute>
                <AdminLayout />
              </AdminProtectedRoute>
            }>
              <Route index element={<SuperAdminDashboard />} />
              
              {/* Product Management Route (Accessible by both roles, filtered internally) */}
              <Route path="products" element={<AdminProductManagement />} />
              
              {/* Super Admin Only Routes */}
              <Route path="approval-requests" element={
                <AdminProtectedRoute requireSuperAdmin>
                  <AdminApprovalRequestsPage />
                </AdminProtectedRoute>
              } />
              
              <Route path="manage-admins" element={
                <AdminProtectedRoute requireSuperAdmin>
                  <AdminManagementPage />
                </AdminProtectedRoute>
              } />
              
              <Route path="activity-logs" element={
                <AdminProtectedRoute requireSuperAdmin>
                  <AdminActivityLogsPage />
                </AdminProtectedRoute>
              } />
            </Route>

            {/* Catch-all route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>

          {/* Global Chat Widget */}
          <ChatWidget />
        </Router>
      </AdminAuthProvider>
    </AuthProvider>
  );
}

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-muted flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-extrabold text-primary mb-4">404</h1>
        <h2 className="text-2xl font-bold text-foreground mb-3">Destination Unknown</h2>
        <p className="text-base text-muted-foreground mb-8">We couldn't locate the page you're searching for. It may have been moved or removed.</p>
        <a href="/" className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-md font-semibold shadow-sm hover:bg-primary/90 transition-colors">
          Return to Base
        </a>
      </div>
    </div>
  );
};

export default App;
