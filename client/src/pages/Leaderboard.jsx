import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSocket } from '../context/SocketContext';
import { AuctionStyles } from '../styles';
import { Link } from 'react-router-dom';

const Leaderboard = () => {
    const socket = useSocket();
    const [teams, setTeams] = useState([]);

    const fetchTeams = async () => {
        try {
            const res = await axios.get('/auction/teams');
            setTeams(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchTeams();
        if (socket) {
            socket.on('player_sold', fetchTeams);
            socket.on('auction_undo', fetchTeams);
        }
        return () => {
            if (socket) {
                socket.off('player_sold');
                socket.off('auction_undo');
            }
        };
    }, [socket]);

    const sortedTeams = [...teams].sort((a, b) => b.totalRating - a.totalRating);

    return (
        <div style={{ ...AuctionStyles.container, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={AuctionStyles.overlay} />
            <Link to="/admin" style={{ position: 'absolute', top: '20px', left: '20px', color: '#fff', textDecoration: 'none', fontSize: '1.2rem', zIndex: 10, fontWeight: 'bold' }}>⬅ Back to Home</Link>

            <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '900px' }}>
                <h1 style={{ ...AuctionStyles.header, marginBottom: '20px' }}>Full Leaderboard</h1>

                <div style={{ ...AuctionStyles.card, margin: 0, maxHeight: '85vh', overflow: 'hidden' }}>
                    <table style={AuctionStyles.table}>
                        <thead>
                            <tr>
                                <th style={AuctionStyles.th}>Team</th>
                                <th style={{ ...AuctionStyles.th, textAlign: 'right' }}>Purse Rem.</th>
                                <th style={{ ...AuctionStyles.th, textAlign: 'right' }}>Rating</th>
                                <th style={{ ...AuctionStyles.th, textAlign: 'right' }}>Squad Size</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedTeams.map(t => (
                                <tr key={t._id}>
                                    <td style={AuctionStyles.td}>{t.name} ({t.shortCode})</td>
                                    <td style={{ ...AuctionStyles.td, textAlign: 'right', color: '#4CAF50', fontWeight: 'bold' }}>₹{(t.purseRemaining / 10000000).toFixed(2)} Cr</td>
                                    <td style={{ ...AuctionStyles.td, textAlign: 'right' }}>{t.totalRating}</td>
                                    <td style={{ ...AuctionStyles.td, textAlign: 'right' }}>{t.playersBought?.length || 0}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Leaderboard;
