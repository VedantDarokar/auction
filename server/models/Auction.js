const mongoose = require('mongoose');

const auctionSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    startingBid: { type: Number, required: true },
    currentBid: { type: Number, default: 0 },
    endDate: { type: Date, required: true },
    seller: { type: String, required: true }, // Could be a User reference later
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Auction', auctionSchema);
