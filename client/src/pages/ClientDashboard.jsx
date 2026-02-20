
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { AuctionStyles } from '../styles';

const ClientDashboard = () => {
    const socket = useSocket();
    const { user } = useAuth();
    const [teams, setTeams] = useState([]);
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
                fetchData();
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


    if (loading) return (
        <div style={{ ...AuctionStyles.container, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={AuctionStyles.overlay} />
            <h2 style={{ ...AuctionStyles.header, position: 'relative', zIndex: 1 }}>Loading Auction Data...</h2>
        </div>
    );

    // Identify My Team and Others
    const myTeam = user?.teamId ? teams.find(t => t._id === user.teamId) : null;
    const otherTeams = teams.filter(t => t._id !== user?.teamId).sort((a, b) => b.totalRating - a.totalRating);

    return (
        <div style={AuctionStyles.container}>
            <div style={AuctionStyles.overlay} />

            <div style={{ position: 'relative', zIndex: 1, paddingBottom: '20px' }}>
                <header style={{ marginBottom: '30px', textAlign: 'center' }}>
                    <h1 style={{ ...AuctionStyles.header, fontSize: '3rem', marginBottom: '10px' }}>MY TEAM DASHBOARD</h1>
                </header>

                <div style={{ maxWidth: '1800px', margin: '0 auto', padding: '0 20px', display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap' }}>

                    {/* MY TEAM SECTION - LEFT 30% */}
                    <div style={{ flex: '1 1 300px', maxWidth: '450px', width: '30%' }}>
                        {myTeam ? (
                            <div style={{ position: 'sticky', top: '20px' }}>
                                <h2 style={{ color: '#FFD700', borderBottom: '2px solid #FFD700', paddingBottom: '5px', marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '1.2rem' }}>Your Squad</h2>
                                <div style={{ ...AuctionStyles.card, background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.9) 100%)', border: '2px solid #FFD700', boxShadow: '0 0 20px rgba(255, 215, 0, 0.15)', transform: 'none', padding: '15px' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'center' }}>

                                        {/* Header */}
                                        <div>
                                            <h1 style={{ fontSize: '3rem', margin: 0, color: '#FFD700', fontFamily: 'Impact, sans-serif' }}>{myTeam.shortCode}</h1>
                                            <div style={{ fontSize: '1.1rem', color: '#fff' }}>{myTeam.name}</div>
                                        </div>

                                        {/* Main Stats Stacked */}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '10px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>
                                                <span style={{ color: '#ccc', textTransform: 'uppercase', fontSize: '0.9rem' }}>Purse Left</span>
                                                <span style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#4CAF50' }}>₹{(myTeam.purseRemaining / 10000000).toFixed(2)} Cr</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>
                                                <span style={{ color: '#ccc', textTransform: 'uppercase', fontSize: '0.9rem' }}>Squad Size</span>
                                                <span style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#fff' }}>{myTeam.playersBought.length}</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span style={{ color: '#ccc', textTransform: 'uppercase', fontSize: '0.9rem' }}>Rating</span>
                                                <span style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#00d2ff' }}>{myTeam.totalRating}</span>
                                            </div>
                                        </div>

                                        {/* Scrollable Player List for My Team */}
                                        <div style={{ marginTop: '10px', textAlign: 'left' }}>
                                            <h3 style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '5px', color: '#aaa', marginBottom: '10px', fontSize: '1rem' }}>Acquired Players</h3>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '500px', overflowY: 'auto', paddingRight: '5px' }}>
                                                {myTeam.playersBought && myTeam.playersBought.length > 0 ? (
                                                    myTeam.playersBought.map(p => (
                                                        <div key={p._id} style={{ background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '6px', borderLeft: `4px solid ${p.category === 'Batsman' ? '#FF5722' : p.category === 'Bowler' ? '#2196F3' : p.category === 'All-Rounder' ? '#9C27B0' : '#4CAF50'} `, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <div>
                                                                <div style={{ fontWeight: 'bold', fontSize: '0.95rem', color: '#fff' }}>{p.name}</div>
                                                                <div style={{ fontSize: '0.75rem', color: '#aaa' }}>{p.category}</div>
                                                            </div>
                                                            <div style={{ fontWeight: 'bold', color: '#FFD700', fontSize: '0.9rem' }}>₹{(p.soldPrice / 10000000).toFixed(2)} Cr</div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div style={{ textAlign: 'center', padding: '15px', color: '#666', fontSize: '0.9rem' }}>No players acquired yet.</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div style={{ padding: '20px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', textAlign: 'center' }}>
                                <h3>Team Not Found</h3>
                                <p>Please contact admin to assign a team to your account.</p>
                            </div>
                        )}
                    </div>

                    {/* OTHER TEAMS SECTION - RIGHT 70% */}
                    <div style={{ flex: '1', minWidth: '300px' }}>
                        <h2 style={{ color: '#fff', borderBottom: '1px solid #444', paddingBottom: '10px', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '2px' }}>Opponent Teams</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                            {otherTeams.map(team => (
                                <div key={team._id} style={{ ...AuctionStyles.card, display: 'flex', flexDirection: 'column', height: '350px' }}>
                                    <div style={{ paddingBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <h3 style={{ margin: 0, color: '#fff', fontSize: '1.5rem', fontFamily: 'Impact, sans-serif' }}>{team.shortCode}</h3>
                                            <div style={{ fontSize: '0.8rem', color: '#aaa' }}>{team.name}</div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ color: '#4CAF50', fontWeight: 'bold', fontSize: '1.1rem' }}>₹{(team.purseRemaining / 10000000).toFixed(2)} Cr</div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontSize: '0.9rem', color: '#ddd' }}>
                                        <div>Squad: {team.playersBought.length}</div>
                                        <div>Rating: <span style={{ color: '#00d2ff', fontWeight: 'bold' }}>{team.totalRating}</span></div>
                                    </div>

                                    <div style={{ flex: 1, overflowY: 'auto', paddingRight: '5px' }}>
                                        {team.playersBought && team.playersBought.length > 0 ? (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                                {team.playersBought.map(p => (
                                                    <div key={p._id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', padding: '5px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px' }}>
                                                        <span style={{ color: '#fff' }}>{p.name}</span>
                                                        <span style={{ color: '#FFD700' }}>₹{(p.soldPrice / 10000000).toFixed(2)}Cr</span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div style={{ textAlign: 'center', padding: '20px', color: '#555', fontSize: '0.85rem' }}>No players</div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClientDashboard;
