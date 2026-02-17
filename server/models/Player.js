const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, enum: ['Batsman', 'Bowler', 'All-Rounder', 'Wicketkeeper'], required: true },
    rating: { type: Number, required: true },
    basePrice: { type: Number, required: true },
    isSold: { type: Boolean, default: false },
    soldTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', default: null },
    soldPrice: { type: Number, default: 0 }
});

module.exports = mongoose.model('Player', playerSchema);
