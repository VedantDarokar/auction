const express = require('express');
const router = express.Router();
const Player = require('../models/Player');
const Team = require('../models/Team');
const auth = require('../middleware/auth');
const AuctionState = require('../models/AuctionState');

// Setup Socket first
let io;

// Middleware to inject io
const setIo = (socketIoInstance) => {
    io = socketIoInstance;
};

// --- Player Management (Admin) ---

// Add Player
router.post('/players', auth, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ msg: 'Admin only' });
    try {
        const newPlayer = new Player(req.body);
        await newPlayer.save();
        res.json(newPlayer);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Helper to get or create AuctionState
const getAuctionState = async () => {
    let state = await AuctionState.findOne();
    if (!state) {
        state = new AuctionState({ isSessionActive: true });
        await state.save();
    }
    return state;
};

// Set Player as Sold (Auction Logic)
router.post('/sell', auth, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ msg: 'Admin only' });

    const { playerId, teamId, soldPrice } = req.body;

    try {
        const player = await Player.findById(playerId);
        const team = await Team.findById(teamId);

        if (!player || !team) return res.status(404).json({ msg: 'Player or Team not found' });
        if (player.isSold) return res.status(400).json({ msg: 'Player already sold' });
        if (team.purseRemaining < soldPrice) return res.status(400).json({ msg: 'Insufficient purse' });

        // Update Team Stats
        team.purseRemaining -= soldPrice;
        team.playersBought.push(player._id);
        team.totalRating += player.rating;
        await team.save();

        // Update Player Stats
        player.isSold = true;
        player.soldTo = team._id;
        player.soldPrice = soldPrice;
        await player.save();

        // Update Auction State (Transaction Log)
        const state = await getAuctionState();
        state.transactions.push({
            player: player._id,
            team: team._id,
            amount: soldPrice
        });
        state.undoneTransactions = []; // Clear redo stack on new action
        await state.save();

        // Emit socket events
        if (io) {
            io.emit('player_sold', {
                playerName: player.name,
                teamName: team.name,
                price: soldPrice,
                teamId: team._id,
                rating: player.rating
            });
            const allTeams = await Team.find().populate('playersBought');
            io.emit('teams_update', allTeams);
        }

        res.json({ msg: 'Player Sold', player, team });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// Undo Last Sale
router.post('/undo', auth, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ msg: 'Admin only' });

    try {
        const state = await getAuctionState();
        if (state.transactions.length === 0) return res.status(400).json({ msg: 'Nothing to undo' });

        const lastTransaction = state.transactions.pop();
        const { player: playerId, team: teamId, amount } = lastTransaction;

        const player = await Player.findById(playerId);
        const team = await Team.findById(teamId);

        if (player && team) {
            // Reverse effects
            team.purseRemaining += amount;
            team.playersBought.pull(playerId);
            team.totalRating -= player.rating;
            await team.save();

            player.isSold = false;
            player.soldTo = null;
            player.soldPrice = 0;
            await player.save();

            // Push to redo stack
            state.undoneTransactions.push(lastTransaction);
            await state.save();

            // Emit updates
            if (io) {
                io.emit('auction_undo', { playerId, teamId }); // Frontend can refetch
                const allTeams = await Team.find().populate('playersBought');
                io.emit('teams_update', allTeams);
                // Removed player_sold emit to avoid "Sold" toast on undo
            }

            res.json({ msg: 'Undo successful', lastTransaction });
        } else {
            // If data corrupted/deleted, just save state change
            await state.save();
            res.status(404).json({ msg: 'Target player or team not found during undo' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// Redo 
router.post('/redo', auth, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ msg: 'Admin only' });

    try {
        const state = await getAuctionState();
        if (state.undoneTransactions.length === 0) return res.status(400).json({ msg: 'Nothing to redo' });

        const transactionToRedo = state.undoneTransactions.pop();
        const { player: playerId, team: teamId, amount } = transactionToRedo;

        const player = await Player.findById(playerId);
        const team = await Team.findById(teamId);

        if (player && team) {
            // Re-apply sale
            team.purseRemaining -= amount;
            team.playersBought.push(playerId);
            team.totalRating += player.rating;
            await team.save();

            player.isSold = true;
            player.soldTo = teamId;
            player.soldPrice = amount;
            await player.save();

            state.transactions.push(transactionToRedo);
            await state.save();

            // Emit updates
            if (io) {
                io.emit('player_sold', { // Reuse this event to trigger refreshes
                    playerName: player.name,
                    teamName: team.name,
                    price: amount,
                    teamId: team._id,
                    rating: player.rating
                });
                const allTeams = await Team.find().populate('playersBought');
                io.emit('teams_update', allTeams);
            }
            res.json({ msg: 'Redo successful' });
        } else {
            await state.save();
            res.status(404).json({ msg: 'Target player or team not found during redo' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// Get All Players Unsold
// Get All Teams (Public/Client)
router.get('/teams', auth, async (req, res) => {
    try {
        const teams = await Team.find().populate('playersBought');
        res.json(teams);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/players', auth, async (req, res) => {
    try {
        const players = await Player.find();
        res.json(players);
    } catch (err) {
        res.status(500).json(err);
    }
})

module.exports = { router, setIo };
