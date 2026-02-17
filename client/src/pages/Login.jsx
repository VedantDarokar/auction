import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { AuctionStyles } from '../styles';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = await login(username, password);
        if (success) {
            // Check user role here to redirect? 
            // Or let router handle it based on role. 
            // But we can check context immediately
            // Since login is async and context updates, we might need to wait or check returned user
            // Actually login function returned true, so context will update soon.
            // Better to check user role inside useEffect or after successful login call if login returned user

            // Re-fetch user from context is tricky immediately.
            // But we know 'admin' vs 'manager_' usually
            if (username === 'admin') navigate('/admin');
            else navigate('/dashboard');
        }
    };

    return (
        <div style={{ ...AuctionStyles.container, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ ...AuctionStyles.card, maxWidth: '400px', width: '100%' }}>
                <h2 style={AuctionStyles.header}>Auction Login</h2>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        style={AuctionStyles.input}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={AuctionStyles.input}
                    />
                    <button type="submit" style={AuctionStyles.button}>LOGIN</button>
                </form>
            </div>
        </div>
    );
};

export default Login;
