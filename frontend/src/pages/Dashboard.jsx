import React from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { CheckCircle2, Clock, ListTodo, TrendingUp, ArrowRight, AlertCircle } from 'lucide-react';

const priorityColors = {
    High:   { bg: 'bg-red-100',    text: 'text-red-700',    dot: 'bg-red-500' },
    Medium: { bg: 'bg-yellow-100', text: 'text-yellow-700', dot: 'bg-yellow-500' },
    Low:    { bg: 'bg-green-100',  text: 'text-green-700',  dot: 'bg-green-500' },
};

const StatCard = ({ title, value, icon: Icon, color, sub }) => (
    <div className={`bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-start gap-4`}>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
            <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
            <p className="text-sm text-gray-500 font-medium">{title}</p>
            <p className="text-2xl font-bold text-gray-800 mt-0.5">{value}</p>
            {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
        </div>
    </div>
);

const Dashboard = () => {
    const { tasks, stats } = useOutletContext();
    const navigate = useNavigate();

    const recent = tasks.slice(0, 5);

    const highCount   = tasks.filter(t => t.priority === 'High').length;
    const mediumCount = tasks.filter(t => t.priority === 'Medium').length;
    const lowCount    = tasks.filter(t => t.priority === 'Low').length;

    const overdueCount = tasks.filter(t => {
        if (!t.dueDate || t.completed) return false;
        return new Date(t.dueDate) < new Date();
    }).length;

    return (
        <div className="space-y-6 pb-8">
            {/* Greeting */}
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
                <p className="text-sm text-gray-500 mt-1">Here's what's going on with your tasks today.</p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                <StatCard
                    title="Total Tasks"
                    value={stats.totalCount}
                    icon={ListTodo}
                    color="bg-indigo-500"
                />
                <StatCard
                    title="Completed"
                    value={stats.completedCount}
                    icon={CheckCircle2}
                    color="bg-green-500"
                    sub={`${stats.completionPercentage}% done`}
                />
                <StatCard
                    title="Pending"
                    value={stats.pendingCount}
                    icon={Clock}
                    color="bg-yellow-500"
                />
                <StatCard
                    title="Overdue"
                    value={overdueCount}
                    icon={AlertCircle}
                    color="bg-red-500"
                />
            </div>

            {/* Progress Bar */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-purple-500" />
                        <span className="text-sm font-semibold text-gray-700">Overall Progress</span>
                    </div>
                    <span className="text-sm font-bold text-purple-600">{stats.completionPercentage}%</span>
                </div>
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-fuchsia-500 via-purple-500 to-indigo-500 rounded-full transition-all duration-500"
                        style={{ width: `${stats.completionPercentage}%` }}
                    />
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-2">
                    <span>{stats.completedCount} completed</span>
                    <span>{stats.pendingCount} remaining</span>
                </div>
            </div>

            {/* Priority Breakdown + Recent Tasks side by side on large screens */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Priority Breakdown */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <h2 className="text-sm font-semibold text-gray-700 mb-4">Tasks by Priority</h2>
                    <div className="space-y-3">
                        {[
                            { label: 'High',   count: highCount,   ...priorityColors.High },
                            { label: 'Medium', count: mediumCount, ...priorityColors.Medium },
                            { label: 'Low',    count: lowCount,    ...priorityColors.Low },
                        ].map(({ label, count, bg, text, dot }) => (
                            <div key={label} className="flex items-center gap-3">
                                <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${dot}`} />
                                <span className="text-sm text-gray-600 flex-1">{label}</span>
                                <div className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${bg} ${text}`}>
                                    {count}
                                </div>
                            </div>
                        ))}
                        {tasks.length === 0 && (
                            <p className="text-sm text-gray-400 text-center py-4">No tasks yet</p>
                        )}
                    </div>
                </div>

                {/* Recent Tasks */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-semibold text-gray-700">Recent Tasks</h2>
                        <button
                            onClick={() => navigate('/tasks')}
                            className="flex items-center gap-1 text-xs text-purple-600 hover:underline font-medium"
                        >
                            View all <ArrowRight className="w-3 h-3" />
                        </button>
                    </div>

                    {recent.length === 0 ? (
                        <div className="text-center py-6">
                            <p className="text-sm text-gray-400">No tasks yet.</p>
                            <button
                                onClick={() => navigate('/tasks')}
                                className="mt-2 text-xs text-purple-600 hover:underline font-medium"
                            >
                                Create your first task →
                            </button>
                        </div>
                    ) : (
                        <ul className="space-y-2">
                            {recent.map(task => {
                                const p = priorityColors[task.priority] || priorityColors.Low;
                                return (
                                    <li key={task._id} className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0">
                                        <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${p.dot}`} />
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm font-medium truncate ${task.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                                                {task.title}
                                            </p>
                                            {task.dueDate && (
                                                <p className="text-xs text-gray-400 mt-0.5">
                                                    Due {new Date(task.dueDate).toLocaleDateString()}
                                                </p>
                                            )}
                                        </div>
                                        {task.completed && (
                                            <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
