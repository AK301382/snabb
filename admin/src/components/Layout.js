import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Car, MapPin, Bell, BarChart3, DollarSign, Settings, LogOut, Menu, X } from 'lucide-react';

const Layout = ({ children, setIsAuthenticated }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const adminData = JSON.parse(localStorage.getItem('admin_data') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_data');
    setIsAuthenticated(false);
    navigate('/login');
  };

  const menuItems = [
    { path: '/', icon: LayoutDashboard, label: 'دشبورد' },
    { path: '/users', icon: Users, label: 'مدیریت کاربران' },
    { path: '/trips', icon: Car, label: 'مدیریت سفرها' },
    { path: '/drivers-map', icon: MapPin, label: 'نقشه رانندگان' },
    { path: '/notifications', icon: Bell, label: 'اعلان‌ها' },
    { path: '/analytics', icon: BarChart3, label: 'گزارشات' },
    { path: '/fare-ranges', icon: DollarSign, label: 'جدول نرخ کرایه' },
    { path: '/settings', icon: Settings, label: 'تنظیمات' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-200 fixed w-full z-30">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 lg:hidden"
              >
                {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
              <div className="flex items-center mr-4">
                <div className="bg-snabb text-white w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xl">
                  S
                </div>
                <h1 className="mr-3 text-xl font-bold text-gray-900">پنل مدیریت Snabb</h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">{adminData.name || 'مدیر'}</p>
                <p className="text-xs text-gray-500">{adminData.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-md text-gray-600 hover:text-red-600 hover:bg-red-50"
                title="خروج"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <div className="flex pt-16">
        <aside
          className={`${
            sidebarOpen ? 'translate-x-0' : 'translate-x-full'
          } lg:translate-x-0 fixed lg:static inset-y-0 right-0 z-20 w-64 bg-white border-l border-gray-200 transition-transform duration-300 ease-in-out mt-16 lg:mt-0`}
        >
          <nav className="h-full overflow-y-auto p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-snabb text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;
