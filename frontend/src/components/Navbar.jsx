import React from 'react';
import { Zap, LogOut, Menu } from 'lucide-react';

const Navbar = ({ user, onLogout, onMenuToggle }) => {
    return (
        <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50 flex items-center justify-between px-4 sm:px-6">
            {/* Left: Hamburger (mobile) + Logo */}
            <div className="flex items-center gap-3">
                <button
                    onClick={onMenuToggle}
                    className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition"
                    aria-label="Toggle menu"
                >
                    <Menu className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-fuchsia-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <Zap className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-base font-bold bg-gradient-to-r from-fuchsia-600 to-purple-600 bg-clip-text text-transparent">
                        TaskPilot
                    </span>
                </div>
            </div>

            {/* Right: User info + Logout */}
            <div className="flex items-center gap-3">
                {user && (
                    <div className="flex items-center gap-2.5">
                        <img
                            src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'U')}&background=random`}
                            alt={user.name}
                            className="w-8 h-8 rounded-full object-cover"
                        />
                        <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-[140px] truncate">
                            {user.name}
                        </span>
                    </div>
                )}
                <button
                    onClick={onLogout}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                    title="Logout"
                >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">Logout</span>
                </button>
            </div>
        </header>
    );
};

export default Navbar;
