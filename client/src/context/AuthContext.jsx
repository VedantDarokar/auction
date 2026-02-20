import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    // Configure axios default
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    axios.defaults.baseURL = `${API_URL}/api`;
    if (token) {
        axios.defaults.headers.common['x-auth-token'] = token;
    }

    const login = async (username, password) => {
        try {
            const res = await axios.post('/auth/login', { username, password });
            localStorage.setItem('token', res.data.token);
            axios.defaults.headers.common['x-auth-token'] = res.data.token;
            setUser(res.data.user);
            setToken(res.data.token);
            toast.success(`Welcome ${res.data.user.username}`);
            return true;
        } catch (err) {
            toast.error(err.response?.data?.msg || 'Login Failed');
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['x-auth-token'];
        setUser(null);
        setToken(null);
    };

    // On refresh, re-set user from token (optional: verify token with backend if wanted)
    // For simplicity, we trust token existence for "loading" state but ideally decode/verify
    useEffect(() => {
        // Decoding token on client side is possible but better to verify with backend
        // Or just store user info in localStorage too
        if (token) {
            // Try to fetch user data or decode. For now assume user can persist via re-login
            // In real app, create getMe endpoint.
            const storedUser = JSON.parse(localStorage.getItem('user'));
            if (storedUser) setUser(storedUser);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        if (user) localStorage.setItem('user', JSON.stringify(user));
        else localStorage.removeItem('user');
    }, [user]);

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
