import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, User, Users, ChevronRight } from 'lucide-react';

const Sidebar = ({ user, tasks = [], mobileOpen = false, onMobileClose }) => {
    const [collapsed, setCollapsed] = useState(false);

    const navItems = [
        { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
        { to: '/tasks', label: 'My Tasks', icon: CheckSquare },
        { to: '/team', label: 'Team', icon: Users },
        { to: '/profile', label: 'Profile', icon: User },
    ];

    return (
        <aside className={`fixed top-16 left-0 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 z-40 transition-all duration-300 flex flex-col
            ${collapsed ? 'md:w-16 w-64' : 'w-64'}
            ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>

            {/* Collapse toggle — desktop only */}
            <button
                onClick={() => setCollapsed(p => !p)}
                className="hidden md:flex absolute -right-3 top-6 w-6 h-6 bg-white border border-gray-200 rounded-full items-center justify-center shadow-sm hover:bg-purple-50 transition"
            >
                <ChevronRight className={`w-3 h-3 text-gray-500 transition-transform duration-300 ${collapsed ? '' : 'rotate-180'}`} />
            </button>

            {/* Nav links */}
            <nav className="flex-1 p-3 space-y-1 mt-2">
                {navItems.map(({ to, label, icon: Icon, end }) => (
                    <NavLink
                        key={to}
                        to={to}
                        end={end}
                        onClick={onMobileClose}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                            ${isActive
                                ? 'bg-gradient-to-r from-fuchsia-50 to-purple-50 text-purple-700 border border-purple-100'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                            }`
                        }
                    >
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        {(!collapsed || mobileOpen) && <span>{label}</span>}
                    </NavLink>
                ))}
            </nav>

            {/* Task count summary at bottom */}
            {(!collapsed || mobileOpen) && (
                <div className="p-4 border-t border-gray-100">
                    <p className="text-xs text-gray-400 mb-1">Total Tasks</p>
                    <p className="text-lg font-bold text-gray-700">{tasks.length}</p>
                </div>
            )}
        </aside>
    );
};

export default Sidebar;
