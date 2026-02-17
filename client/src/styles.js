import React from 'react';
import bgImage from './assets/background.webp';

// Enhanced CSS for "Premium IPL Theme" with Background Image
export const AuctionStyles = {
    container: {
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        backgroundRepeat: 'no-repeat',
        color: '#ffffff',
        minHeight: '100vh',
        height: '100vh', // Force single screen height
        fontFamily: "'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif",
        padding: '20px',
        overflow: 'hidden', // Prevent scrolling of main body
        position: 'relative',
        boxSizing: 'border-box'
    },
    // Dark Overlay to Ensure Readability
    overlay: {
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        height: '100%',
        width: '100%',
        position: 'absolute', // Absolute to container
        top: 0,
        left: 0,
        zIndex: 0,
        pointerEvents: 'none'
    },
    card: {
        backgroundColor: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(20px)',
        borderRadius: '20px',
        padding: '20px', // Reduced padding
        marginBottom: '15px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderTop: '1px solid rgba(255, 255, 255, 0.2)',
        transition: 'transform 0.3s ease',
        zIndex: 1,
        position: 'relative',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column'
    },
    header: {
        color: '#FFD700',
        textAlign: 'center',
        marginBottom: '20px', // Reduced
        textTransform: 'uppercase',
        letterSpacing: '5px',
        fontWeight: '900',
        textShadow: '0 5px 15px rgba(0,0,0,0.8), 0 0 30px rgba(255, 215, 0, 0.4)',
        fontSize: '2.5rem', // Smaller
        fontFamily: "'Impact', sans-serif"
    },
    button: {
        background: 'linear-gradient(135deg, #FFD700 0%, #FF8C00 100%)',
        color: '#000',
        border: 'none',
        padding: '12px 20px', // Smaller
        borderRadius: '12px',
        cursor: 'pointer',
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        marginTop: '15px',
        width: '100%',
        boxShadow: '0 0 15px rgba(255, 184, 0, 0.4)',
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.9rem'
    },
    input: {
        width: '100%',
        padding: '10px 12px', // Compact
        marginBottom: '12px',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        color: '#fff',
        borderRadius: '10px',
        fontSize: '1rem',
        outline: 'none',
        transition: 'border-color 0.3s, box-shadow 0.3s',
        boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.5)',
        boxSizing: 'border-box' // Fix width overflow
    },
    grid: {
        display: 'flex', // Changed to flex for Dashboard row
        flexDirection: 'row',
        justifyContent: 'center',
        gap: '20px',
        height: 'calc(100% - 100px)', // adjust for header
        alignItems: 'flex-start'
    },
    table: {
        width: '100%',
        borderCollapse: 'separate',
        borderSpacing: '0 4px',
        marginTop: '10px',
        fontSize: '0.85rem'
    },
    th: {
        padding: '10px',
        textAlign: 'left',
        color: '#00d2ff',
        textTransform: 'uppercase',
        fontSize: '0.75rem',
        letterSpacing: '1px',
        fontWeight: '700',
        borderBottom: '2px solid rgba(255, 255, 255, 0.1)'
    },
    td: {
        padding: '10px',
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderRadius: '6px',
        color: '#f0f0f0',
        fontSize: '0.9rem',
        fontWeight: '500',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    highlightor: {
        color: '#00ff88',
        fontWeight: 'bold',
        textShadow: '0 0 10px rgba(0, 255, 136, 0.3)'
    }
};
