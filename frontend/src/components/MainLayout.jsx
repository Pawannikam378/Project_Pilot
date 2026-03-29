import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, FolderOpen, LogOut, Settings, Rocket } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MainLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Projects', href: '/projects', icon: FolderOpen },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      {/* Sidebar */}
      <div className="hidden md:flex flex-col w-64 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-800">
          <Rocket className="h-6 w-6 text-brand-500 mr-2" />
          <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">ProjectPilot</span>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-1 px-3">
            {navigation.map((item) => {
              const isActive = location.pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
                    ${isActive 
                      ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400' 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }
                  `}
                >
                  <item.icon
                    className={`flex-shrink-0 -ml-1 mr-3 h-5 w-5 ${isActive ? 'text-brand-500' : 'text-gray-400'}`}
                  />
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
        
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center">
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[150px]">{user?.email}</p>
              <p className="text-xs font-medium text-gray-500 capitalize">{user?.plan} Plan</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="mt-4 flex w-full items-center px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Sign out
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile header... skipped for brevity */}
        
        {/* Demo Mode Banner */}
        <div className="bg-amber-500 text-amber-950 px-4 py-2 text-center text-sm font-medium">
          Demo Mode Active - Mock integrations in use
        </div>
        
        <main className="flex-1 overflow-y-auto">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
}
