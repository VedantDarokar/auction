const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Login Route
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.find({ username: username });
        if (!user || user.length === 0) return res.status(400).json({ msg: 'User not found' });

        // We are using find so it returns array, user[0]
        const validUser = user[0];

        const isMatch = await validUser.matchPassword(password);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

        const token = jwt.sign({ id: validUser._id, role: validUser.role, teamId: validUser.teamId }, process.env.JWT_SECRET, { expiresIn: '12h' });

        res.json({ token, user: { id: validUser._id, username: validUser.username, role: validUser.role, teamId: validUser.teamId } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
