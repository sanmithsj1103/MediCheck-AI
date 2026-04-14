import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, Bell, Search } from 'lucide-react';
import toast from 'react-hot-toast';

function Topbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-slate-100">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        {/* Spacer for mobile hamburger */}
        <div className="w-10 lg:hidden" />

        {/* Search (desktop) */}
        <div className="hidden sm:flex items-center flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search symptoms, conditions..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-100 text-sm
                         placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-400/30 focus:border-primary-300
                         transition-all duration-200"
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Notifications */}
          <button
            className="relative p-2 rounded-xl hover:bg-slate-50 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5 text-slate-500" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger-500 rounded-full" />
          </button>

          {/* User avatar + name */}
          <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-3 border-l border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
              <span className="text-xs font-bold text-white">
                {getInitials(user?.displayName)}
              </span>
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-slate-800 leading-tight">
                {user?.displayName || 'User'}
              </p>
              <p className="text-[11px] text-slate-400">Patient</p>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl hover:bg-red-50 transition-colors group"
              title="Logout"
              aria-label="Logout"
            >
              <LogOut className="w-4 h-4 text-slate-400 group-hover:text-danger-500 transition-colors" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Topbar;
