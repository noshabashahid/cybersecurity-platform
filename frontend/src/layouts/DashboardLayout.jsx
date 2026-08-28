import React from 'react';
import Sidebar from '../components/Sidebar';

export default function DashboardLayout({ children, mode = 'user' }) {
  return (
    <div className="min-h-screen flex bg-bg">
      <Sidebar mode={mode} />
      <main className="flex-1 min-w-0 p-4 md:p-8 max-w-7xl mx-auto w-full">{children}</main>
    </div>
  );
}
