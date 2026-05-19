import React, { useCallback, useEffect, useState } from 'react';
import './index.css';
import { Navigate, Outlet, Route, Routes, useNavigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './components/Login';
import SignUp from './components/SignUp';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Profile from './pages/Profile';

// Defined OUTSIDE App so its function reference never changes between renders.
// If it were inside App, every navigation would cause App to re-render (via useNavigate),
// creating a new ProtectedLayout function, which makes React unmount+remount Layout
// entirely — triggering a fresh fetchTasks on every page change (the scroll jump bug).
const ProtectedLayout = ({ currentUser, onLogout }) => {
    if (!currentUser) return <Navigate to="/login" replace />;
    return (
        <Layout user={currentUser} onLogout={onLogout}>
            <Outlet />
        </Layout>
    );
};

const App = () => {
    const navigate = useNavigate();

    const [currentUser, setCurrentUser] = useState(() => {
        const stored = localStorage.getItem('currentUser');
        return stored ? JSON.parse(stored) : null;
    });

    useEffect(() => {
        if (currentUser) {
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
        } else {
            localStorage.removeItem('currentUser');
        }
    }, [currentUser]);

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

    // useCallback keeps this reference stable so Layout's fetchTasks dep doesn't change
    const handleLogout = useCallback(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');
        setCurrentUser(null);
        navigate('/login', { replace: true });
    }, [navigate]);

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

            <Route path="/" element={<ProtectedLayout currentUser={currentUser} onLogout={handleLogout} />}>
                <Route index        element={<Dashboard />} />
                <Route path="tasks"   element={<Tasks />} />
                <Route path="profile" element={<Profile />} />
            </Route>
        </Routes>
    );
};

export default App;
