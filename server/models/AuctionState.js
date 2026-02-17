const mongoose = require('mongoose');

const auctionStateSchema = new mongoose.Schema({
    isSessionActive: { type: Boolean, default: false },
    currentTeamTurn: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', default: null }, // Optional: If turn-based
    lastSoldPlayer: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', default: null },
    transactions: [{
        player: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
        team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
        amount: Number,
        timestamp: { type: Date, default: Date.now }
    }],
    undoneTransactions: [{
        player: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
        team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
        amount: Number,
        timestamp: { type: Date, default: Date.now }
    }]
});

module.exports = mongoose.model('AuctionState', auctionStateSchema);
