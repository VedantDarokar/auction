import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSocket } from '../context/SocketContext';
import { AuctionStyles } from '../styles';
import { Link } from 'react-router-dom';

const Squads = () => {
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
    }, [socket]);

    const getRoleCounts = (players) => {
        const counts = { Batsman: 0, Bowler: 0, Wicketkeeper: 0, 'All-Rounder': 0 };
        players.forEach(p => {
            if (counts[p.category] !== undefined) counts[p.category]++;
        });
        return counts;
    };

    return (
        <div style={{ ...AuctionStyles.container, overflow: 'auto' }}>
            <div style={AuctionStyles.overlay} />
            <div style={{ position: 'relative', zIndex: 1, padding: '20px' }}>
                <Link to="/admin" style={{ display: 'inline-block', marginBottom: '20px', color: '#fff', textDecoration: 'none', fontSize: '1.2rem' }}>⬅ Back to Home</Link>
                <h1 style={AuctionStyles.header}>Detailed Squads</h1>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '30px' }}>
                    {teams.map(team => {
                        const roleCounts = getRoleCounts(team.playersBought || []);
                        return (
                            <div key={team._id} style={{ ...AuctionStyles.card, minHeight: '350px', display: 'flex', flexDirection: 'column' }}>
                                <div style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '15px', marginBottom: '20px' }}>
                                    <h2 style={{ color: '#FFD700', margin: '0', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '1.5rem' }}>{team.name} ({team.shortCode})</h2>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '1.1rem' }}>
                                        <span>Purse: <span style={{ color: '#4CAF50', fontWeight: 'bold' }}>₹{(team.purseRemaining / 10000000).toFixed(2)} Cr</span></span>
                                        <span>Rating: {team.totalRating}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px', fontSize: '0.9rem', color: '#aaa' }}>
                                        <span>Squad Size: {team.playersBought.length}</span>
                                    </div>
                                </div>

                                {/* Role Breakdown */}
                                <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '20px', backgroundColor: 'rgba(0, 0, 0, 0.3)', padding: '10px', borderRadius: '10px' }}>
                                    <div title="Batsman">🏏 <span style={{ color: '#fff' }}>{roleCounts.Batsman}</span></div>
                                    <div title="Bowler">⚾ <span style={{ color: '#fff' }}>{roleCounts.Bowler}</span></div>
                                    <div title="All-Rounder">⚔️ <span style={{ color: '#fff' }}>{roleCounts['All-Rounder']}</span></div>
                                    <div title="Wicketkeeper">🧤 <span style={{ color: '#fff' }}>{roleCounts.Wicketkeeper}</span></div>
                                </div>

                                {/* Players List */}
                                <div style={{ flex: 1, overflowY: 'auto', maxHeight: '400px', paddingRight: '5px' }}>
                                    {team.playersBought && team.playersBought.length > 0 ? (
                                        <table style={AuctionStyles.table}>
                                            <thead>
                                                <tr>
                                                    <th style={AuctionStyles.th}>Name</th>
                                                    <th style={AuctionStyles.th}>Role</th>
                                                    <th style={{ ...AuctionStyles.th, textAlign: 'right' }}>Price</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {team.playersBought.map(p => (
                                                    <tr key={p._id}>
                                                        <td style={AuctionStyles.td}>{p.name}</td>
                                                        <td style={{ ...AuctionStyles.td, color: '#aaa', fontSize: '0.9em' }}>{p.category}</td>
                                                        <td style={{ ...AuctionStyles.td, textAlign: 'right', color: '#4CAF50' }}>₹{(p.soldPrice / 10000000).toFixed(2)} Cr</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    ) : (
                                        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', marginTop: '40px', fontStyle: 'italic' }}>No players yet</p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default Squads;
