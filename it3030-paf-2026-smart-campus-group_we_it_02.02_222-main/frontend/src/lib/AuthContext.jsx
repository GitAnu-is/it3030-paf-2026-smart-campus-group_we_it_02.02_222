import React, { useEffect, useState, createContext, useContext } from 'react';

const TOKEN_KEY = 'uniops_token';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';

const AVATAR_CACHE_PREFIX = 'uniops_avatar_url:';

const getAvatarCacheKey = (u) => {
    const identifier = u?.id || u?._id || u?.username || u?.email;
    if (!identifier)
        return null;
    return `${AVATAR_CACHE_PREFIX}${identifier}`;
};

const getCachedAvatar = (u) => {
    try {
        const key = getAvatarCacheKey(u);
        if (!key)
            return null;
        return localStorage.getItem(key);
    }
    catch {
        return null;
    }
};

const setCachedAvatar = (u, avatarUrl) => {
    try {
        const key = getAvatarCacheKey(u);
        if (!key)
            return;
        if (!avatarUrl) {
            localStorage.removeItem(key);
            return;
        }
        localStorage.setItem(key, avatarUrl);
    }
    catch {
        // ignore
    }
};

const normalizeUser = (u) => ({
    id: u.id,
    username: u.username,
    displayName: u.displayName,
    name: u.displayName || u.username,
    email: u.email,
    role: u.role,
    avatar: u.avatarUrl || getCachedAvatar(u),
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
                const me = await authFetch('/api/v1/auth/me', { method: 'GET' });
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
            const data = await authFetch('/api/v1/auth/login', {
                method: 'POST',
                body: JSON.stringify({ username, password }),
            });

            if (!data?.success) {
                throw new Error(data?.message || 'Invalid username or password');
            }
            if (!data?.token || !data?.user) {
                throw new Error('Login response missing token or user');
            }

            localStorage.setItem(TOKEN_KEY, data.token);
            const normalized = normalizeUser(data.user);
            setCachedAvatar(normalized, normalized.avatar);
            setUser(normalized);
            return { success: true };
        }
        catch (e) {
            return { success: false, error: e?.message || 'Login failed.' };
        }
    };
    const loginWithGoogle = async (idToken) => {
        try {
            const data = await authFetch('/api/v1/auth/google', {
                method: 'POST',
                body: JSON.stringify({ idToken }),
            });

            if (!data?.success) {
                throw new Error(data?.message || 'Google sign-in failed');
            }
            if (!data?.token || !data?.user) {
                throw new Error('Google login response missing token or user');
            }

            localStorage.setItem(TOKEN_KEY, data.token);
            const normalized = normalizeUser(data.user);
            setCachedAvatar(normalized, normalized.avatar);
            setUser(normalized);
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

    const updateProfile = async ({ displayName, avatarUrl }) => {
        try {
            const updated = await authFetch('/api/v1/auth/me', {
                method: 'PUT',
                body: JSON.stringify({ displayName, avatarUrl }),
            });
            const normalized = normalizeUser(updated);
            setCachedAvatar(normalized, normalized.avatar);
            setUser(normalized);
            return { success: true };
        }
        catch (e) {
            return { success: false, error: e?.message || 'Profile update failed.' };
        }
    };
    return (<AuthContext.Provider value={{
            user,
            isAuthenticated: !!user,
            loginWithCredentials,
            loginWithGoogle,
            logout,
            updateProfile,
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
