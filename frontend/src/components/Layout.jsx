import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';
import api from '../services/api';

const Layout = ({ onLogout, user }) => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);

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

            {/* Mobile overlay */}
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
                    <Outlet context={{ tasks, stats, refreshTasks: fetchTasks }} />
                </div>
            </div>
        </div>
    );
};

export default Layout;
