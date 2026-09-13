const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB...');

        const adminExists = await User.findOne({ email: 'admin@ssms.com' });
        if (!adminExists) {
            await User.create({
                name: 'System Admin',
                email: 'admin@ssms.com',
                password: 'password123',
                role: 'admin'
            });
            console.log('Admin user seeded!');
        } else {
            console.log('Admin user already exists.');
        }

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seedData();
