import React, { useEffect, useState, createContext, useContext } from 'react';

const TOKEN_KEY = 'uniops_token';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const normalizeUser = (u) => ({
    id: u.id,
    name: u.displayName || u.username,
    email: u.email,
    role: u.role,
    avatar: u.avatarUrl,
});

const authFetch = async (path, options = {}) => {
    const token = localStorage.getItem(TOKEN_KEY);
    const res = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {}),
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });
    if (!res.ok) {
        let message = `Request failed (${res.status})`;
        const contentType = res.headers.get('content-type') || '';
        try {
            if (contentType.includes('application/json') || contentType.includes('application/problem+json')) {
                const data = await res.json();
                message = data?.detail || data?.message || data?.title || message;
            }
            else {
                const text = await res.text();
                if (text)
                    message = text;
            }
        }
        catch {
            // ignore
        }
        throw new Error(message);
    }
    return res.json();
};
const AuthContext = createContext(undefined);
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        const bootstrap = async () => {
            const token = localStorage.getItem(TOKEN_KEY);
            if (!token) {
                setIsLoading(false);
                return;
            }
            try {
                const me = await authFetch('/auth/me', { method: 'GET' });
                setUser(normalizeUser(me));
            }
            catch {
                localStorage.removeItem(TOKEN_KEY);
                setUser(null);
            }
            finally {
                setIsLoading(false);
            }
        };
        bootstrap();
    }, []);
    const loginWithCredentials = async (username, password) => {
        try {
            const data = await authFetch('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ username, password }),
            });
            localStorage.setItem(TOKEN_KEY, data.token);
            setUser(normalizeUser(data.user));
            return { success: true };
        }
        catch (e) {
            return { success: false, error: e?.message || 'Login failed.' };
        }
    };
    const loginWithGoogle = async (idToken) => {
        try {
            const data = await authFetch('/auth/google', {
                method: 'POST',
                body: JSON.stringify({ idToken }),
            });
            localStorage.setItem(TOKEN_KEY, data.token);
            setUser(normalizeUser(data.user));
            return { success: true };
        }
        catch (e) {
            return { success: false, error: e?.message || 'Google sign-in failed.' };
        }
    };
    const logout = () => {
        setUser(null);
        localStorage.removeItem(TOKEN_KEY);
    };
    return (<AuthContext.Provider value={{
            user,
            isAuthenticated: !!user,
            loginWithCredentials,
            loginWithGoogle,
            logout,
            isLoading,
        }}>
      {children}
    </AuthContext.Provider>);
};
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
