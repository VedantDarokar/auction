const dns = require('dns');
try {
    dns.setServers(['8.8.8.8']);
} catch (e) {
    console.log("Could not set DNS servers");
}
const mongoose = require('mongoose');
const User = require('./models/User');
const Team = require('./models/Team');
const Player = require('./models/Player');
require('dotenv').config();

// Use the URI from .env ONLY
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error('ERROR: MONGO_URI is missing from .env');
    process.exit(1);
}

(async () => {
    try {
        console.log('Connecting to MongoDB Atlas...');
        const conn = await mongoose.connect(MONGO_URI);
        console.log(`Connected to MongoDB Host: ${conn.connection.host}`);

        // Clear existing data
        console.log('Clearing old data...');
        // Only run this if we are SURE. For development/testing, fine.
        await User.deleteMany({});
        await Team.deleteMany({});
        await Player.deleteMany({});

        // 1. Create Admin
        const admin = new User({
            username: 'admin',
            password: 'password123',
            role: 'admin'
        });
        await admin.save();
        console.log('Created Admin User: [admin / password123]');

        // 2. Create Teams
        const teamNames = ['CSK', 'MI', 'RCB', 'KKR', 'SRH', 'PBKS', 'RR', 'DC', 'LSG', 'GT', 'KXI', 'PUN'];

        for (let name of teamNames) {
            const team = new Team({
                name: `${name} Super Team`,
                shortCode: name,
                purseRemaining: 100000000,
                totalRating: 0
            });
            await team.save();

            // Create User for Team
            const teamManagerName = `manager_${name.toLowerCase()}`;
            const teamUser = new User({
                username: teamManagerName,
                password: 'password123',
                role: 'client',
                teamId: team._id
            });
            await teamUser.save();
            // console.log(`Created Manager: [${teamManagerName} / password123]`);
        }
        console.log('Created 12 Teams and Managers (e.g., manager_csk / password123)');

        // 3. Create Players
        const playersData = [
            { name: "Virat Kohli", category: "Batsman", rating: 95, basePrice: 20000000 },
            { name: "Rohit Sharma", category: "Batsman", rating: 92, basePrice: 20000000 },
            { name: "Jasprit Bumrah", category: "Bowler", rating: 94, basePrice: 20000000 },
            { name: "Hardik Pandya", category: "All-Rounder", rating: 90, basePrice: 20000000 },
            { name: "MS Dhoni", category: "Wicketkeeper", rating: 88, basePrice: 20000000 },
            { name: "KL Rahul", category: "Batsman", rating: 89, basePrice: 20000000 },
            { name: "Ravindra Jadeja", category: "All-Rounder", rating: 91, basePrice: 20000000 },
            { name: "Rishabh Pant", category: "Wicketkeeper", rating: 88, basePrice: 20000000 },
            { name: "Mohammed Shami", category: "Bowler", rating: 87, basePrice: 20000000 },
            { name: "Suryakumar Yadav", category: "Batsman", rating: 93, basePrice: 20000000 },
            { name: "Shreyas Iyer", category: "Batsman", rating: 87, basePrice: 15000000 },
            { name: "Sanju Samson", category: "Wicketkeeper", rating: 86, basePrice: 15000000 },
            { name: "Yuzvendra Chahal", category: "Bowler", rating: 88, basePrice: 15000000 },
            { name: "Trent Boult", category: "Bowler", rating: 89, basePrice: 15000000 },
            { name: "Glenn Maxwell", category: "All-Rounder", rating: 88, basePrice: 15000000 }
        ];

        for (const p of playersData) {
            const player = new Player(p);
            await player.save();
        }
        console.log(`Created ${playersData.length} players`);

        console.log('--- SEEDING COMPLETE ---');
        console.log('You can now log in with Admin or Manager accounts.');
        process.exit(0);

    } catch (err) {
        console.error('Error during seeding:', err);
        process.exit(1);
    }
})();
