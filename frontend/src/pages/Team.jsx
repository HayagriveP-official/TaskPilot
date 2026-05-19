import React, { useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { UserPlus, X, Users, CheckCircle2, ListTodo } from 'lucide-react';

const ROLES = ['Designer', 'Developer', 'Product Manager', 'QA', 'Member'];

const ROLE_COLORS = {
    Owner:             'bg-purple-100 text-purple-700 border-purple-200',
    Designer:          'bg-pink-100 text-pink-700 border-pink-200',
    Developer:         'bg-blue-100 text-blue-700 border-blue-200',
    'Product Manager': 'bg-orange-100 text-orange-700 border-orange-200',
    QA:                'bg-teal-100 text-teal-700 border-teal-200',
    Member:            'bg-gray-100 text-gray-600 border-gray-200',
};

// ─── Add Member Modal ──────────────────────────────────────────────────────────

const AddMemberModal = ({ onClose, onAdd }) => {
    const [form, setForm] = useState({ name: '', role: 'Member' });
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.name.trim()) { setError('Name is required.'); return; }
        onAdd(form.name.trim(), form.role);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h2 className="text-base font-bold text-gray-800">Add Team Member</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 transition">
                        <X className="w-4 h-4 text-gray-500" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="px-4 py-2 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">{error}</div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={e => { setForm(p => ({ ...p, name: e.target.value })); setError(''); }}
                            placeholder="e.g. Jane Doe"
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                        <select
                            value={form.role}
                            onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 transition bg-white"
                        >
                            {ROLES.map(r => <option key={r}>{r}</option>)}
                        </select>
                    </div>
                    <div className="flex gap-3 pt-1">
                        <button type="button" onClick={onClose}
                            className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition">
                            Cancel
                        </button>
                        <button type="submit"
                            className="flex-1 py-2.5 bg-gradient-to-r from-fuchsia-500 via-purple-500 to-indigo-500 text-white text-sm font-semibold rounded-lg hover:opacity-90 transition">
                            Add Member
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ─── Member Card ───────────────────────────────────────────────────────────────

const MemberCard = ({ member, assignedCount, completedCount, onRemove }) => {
    const roleClass = ROLE_COLORS[member.role] || ROLE_COLORS.Member;

    return (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col items-center text-center gap-3 relative hover:shadow-md transition">
            {member.isCurrentUser && (
                <span className="absolute top-3 right-3 text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">
                    You
                </span>
            )}
            {!member.isCurrentUser && (
                <button
                    onClick={() => onRemove(member.id)}
                    className="absolute top-3 left-3 p-1 rounded-full text-gray-300 hover:text-red-400 hover:bg-red-50 transition"
                    title="Remove member"
                >
                    <X className="w-3.5 h-3.5" />
                </button>
            )}

            <img
                src={member.avatar}
                alt={member.name}
                className="w-16 h-16 rounded-full shadow-md object-cover"
            />

            <div className="space-y-1">
                <p className="font-semibold text-gray-800 text-sm leading-tight">{member.name}</p>
                <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium inline-block ${roleClass}`}>
                    {member.role}
                </span>
            </div>

            <div className="flex items-center gap-3 text-xs text-gray-400 pt-1 border-t border-gray-50 w-full justify-center">
                <span className="flex items-center gap-1">
                    <ListTodo className="w-3 h-3" /> {assignedCount} assigned
                </span>
                <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-green-400" /> {completedCount} done
                </span>
            </div>
        </div>
    );
};

// ─── Team Page ─────────────────────────────────────────────────────────────────

const Team = () => {
    const { tasks, workspaceMembers, addWorkspaceMember, removeWorkspaceMember } = useOutletContext();
    const [showModal, setShowModal] = useState(false);

    // Per-member task stats
    const memberStats = useMemo(() => {
        const stats = {};
        tasks.forEach(t => {
            if (!t.assignedTo) return;
            if (!stats[t.assignedTo]) stats[t.assignedTo] = { assigned: 0, completed: 0 };
            stats[t.assignedTo].assigned++;
            if (t.completed) stats[t.assignedTo].completed++;
        });
        return stats;
    }, [tasks]);

    const totalAssigned  = tasks.filter(t => t.assignedTo).length;
    const totalCompleted = tasks.filter(t => t.assignedTo && t.completed).length;
    const teamCompletion = totalAssigned
        ? Math.round((totalCompleted / totalAssigned) * 100)
        : 0;

    return (
        <div className="space-y-6 pb-8">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Team Workspace</h1>
                    <p className="text-sm text-gray-500 mt-1">{workspaceMembers.length} member{workspaceMembers.length !== 1 ? 's' : ''} in this workspace</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-fuchsia-500 via-purple-500 to-indigo-500 text-white text-sm font-semibold rounded-xl hover:opacity-90 transition shadow-sm"
                >
                    <UserPlus className="w-4 h-4" />
                    Invite Member
                </button>
            </div>

            {/* Workspace Stats */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500 flex items-center justify-center flex-shrink-0">
                        <Users className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-medium">Members</p>
                        <p className="text-xl font-bold text-gray-800">{workspaceMembers.length}</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center flex-shrink-0">
                        <ListTodo className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-medium">Assigned</p>
                        <p className="text-xl font-bold text-gray-800">{totalAssigned}</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-medium">Team Done</p>
                        <p className="text-xl font-bold text-gray-800">{teamCompletion}%</p>
                    </div>
                </div>
            </div>

            {/* Member Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {workspaceMembers.map(member => {
                    const s = memberStats[member.name] || { assigned: 0, completed: 0 };
                    return (
                        <MemberCard
                            key={member.id}
                            member={member}
                            assignedCount={s.assigned}
                            completedCount={s.completed}
                            onRemove={removeWorkspaceMember}
                        />
                    );
                })}

                {/* Add member placeholder card */}
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-white rounded-2xl p-5 shadow-sm border border-dashed border-gray-200 flex flex-col items-center justify-center gap-3 hover:border-purple-300 hover:bg-purple-50/30 transition min-h-[180px]"
                >
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                        <UserPlus className="w-5 h-5 text-gray-400" />
                    </div>
                    <span className="text-sm text-gray-400 font-medium">Invite Member</span>
                </button>
            </div>

            {showModal && (
                <AddMemberModal
                    onClose={() => setShowModal(false)}
                    onAdd={addWorkspaceMember}
                />
            )}
        </div>
    );
};

export default Team;
