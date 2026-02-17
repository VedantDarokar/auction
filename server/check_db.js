const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/auction_db';
// console.log("URI: ", MONGO_URI)

(async () => {
    try {
        await mongoose.connect(MONGO_URI);
        const userCount = await User.countDocuments();
        console.log(`User Count: ${userCount}`);

        if (userCount > 0) {
            const admin = await User.findOne({ username: 'admin' });
            console.log('Admin exists:', !!admin);
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
})();
