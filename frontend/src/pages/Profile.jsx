import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { User, Mail, Lock, CheckCircle2 } from 'lucide-react';
import api from '../services/api';

const Profile = () => {
    const { tasks, stats } = useOutletContext();

    // Read user from localStorage (set by App.jsx on login)
    const stored = JSON.parse(localStorage.getItem('currentUser') || '{}');

    const [profileForm, setProfileForm] = useState({ name: stored.name || '', email: stored.email || '' });
    const [profileMsg, setProfileMsg]   = useState('');
    const [profileErr, setProfileErr]   = useState('');
    const [profileLoading, setProfileLoading] = useState(false);

    const [pwForm, setPwForm]   = useState({ currentPassword: '', newPassword: '' });
    const [pwMsg, setPwMsg]     = useState('');
    const [pwErr, setPwErr]     = useState('');
    const [pwLoading, setPwLoading] = useState(false);

    // ── Update profile ─────────────────────────────────────────────────────────
    const handleProfileSave = async (e) => {
        e.preventDefault();
        setProfileMsg(''); setProfileErr('');
        setProfileLoading(true);
        try {
            const { data } = await api.put('/user/profile', profileForm);
            if (data.success) {
                // Update localStorage so Navbar/avatar stays in sync
                const updated = { ...stored, name: data.user.name, email: data.user.email };
                localStorage.setItem('currentUser', JSON.stringify(updated));
                setProfileMsg('Profile updated successfully.');
            }
        } catch (err) {
            setProfileErr(err.response?.data?.message || 'Failed to update profile.');
        } finally {
            setProfileLoading(false);
        }
    };

    // ── Change password ────────────────────────────────────────────────────────
    const handlePwSave = async (e) => {
        e.preventDefault();
        setPwMsg(''); setPwErr('');
        if (pwForm.newPassword.length < 8) {
            setPwErr('New password must be at least 8 characters.'); return;
        }
        setPwLoading(true);
        try {
            const { data } = await api.put('/user/password', pwForm);
            if (data.success) {
                setPwMsg('Password changed successfully.');
                setPwForm({ currentPassword: '', newPassword: '' });
            }
        } catch (err) {
            setPwErr(err.response?.data?.message || 'Failed to change password.');
        } finally {
            setPwLoading(false);
        }
    };

    return (
        <div className="space-y-6 pb-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Profile</h1>
                <p className="text-sm text-gray-500 mt-1">Manage your account settings</p>
            </div>

            {/* Avatar + quick stats */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-5">
                <img
                    src={stored.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(stored.name || 'U')}&background=random`}
                    alt="Avatar"
                    className="w-16 h-16 rounded-full shadow-md"
                />
                <div>
                    <p className="text-lg font-bold text-gray-800">{stored.name}</p>
                    <p className="text-sm text-gray-500">{stored.email}</p>
                    <p className="text-xs text-gray-400 mt-1">
                        {stats?.totalCount ?? 0} tasks · {stats?.completedCount ?? 0} completed
                    </p>
                </div>
            </div>

            {/* Update Profile */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-5">
                    <User className="w-4 h-4 text-purple-500" />
                    <h2 className="text-sm font-semibold text-gray-700">Update Profile</h2>
                </div>

                {profileMsg && (
                    <div className="mb-4 flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg">
                        <CheckCircle2 className="w-4 h-4" /> {profileMsg}
                    </div>
                )}
                {profileErr && (
                    <div className="mb-4 px-4 py-2 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
                        {profileErr}
                    </div>
                )}

                <form onSubmit={handleProfileSave} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input
                            type="text"
                            value={profileForm.name}
                            onChange={e => setProfileForm(p => ({ ...p, name: e.target.value }))}
                            required
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            value={profileForm.email}
                            onChange={e => setProfileForm(p => ({ ...p, email: e.target.value }))}
                            required
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={profileLoading}
                        className="px-6 py-2.5 bg-gradient-to-r from-fuchsia-500 via-purple-500 to-indigo-500 text-white text-sm font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-60"
                    >
                        {profileLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                </form>
            </div>

            {/* Change Password */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-5">
                    <Lock className="w-4 h-4 text-purple-500" />
                    <h2 className="text-sm font-semibold text-gray-700">Change Password</h2>
                </div>

                {pwMsg && (
                    <div className="mb-4 flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg">
                        <CheckCircle2 className="w-4 h-4" /> {pwMsg}
                    </div>
                )}
                {pwErr && (
                    <div className="mb-4 px-4 py-2 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
                        {pwErr}
                    </div>
                )}

                <form onSubmit={handlePwSave} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                        <input
                            type="password"
                            value={pwForm.currentPassword}
                            onChange={e => setPwForm(p => ({ ...p, currentPassword: e.target.value }))}
                            required
                            placeholder="••••••••"
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                        <input
                            type="password"
                            value={pwForm.newPassword}
                            onChange={e => setPwForm(p => ({ ...p, newPassword: e.target.value }))}
                            required
                            placeholder="Min. 8 characters"
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={pwLoading}
                        className="px-6 py-2.5 bg-gradient-to-r from-fuchsia-500 via-purple-500 to-indigo-500 text-white text-sm font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-60"
                    >
                        {pwLoading ? 'Changing...' : 'Change Password'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Profile;
