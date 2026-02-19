import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../lib/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            try {
                const response = await authAPI.getMe();
                setUser(response.data);
            } catch (err) {
                localStorage.removeItem('auth_token');
                localStorage.removeItem('user');
            }
        }
        setLoading(false);
    };

    const login = async (username, password) => {
        setError(null);
        try {
            const response = await authAPI.login(username, password);
            const { token, user: userData } = response.data;
            localStorage.setItem('auth_token', token);
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);
            return true;
        } catch (err) {
            setError(err.response?.data?.detail || 'Login gagal');
            return false;
        }
    };

    const register = async (username, password, name) => {
        setError(null);
        try {
            const response = await authAPI.register(username, password, name);
            const { token, user: userData } = response.data;
            localStorage.setItem('auth_token', token);
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);
            return true;
        } catch (err) {
            setError(err.response?.data?.detail || 'Registrasi gagal');
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, error, login, register, logout, setError }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
