import React from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { CheckCircle2, Clock, ListTodo, TrendingUp, ArrowRight, AlertCircle } from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
    PieChart, Pie, Legend,
} from 'recharts';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const priorityColors = {
    High:   { bg: 'bg-red-100',    text: 'text-red-700',    dot: 'bg-red-500',    hex: '#ef4444' },
    Medium: { bg: 'bg-yellow-100', text: 'text-yellow-700', dot: 'bg-yellow-500', hex: '#f59e0b' },
    Low:    { bg: 'bg-green-100',  text: 'text-green-700',  dot: 'bg-green-500',  hex: '#22c55e' },
};

// ─── Stat Card ────────────────────────────────────────────────────────────────

const StatCard = ({ title, value, icon: Icon, color, sub }) => (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-start gap-4">
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

// ─── Activity Heatmap ─────────────────────────────────────────────────────────

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAY_LABELS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

const getHeatColor = (count) => {
    if (!count) return '#ebedf0';
    if (count === 1) return '#9be9a8';
    if (count === 2) return '#40c463';
    if (count <= 4) return '#30a14e';
    return '#216e39';
};

const ActivityHeatmap = ({ tasks }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Count tasks created per calendar day
    const tasksByDay = {};
    tasks.forEach(task => {
        if (!task.createdAt) return;
        const key = new Date(task.createdAt).toISOString().slice(0, 10);
        tasksByDay[key] = (tasksByDay[key] || 0) + 1;
    });

    // Start from the Sunday 25 full weeks before the current week's Sunday
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - today.getDay() - 25 * 7);

    // Build flat list of day objects
    const allDays = [];
    const cursor = new Date(startDate);
    while (cursor <= today) {
        const key = cursor.toISOString().slice(0, 10);
        allDays.push({
            date: key,
            count: tasksByDay[key] || 0,
            dayOfWeek: cursor.getDay(),
            month: cursor.getMonth(),
            dayOfMonth: cursor.getDate(),
            label: cursor.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        });
        cursor.setDate(cursor.getDate() + 1);
    }

    // Group into week columns (7 rows each)
    const weekCols = [];
    for (let i = 0; i < allDays.length; i += 7) {
        weekCols.push(allDays.slice(i, Math.min(i + 7, allDays.length)));
    }

    // Month label positions
    const monthLabels = [];
    weekCols.forEach((week, wi) => {
        const first = week[0];
        if (first && first.dayOfMonth <= 7) {
            monthLabels[wi] = MONTHS[first.month];
        }
    });

    const totalActivity = allDays.reduce((s, d) => s + d.count, 0);

    return (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-gray-700">Task Activity</h2>
                <span className="text-xs text-gray-400">{totalActivity} tasks in the last 6 months</span>
            </div>

            <div className="overflow-x-auto">
                <div style={{ minWidth: 600 }}>
                    {/* Month labels row */}
                    <div className="flex mb-1" style={{ paddingLeft: 28 }}>
                        {weekCols.map((_, wi) => (
                            <div key={wi} style={{ width: 14, marginRight: 2 }}
                                className="text-xs text-gray-400 overflow-visible whitespace-nowrap">
                                {monthLabels[wi] || ''}
                            </div>
                        ))}
                    </div>

                    {/* Day labels + grid */}
                    <div className="flex">
                        {/* Day-of-week labels */}
                        <div className="flex flex-col" style={{ marginRight: 4 }}>
                            {DAY_LABELS.map((d, i) => (
                                <div key={i} style={{ height: 14, marginBottom: 2 }}
                                    className="text-xs text-gray-400 flex items-center w-6 justify-end pr-1">
                                    {i % 2 === 1 ? d.slice(0,1) : ''}
                                </div>
                            ))}
                        </div>

                        {/* Week columns */}
                        <div className="flex gap-0.5">
                            {weekCols.map((week, wi) => (
                                <div key={wi} className="flex flex-col gap-0.5">
                                    {Array.from({ length: 7 }).map((_, di) => {
                                        const day = week[di];
                                        return (
                                            <div
                                                key={di}
                                                title={day ? `${day.label}: ${day.count} task${day.count !== 1 ? 's' : ''}` : ''}
                                                style={{
                                                    width: 14,
                                                    height: 14,
                                                    borderRadius: 3,
                                                    backgroundColor: day ? getHeatColor(day.count) : 'transparent',
                                                    cursor: day ? 'default' : 'default',
                                                }}
                                            />
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="flex items-center gap-1 mt-3 justify-end">
                        <span className="text-xs text-gray-400 mr-1">Less</span>
                        {['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'].map((c, i) => (
                            <div key={i} style={{ width: 14, height: 14, borderRadius: 3, backgroundColor: c }} />
                        ))}
                        <span className="text-xs text-gray-400 ml-1">More</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ─── Dashboard ────────────────────────────────────────────────────────────────

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

    const priorityBarData = [
        { name: 'High',   count: highCount,   color: priorityColors.High.hex },
        { name: 'Medium', count: mediumCount, color: priorityColors.Medium.hex },
        { name: 'Low',    count: lowCount,    color: priorityColors.Low.hex },
    ];

    const completionPieData = [
        { name: 'Completed', value: stats.completedCount, color: '#22c55e' },
        { name: 'Pending',   value: stats.pendingCount,   color: '#e5e7eb' },
    ];

    return (
        <div className="space-y-6 pb-8">
            {/* Greeting */}
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
                <p className="text-sm text-gray-500 mt-1">Here's what's going on with your tasks today.</p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                <StatCard title="Total Tasks"  value={stats.totalCount}        icon={ListTodo}     color="bg-indigo-500" />
                <StatCard title="Completed"    value={stats.completedCount}    icon={CheckCircle2} color="bg-green-500"  sub={`${stats.completionPercentage}% done`} />
                <StatCard title="Pending"      value={stats.pendingCount}      icon={Clock}        color="bg-yellow-500" />
                <StatCard title="Overdue"      value={overdueCount}            icon={AlertCircle}  color="bg-red-500" />
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

            {/* Charts row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Priority Bar Chart */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <h2 className="text-sm font-semibold text-gray-700 mb-4">Tasks by Priority</h2>
                    {tasks.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-10">No tasks yet</p>
                    ) : (
                        <ResponsiveContainer width="100%" height={160}>
                            <BarChart data={priorityBarData} barSize={44} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                                <XAxis dataKey="name" axisLine={false} tickLine={false}
                                    tick={{ fontSize: 12, fill: '#6b7280' }} />
                                <YAxis allowDecimals={false} axisLine={false} tickLine={false}
                                    tick={{ fontSize: 11, fill: '#9ca3af' }} />
                                <Tooltip
                                    cursor={{ fill: '#f9fafb' }}
                                    contentStyle={{ border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
                                    formatter={(val) => [val, 'Tasks']}
                                />
                                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                                    {priorityBarData.map((entry, i) => (
                                        <Cell key={i} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Completion Donut */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <h2 className="text-sm font-semibold text-gray-700 mb-4">Completion Status</h2>
                    {tasks.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-10">No tasks yet</p>
                    ) : (
                        <ResponsiveContainer width="100%" height={160}>
                            <PieChart>
                                <Pie
                                    data={completionPieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={45}
                                    outerRadius={68}
                                    paddingAngle={3}
                                    dataKey="value"
                                >
                                    {completionPieData.map((entry, i) => (
                                        <Cell key={i} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12 }}
                                    formatter={(val) => [val, 'Tasks']}
                                />
                                <Legend iconType="circle" iconSize={8}
                                    formatter={(val) => <span style={{ fontSize: 12, color: '#6b7280' }}>{val}</span>} />
                            </PieChart>
                        </ResponsiveContainer>
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
                    <ul className="divide-y divide-gray-50">
                        {recent.map(task => {
                            const p = priorityColors[task.priority] || priorityColors.Low;
                            return (
                                <li key={task._id} className="flex items-start gap-3 py-2.5">
                                    <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${p.dot}`} />
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

            {/* Activity Heatmap */}
            <ActivityHeatmap tasks={tasks} />
        </div>
    );
};

export default Dashboard;
