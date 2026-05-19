import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';
import api from '../services/api';

const WORKSPACE_KEY = 'taskpilot_workspace';

const DEFAULT_MEMBERS = [
    { id: 'demo-1', name: 'Alice Johnson',  role: 'Designer',        avatar: 'https://ui-avatars.com/api/?name=Alice+Johnson&background=ec4899&color=fff&bold=true' },
    { id: 'demo-2', name: 'Bob Smith',      role: 'Developer',       avatar: 'https://ui-avatars.com/api/?name=Bob+Smith&background=3b82f6&color=fff&bold=true' },
    { id: 'demo-3', name: 'Carol Williams', role: 'Product Manager',  avatar: 'https://ui-avatars.com/api/?name=Carol+Williams&background=f97316&color=fff&bold=true' },
];

const Layout = ({ onLogout, user }) => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Workspace members stored in localStorage; seeded with demo members on first visit
    const [extraMembers, setExtraMembers] = useState(() => {
        try {
            const stored = localStorage.getItem(WORKSPACE_KEY);
            if (stored !== null) return JSON.parse(stored);
            localStorage.setItem(WORKSPACE_KEY, JSON.stringify(DEFAULT_MEMBERS));
            return DEFAULT_MEMBERS;
        } catch { return DEFAULT_MEMBERS; }
    });

    // Current user is always the Owner at position 0
    const workspaceMembers = useMemo(() => {
        const owner = user ? {
            id: user.id,
            name: user.name,
            role: 'Owner',
            avatar: user.avatar,
            isCurrentUser: true,
        } : null;
        return owner ? [owner, ...extraMembers] : extraMembers;
    }, [user, extraMembers]);

    const addWorkspaceMember = useCallback((name, role) => {
        const member = {
            id: `m-${Date.now()}`,
            name,
            role: role || 'Member',
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&bold=true`,
            isCurrentUser: false,
        };
        setExtraMembers(prev => {
            const updated = [...prev, member];
            localStorage.setItem(WORKSPACE_KEY, JSON.stringify(updated));
            return updated;
        });
    }, []);

    const removeWorkspaceMember = useCallback((id) => {
        setExtraMembers(prev => {
            const updated = prev.filter(m => m.id !== id);
            localStorage.setItem(WORKSPACE_KEY, JSON.stringify(updated));
            return updated;
        });
    }, []);

    const fetchTasks = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await api.get('/task/gp');
            const arr = Array.isArray(data?.tasks) ? data.tasks : [];
            setTasks(arr);
        } catch (err) {
            console.error(err);
            setError(err.message || 'Could not load tasks');
            if (err.response?.status === 401) onLogout();
        } finally {
            setLoading(false);
        }
    }, [onLogout]);

    useEffect(() => { fetchTasks(); }, [fetchTasks]);

    const stats = useMemo(() => {
        const completedCount = tasks.filter(t =>
            t.completed === true || t.completed === 1
        ).length;
        const totalCount = tasks.length;
        const pendingCount = totalCount - completedCount;
        const completionPercentage = totalCount
            ? Math.round((completedCount / totalCount) * 100)
            : 0;
        return { totalCount, completedCount, pendingCount, completionPercentage };
    }, [tasks]);

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar user={user} onLogout={onLogout} onMenuToggle={() => setSidebarOpen(p => !p)} />
            <Sidebar user={user} tasks={tasks} mobileOpen={sidebarOpen} onMobileClose={() => setSidebarOpen(false)} />

            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/30 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <div className="md:ml-64 pt-16 p-4 sm:p-6 transition-all duration-300">
                <div className="max-w-5xl mx-auto">
                    {loading && (
                        <div className="text-center py-8 text-gray-400 text-sm">Loading tasks...</div>
                    )}
                    {error && (
                        <div className="px-4 py-3 mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
                            {error}
                        </div>
                    )}
                    <Outlet context={{
                        tasks, stats, refreshTasks: fetchTasks,
                        workspaceMembers, addWorkspaceMember, removeWorkspaceMember,
                    }} />
                </div>
            </div>
        </div>
    );
};

export default Layout;
