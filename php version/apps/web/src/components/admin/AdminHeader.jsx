import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '@/contexts/AdminAuthContext.jsx';
import { Menu, X, LogOut, ShieldAlert, Users, LayoutDashboard, Activity, PackageSearch } from 'lucide-react';

const AdminHeader = () => {
  const { currentAdmin, isSuperAdmin, logout } = useAdminAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const isActive = (path) => {
    if (path === '/admin' && location.pathname !== '/admin') return false;
    return location.pathname.startsWith(path);
  };

  const NavLinks = ({ mobile = false }) => (
    <>
      <Link 
        to="/admin" 
        onClick={() => mobile && setMobileMenuOpen(false)}
        className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/admin') && location.pathname === '/admin' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
      >
        <LayoutDashboard className="w-4 h-4" />
        Dashboard
      </Link>
      
      <Link 
        to="/admin/products" 
        onClick={() => mobile && setMobileMenuOpen(false)}
        className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/admin/products') ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
      >
        <PackageSearch className="w-4 h-4" />
        Products
      </Link>

      {isSuperAdmin && (
        <>
          <Link 
            to="/admin/approval-requests" 
            onClick={() => mobile && setMobileMenuOpen(false)}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/admin/approval-requests') ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
          >
            <ShieldAlert className="w-4 h-4" />
            Approvals
          </Link>
          <Link 
            to="/admin/manage-admins" 
            onClick={() => mobile && setMobileMenuOpen(false)}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/admin/manage-admins') ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
          >
            <Users className="w-4 h-4" />
            Team
          </Link>
          <Link 
            to="/admin/activity-logs" 
            onClick={() => mobile && setMobileMenuOpen(false)}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/admin/activity-logs') ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
          >
            <Activity className="w-4 h-4" />
            Logs
          </Link>
        </>
      )}
    </>
  );

  return (
    <header className="bg-white border-b border-border sticky top-0 z-40">
      <div className="px-4 sm:px-6 lg:px-8 max-w-[1600px] mx-auto">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link to="/admin" className="flex items-center gap-2">
              <div className="text-xl font-extrabold text-primary tracking-tight">
                <span className="text-secondary mr-1">STC</span> Admin
              </div>
            </Link>
            
            <nav className="hidden lg:flex items-center gap-1">
              <NavLinks />
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-bold text-foreground">{currentAdmin?.fullName}</span>
              <span className="text-xs text-muted-foreground">{currentAdmin?.email}</span>
            </div>
            
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
              {currentAdmin?.fullName?.charAt(0) || 'A'}
            </div>

            <button 
              onClick={handleLogout}
              className="hidden lg:flex items-center justify-center w-10 h-10 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
              title="Logout"
              aria-label="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>

            <button
              className="lg:hidden p-2 text-foreground"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-border bg-white p-4 flex flex-col gap-2 shadow-lg absolute w-full">
          <div className="mb-4 pb-4 border-b border-border flex flex-col">
            <span className="text-sm font-bold text-foreground">{currentAdmin?.fullName}</span>
            <span className="text-xs text-muted-foreground">{currentAdmin?.email}</span>
          </div>
          <NavLinks mobile />
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors mt-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      )}
    </header>
  );
};

export default AdminHeader;