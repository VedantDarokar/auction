import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSocket } from '../context/SocketContext';
import { AuctionStyles } from '../styles';

const ClientDashboard = () => {
    const socket = useSocket();
    const [teams, setTeams] = useState([]);
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const teamRes = await axios.get('/auction/teams');
            console.log("Teams Data:", teamRes.data);
            setTeams(teamRes.data);
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch teams:", err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();

        if (socket) {
            socket.on('player_sold', (data) => {
                console.log("Player Sold Event Received:", data);
                fetchData(); // Simplest way: re-fetch everything on update
                // Or update state locally for smoother animation
            });
            socket.on('teams_update', (data) => {
                console.log("Teams Update Recieved:", data);
                if (data) setTeams(data);
            });
        }
        return () => {
            if (socket) {
                socket.off('player_sold');
                socket.off('teams_update');
            }
        };
    }, [socket]);


    if (loading) return <div style={AuctionStyles.container}>Loading Auction Data...</div>;

    // Sort by rating for leaderboard
    const sortedTeams = [...teams].sort((a, b) => b.totalRating - a.totalRating);

    return (
        <div style={AuctionStyles.container}>
            <header style={AuctionStyles.header}>
                <h1>IPL MOCK AUCTION LIVE</h1>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '20px' }}>
                {/* Leaderboard Sidebar */}
                <div style={AuctionStyles.card}>
                    <h3 style={{ color: '#ffdd00', borderBottom: '1px solid #444', paddingBottom: '10px' }}>Leaderboard</h3>
                    <table style={AuctionStyles.table}>
                        <thead>
                            <tr>
                                <th style={AuctionStyles.th}>Rank</th>
                                <th style={AuctionStyles.th}>Team</th>
                                <th style={AuctionStyles.th}>Rating</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedTeams.map((team, index) => (
                                <tr key={team._id}>
                                    <td style={{ ...AuctionStyles.td, textAlign: 'center' }}>{index + 1}</td>
                                    <td style={AuctionStyles.td}>{team.name}</td>
                                    <td style={{ ...AuctionStyles.td, fontWeight: 'bold', color: '#00ff88' }}>{team.totalRating}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Team Details Grid */}
                <div>
                    <h3 style={{ marginBottom: '20px' }}>Team Portfolios</h3>
                    <div style={AuctionStyles.grid}>
                        {teams.map(team => (
                            <div key={team._id} style={{ ...AuctionStyles.card, position: 'relative' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                    <h4 style={{ margin: 0, color: '#ffdd00' }}>{team.shortCode}</h4>
                                    <span style={{ fontSize: '12px', color: '#aaa' }}>{team.playersBought.length} Players</span>
                                </div>
                                <div style={{ marginBottom: '10px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                                        <span>Purse Rem:</span>
                                        <span style={{ color: '#00ff88' }}>₹{(team.purseRemaining / 10000000).toFixed(2)} Cr</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                                        <span>Rating:</span>
                                        <span style={{ color: '#fff' }}>{team.totalRating}</span>
                                    </div>
                                </div>

                                <div style={{ maxHeight: '150px', overflowY: 'auto', borderTop: '1px solid #333', paddingTop: '10px' }}>
                                    {team.playersBought && team.playersBought.length > 0 ? (
                                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '12px' }}>
                                            {team.playersBought.map(p => (
                                                <li key={p._id} style={{ padding: '4px 0', borderBottom: '1px solid #222' }}>
                                                    {p.name} ({p.category.charAt(0)}) - ₹{(p.soldPrice / 10000000).toFixed(2)}Cr
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p style={{ fontSize: '12px', color: '#666', fontStyle: 'italic' }}>No players yet</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClientDashboard;
