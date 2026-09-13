import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Clear any old localStorage session data
        localStorage.removeItem('user');

        const storedUser = sessionStorage.getItem('user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                sessionStorage.removeItem('user');
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const { data } = await axios.post(`${import.meta.env.VITE_AUTH_URL || 'http://localhost:5000/api'}/auth/login`, { email, password });
            setUser(data);
            sessionStorage.setItem('user', JSON.stringify(data));
            localStorage.removeItem('user');
            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Login failed',
            };
        }
    };

    const logout = () => {
        setUser(null);
        sessionStorage.removeItem('user');
        localStorage.removeItem('user');
    };

    const updateUser = (userData) => {
        setUser(prev => {
            const updated = { ...prev, ...userData };
            sessionStorage.setItem('user', JSON.stringify(updated));
            return updated;
        });
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, updateUser, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
