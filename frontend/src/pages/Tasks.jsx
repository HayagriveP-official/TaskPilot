import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Plus, Pencil, Trash2, CheckCircle2, Circle, X, ChevronDown } from 'lucide-react';
import api from '../services/api';

// ─── Constants ────────────────────────────────────────────────────────────────

const PRIORITIES = ['Low', 'Medium', 'High'];
const STATUSES   = ['All', 'Pending', 'Completed'];

const priorityColors = {
    High:   'bg-red-100 text-red-700 border-red-200',
    Medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    Low:    'bg-green-100 text-green-700 border-green-200',
};

const emptyForm = { title: '', description: '', priority: 'Low', dueDate: '' };

// ─── Task Form Modal ───────────────────────────────────────────────────────────

const TaskModal = ({ initial, onClose, onSave, loading }) => {
    const [form, setForm] = useState(initial || emptyForm);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title.trim()) { setError('Title is required.'); return; }
        await onSave(form);
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h2 className="text-base font-bold text-gray-800">
                        {initial?._id ? 'Edit Task' : 'New Task'}
                    </h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 transition">
                        <X className="w-4 h-4 text-gray-500" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="px-4 py-2 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                        <input
                            type="text"
                            name="title"
                            value={form.title}
                            onChange={handleChange}
                            placeholder="Task title"
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            rows={3}
                            placeholder="Optional details..."
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 transition resize-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                            <select
                                name="priority"
                                value={form.priority}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 transition bg-white"
                            >
                                {PRIORITIES.map(p => <option key={p}>{p}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                            <input
                                type="date"
                                name="dueDate"
                                value={form.dueDate}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-2.5 bg-gradient-to-r from-fuchsia-500 via-purple-500 to-indigo-500 text-white text-sm font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-60"
                        >
                            {loading ? 'Saving...' : (initial?._id ? 'Update Task' : 'Create Task')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ─── Task Card ─────────────────────────────────────────────────────────────────

const TaskCard = ({ task, onToggle, onEdit, onDelete }) => {
    const isOverdue = !task.completed && task.dueDate && new Date(task.dueDate) < new Date();
    const p = priorityColors[task.priority] || priorityColors.Low;

    return (
        <div className={`bg-white rounded-xl p-4 shadow-sm border transition-all duration-200
            ${task.completed ? 'border-gray-100 opacity-75' : 'border-gray-200 hover:border-purple-200 hover:shadow-md'}`}>
            <div className="flex items-start gap-3">
                {/* Complete toggle */}
                <button
                    onClick={() => onToggle(task)}
                    className="mt-0.5 flex-shrink-0 text-gray-300 hover:text-green-500 transition-colors"
                    title={task.completed ? 'Mark pending' : 'Mark complete'}
                >
                    {task.completed
                        ? <CheckCircle2 className="w-5 h-5 text-green-500" />
                        : <Circle className="w-5 h-5" />
                    }
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold leading-snug
                        ${task.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                        {task.title}
                    </p>
                    {task.description && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{task.description}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${p}`}>
                            {task.priority}
                        </span>
                        {task.dueDate && (
                            <span className={`text-xs ${isOverdue ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
                                {isOverdue ? '⚠ Overdue · ' : 'Due '}
                                {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                        onClick={() => onEdit(task)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-purple-600 hover:bg-purple-50 transition"
                        title="Edit"
                    >
                        <Pencil className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onDelete(task._id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition"
                        title="Delete"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Tasks Page ────────────────────────────────────────────────────────────────

const Tasks = () => {
    const { tasks, refreshTasks } = useOutletContext();

    const [showModal, setShowModal]     = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [mutating, setMutating]       = useState(false);
    const [search, setSearch]           = useState('');
    const [filterStatus, setFilterStatus]     = useState('All');
    const [filterPriority, setFilterPriority] = useState('All');

    // ── Filtered list ──────────────────────────────────────────────────────────
    const filtered = tasks.filter(t => {
        const matchSearch = t.title.toLowerCase().includes(search.toLowerCase());
        const matchStatus =
            filterStatus === 'All'       ? true :
            filterStatus === 'Completed' ? t.completed :
                                           !t.completed;
        const matchPriority =
            filterPriority === 'All' ? true : t.priority === filterPriority;
        return matchSearch && matchStatus && matchPriority;
    });

    // ── Create ─────────────────────────────────────────────────────────────────
    const handleCreate = async (form) => {
        setMutating(true);
        try {
            await api.post('/task/gp', form);
            await refreshTasks();
            setShowModal(false);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to create task.');
        } finally {
            setMutating(false);
        }
    };

    // ── Update ─────────────────────────────────────────────────────────────────
    const handleUpdate = async (form) => {
        setMutating(true);
        try {
            await api.put(`/task/${editingTask._id}/gp`, form);
            await refreshTasks();
            setEditingTask(null);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update task.');
        } finally {
            setMutating(false);
        }
    };

    // ── Toggle complete ────────────────────────────────────────────────────────
    const handleToggle = async (task) => {
        try {
            await api.put(`/task/${task._id}/gp`, { completed: !task.completed });
            await refreshTasks();
        } catch (err) {
            alert('Failed to update task.');
        }
    };

    // ── Delete ─────────────────────────────────────────────────────────────────
    const handleDelete = async (id) => {
        if (!window.confirm('Delete this task?')) return;
        try {
            await api.delete(`/task/${id}/gp`);
            await refreshTasks();
        } catch (err) {
            alert('Failed to delete task.');
        }
    };

    const openEdit = (task) => {
        setEditingTask({
            ...task,
            dueDate: task.dueDate ? task.dueDate.slice(0, 10) : ''
        });
    };

    return (
        <div className="space-y-5 pb-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">My Tasks</h1>
                    <p className="text-sm text-gray-500 mt-1">{tasks.length} total · {filtered.length} showing</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-fuchsia-500 via-purple-500 to-indigo-500
                    text-white text-sm font-semibold rounded-xl hover:opacity-90 transition shadow-sm"
                >
                    <Plus className="w-4 h-4" />
                    New Task
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
                {/* Search */}
                <input
                    type="text"
                    placeholder="Search tasks..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="flex-1 min-w-[180px] px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
                />

                {/* Status filter */}
                <div className="relative">
                    <select
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value)}
                        className="appearance-none pl-4 pr-9 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white transition"
                    >
                        {STATUSES.map(s => <option key={s}>{s}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>

                {/* Priority filter */}
                <div className="relative">
                    <select
                        value={filterPriority}
                        onChange={e => setFilterPriority(e.target.value)}
                        className="appearance-none pl-4 pr-9 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white transition"
                    >
                        {['All', ...PRIORITIES].map(p => <option key={p}>{p}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
            </div>

            {/* Task List */}
            {filtered.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                    <p className="text-gray-400 text-sm">
                        {tasks.length === 0
                            ? 'No tasks yet. Create your first task!'
                            : 'No tasks match your filters.'}
                    </p>
                    {tasks.length === 0 && (
                        <button
                            onClick={() => setShowModal(true)}
                            className="mt-3 text-sm text-purple-600 hover:underline font-medium"
                        >
                            + Create task
                        </button>
                    )}
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map(task => (
                        <TaskCard
                            key={task._id}
                            task={task}
                            onToggle={handleToggle}
                            onEdit={openEdit}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            )}

            {/* Create Modal */}
            {showModal && (
                <TaskModal
                    onClose={() => setShowModal(false)}
                    onSave={handleCreate}
                    loading={mutating}
                />
            )}

            {/* Edit Modal */}
            {editingTask && (
                <TaskModal
                    initial={editingTask}
                    onClose={() => setEditingTask(null)}
                    onSave={handleUpdate}
                    loading={mutating}
                />
            )}
        </div>
    );
};

export default Tasks;
