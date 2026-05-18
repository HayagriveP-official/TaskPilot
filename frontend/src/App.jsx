import React, { useEffect, useState } from 'react';
import './index.css';
import { Navigate, Outlet, Route, Routes, useNavigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './components/Login';
import SignUp from './components/SignUp';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Profile from './pages/Profile';

const App = () => {
    const navigate = useNavigate();

    // Restore user from localStorage on refresh (persistent login)
    const [currentUser, setCurrentUser] = useState(() => {
        const stored = localStorage.getItem('currentUser');
        return stored ? JSON.parse(stored) : null;
    });

    // Keep localStorage in sync with state
    useEffect(() => {
        if (currentUser) {
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
        } else {
            localStorage.removeItem('currentUser');
        }
    }, [currentUser]);

    // Called after successful login or register
    // FIX: now also receives and saves the token — previously token was never stored
    const handleAuthSubmit = (userData) => {
        const user = {
            id: userData.id,
            email: userData.email,
            name: userData.name || 'User',
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name || 'User')}&background=random`
        };
        setCurrentUser(user);
        navigate('/', { replace: true });
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');
        setCurrentUser(null);
        navigate('/login', { replace: true });
    };

    // FIX: ProtectedLayout was missing return — it was an arrow function with a block body
    // that returned undefined. Adding return makes it render correctly.
    const ProtectedLayout = () => {
        if (!currentUser) {
            return <Navigate to="/login" replace />;
        }
        return (
            <Layout user={currentUser} onLogout={handleLogout}>
                <Outlet />
            </Layout>
        );
    };

    return (
        <Routes>
            <Route path="/login" element={
                currentUser
                    ? <Navigate to="/" replace />
                    : (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                            <Login onSubmit={handleAuthSubmit} onSwitchMode={() => navigate('/signup')} />
                        </div>
                    )
            } />

            <Route path="/signup" element={
                currentUser
                    ? <Navigate to="/" replace />
                    : (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                            <SignUp onSubmit={handleAuthSubmit} onSwitchMode={() => navigate('/login')} />
                        </div>
                    )
            } />

            {/* FIX: removed duplicate <Route path="/"> — now single protected layout route */}
            <Route path="/" element={<ProtectedLayout />}>
                <Route index          element={<Dashboard />} />
                <Route path="tasks"   element={<Tasks />} />
                <Route path="profile" element={<Profile />} />
            </Route>
        </Routes>
    );
};

export default App;
