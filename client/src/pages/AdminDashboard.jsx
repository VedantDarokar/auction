import { Link } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSocket } from '../context/SocketContext';
import { AuctionStyles } from '../styles';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
    const socket = useSocket();
    const [players, setPlayers] = useState([]);
    const [teams, setTeams] = useState([]);
    const [selectedPlayerId, setSelectedPlayerId] = useState('');
    const [selectedTeamId, setSelectedTeamId] = useState('');
    const [soldPrice, setSoldPrice] = useState("");

    const [isSubmitting, setIsSubmitting] = useState(false);

    const parsePrice = (value) => {
        if (!value) return 0;
        const lowerVal = String(value).toLowerCase().trim();

        let multiplier = 1;
        let numStr = lowerVal;

        if (lowerVal.includes('cr')) {
            multiplier = 10000000;
            numStr = lowerVal.replace('cr', '');
        } else if (lowerVal.includes('l')) {
            multiplier = 100000;
            numStr = lowerVal.replace('l', '');
        }

        const num = parseFloat(numStr);
        return isNaN(num) ? 0 : num * multiplier;
    };

    const fetchPlayers = async () => {
        try {
            const res = await axios.get('/auction/players');
            // Filter unsold players
            setPlayers(res.data.filter(p => !p.isSold));
        } catch (err) {
            console.error(err);
        }
    };

    const fetchTeams = async () => {
        try {
            const res = await axios.get('/auction/teams');
            setTeams(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchPlayers();
        fetchTeams();

        if (socket) {
            socket.on('player_sold', () => {
                fetchPlayers();
                fetchTeams();
                toast.success('Player Sold Successfully!');
                // Reset form
                setSelectedPlayerId('');
                setSelectedTeamId('');
                setSoldPrice("");
                setIsSubmitting(false);
            });

            socket.on('auction_undo', () => {
                fetchPlayers();
                fetchTeams();
                // Toast is handled by the initiator's button handler usually, 
                // but for other clients we might want a notification. 
                // For now, just refresh data silently to avoid double toasts for admin.
            });
        }
        return () => {
            if (socket) {
                socket.off('player_sold');
                socket.off('auction_undo');
            }
        };
    }, [socket]);

    const handleSell = async () => {
        const finalPrice = parsePrice(soldPrice);

        if (!selectedPlayerId || !selectedTeamId || !finalPrice) {
            toast.error('Please fill all fields with valid price');
            return;
        }

        if (isSubmitting) return; // Prevent double click
        setIsSubmitting(true);

        try {
            await axios.post('/auction/sell', {
                playerId: selectedPlayerId,
                teamId: selectedTeamId,
                soldPrice: finalPrice
            });
            // Optimistic update: Remove player from list immediately
            setPlayers(prev => prev.filter(p => p._id !== selectedPlayerId));
            setSelectedPlayerId(''); // Clear selection immediately
        } catch (err) {
            toast.error(err.response?.data?.msg || 'Failed to sell player');
            setIsSubmitting(false); // Re-enable on error
        }
    };

    const handleUndo = async () => {
        if (confirm('Are you sure you want to UNDO the last sale?')) {
            try {
                await axios.post('/auction/undo');
                toast.info('Undo Successful');
                // Socket will trigger refresh
            } catch (err) {
                toast.error(err.response?.data?.msg || 'Undo failed');
            }
        }
    };

    const handleRedo = async () => {
        if (confirm('Are you sure you want to REDO the last undone sale?')) {
            try {
                await axios.post('/auction/redo');
                toast.success('Redo Successful');
                // Socket will trigger refresh
            } catch (err) {
                toast.error(err.response?.data?.msg || 'Redo failed');
            }
        }
    };

    // Calculate Leaderboard (sorted by total rating descending)
    const sortedTeams = [...teams].sort((a, b) => b.totalRating - a.totalRating);

    return (
        <div style={AuctionStyles.container}>
            <div style={AuctionStyles.overlay} />

            <div style={{ textAlign: 'center', marginBottom: '20px', position: 'relative', zIndex: 1 }}>
                <h1 style={AuctionStyles.header}>IPL AUCTION</h1>
                <h3 style={{ color: '#ccc', fontSize: '1rem', margin: '0 0 20px 0', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: '400' }}>by Mozilla Open Source Community</h3>

                {/* Navigation Buttons */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
                    <Link to="/admin" style={{ textDecoration: 'none' }}>
                        <button style={{ ...AuctionStyles.button, marginTop: 0, width: 'auto', background: 'linear-gradient(135deg, #4CAF50 0%, #087f23 100%)', boxShadow: '0 0 10px rgba(76, 175, 80, 0.4)' }}>🏠 Home</button>
                    </Link>
                    <Link to="/admin/leaderboard" style={{ textDecoration: 'none' }}>
                        <button style={{ ...AuctionStyles.button, marginTop: 0, width: 'auto' }}>🏆 Leaderboard</button>
                    </Link>
                    <Link to="/admin/squads" style={{ textDecoration: 'none' }}>
                        <button style={{ ...AuctionStyles.button, marginTop: 0, width: 'auto', background: 'linear-gradient(135deg, #2196F3 0%, #0b7dda 100%)', boxShadow: '0 0 10px rgba(33, 150, 243, 0.4)' }}>👥 Detailed Squads</button>
                    </Link>
                </div>
            </div>

            <div style={AuctionStyles.grid}>
                {/* Auction Form */}
                <div style={{ ...AuctionStyles.card, flex: '1 1 350px', maxWidth: '500px' }}>
                    <h3 style={{ color: '#FFD700', textTransform: 'uppercase', textAlign: 'center', marginBottom: '15px' }}>Sell Player</h3>

                    <label>Select Player:</label>
                    <select
                        style={AuctionStyles.input}
                        value={selectedPlayerId}
                        onChange={(e) => {
                            setSelectedPlayerId(e.target.value);
                            const p = players.find(pl => pl._id === e.target.value);
                            if (p) setSoldPrice(p.basePrice); // Default to base price
                        }}
                    >
                        <option value="">-- Select Player --</option>
                        {players.map(p => (
                            <option key={p._id} value={p._id}>
                                {p.name} ({p.category}) - Base: ₹{p.basePrice.toLocaleString()} - Rating: {p.rating}
                            </option>
                        ))}
                    </select>

                    <label>Select Team:</label>
                    <select
                        style={AuctionStyles.input}
                        value={selectedTeamId}
                        onChange={(e) => setSelectedTeamId(e.target.value)}
                    >
                        <option value="">-- Select Team --</option>
                        {teams.map(t => (
                            <option key={t._id} value={t._id}>
                                {t.name} (Purse: ₹{t.purseRemaining.toLocaleString()})
                            </option>
                        ))}
                    </select>

                    <label>Sold Price:</label>
                    <input
                        type="text"
                        style={AuctionStyles.input}
                        value={soldPrice}
                        onChange={(e) => setSoldPrice(e.target.value)}
                        placeholder="Enter price (e.g. 1.25 cr)"
                    />
                    {soldPrice && (
                        <div style={{ marginTop: '-10px', marginBottom: '10px', color: '#4CAF50', fontSize: '0.8rem', textAlign: 'right' }}>
                            Parsed: ₹{parsePrice(soldPrice).toLocaleString()}
                        </div>
                    )}

                    <button
                        style={{ ...AuctionStyles.button, cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.7 : 1 }}
                        onClick={handleSell}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'SELLING...' : 'CONFIRM SALE'}
                    </button>

                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                        <button
                            style={{ ...AuctionStyles.button, backgroundColor: '#f44336', color: '#fff', background: '#f44336', padding: '10px' }}
                            onClick={handleUndo}
                        >
                            ↩ UNDO
                        </button>
                        <button
                            style={{ ...AuctionStyles.button, backgroundColor: '#2196F3', color: '#fff', background: '#2196F3', padding: '10px' }}
                            onClick={handleRedo}
                        >
                            ↪ REDO
                        </button>
                    </div>
                </div>

                {/* Quick Leaderboard View */}
                <div style={{ ...AuctionStyles.card, flex: '1 1 350px', maxWidth: '500px', maxHeight: '500px', overflowY: 'auto' }}>
                    <h3 style={{ textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '15px', color: '#fff', textAlign: 'center' }}>Live Standings</h3>
                    <table style={AuctionStyles.table}>
                        <thead>
                            <tr>
                                <th style={AuctionStyles.th}>Team</th>
                                <th style={{ ...AuctionStyles.th, textAlign: 'right' }}>Purse Rem.</th>
                                <th style={{ ...AuctionStyles.th, textAlign: 'right' }}>Rating</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedTeams.map(t => (
                                <tr key={t._id}>
                                    <td style={AuctionStyles.td}>{t.shortCode}</td>
                                    <td style={{ ...AuctionStyles.td, textAlign: 'right', color: '#4CAF50', fontWeight: 'bold' }}>₹{(t.purseRemaining / 10000000).toFixed(2)} Cr</td>
                                    <td style={{ ...AuctionStyles.td, textAlign: 'right' }}>{t.totalRating}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
