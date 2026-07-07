import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminHeader from './AdminHeader.jsx';

const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      <AdminHeader />
      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-[1600px] w-full mx-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;