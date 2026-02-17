const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Reference to the user managing this team
    purseRemaining: { type: Number, default: 1000000000 }, // Example: 100 Cr
    totalRating: { type: Number, default: 0 },
    playersBought: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Player' }],
    logo: { type: String, default: '' },
    shortCode: { type: String, required: true } // e.g., CSK, MI
});

module.exports = mongoose.model('Team', teamSchema);
