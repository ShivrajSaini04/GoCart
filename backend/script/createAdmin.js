const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

const User = require('../routes/models/User');

async function createAdmin(email, password) {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        
        // Check if admin already exists
        let user = await User.findOne({ email });
        
        if (user) {
            if (user.role === 'admin') {
                console.log('User is already an admin');
                return;
            }
            // Promote existing user to admin
            user.role = 'admin';
            user.verified = true;
            await user.save();
            console.log('User promoted to admin!');
        } else {
            // Create new admin user
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            
            user = new User({
                name: email.split('@')[0],
                email,
                password: hashedPassword,
                role: 'admin',
                verified: true
            });
            
            await user.save();
            console.log('Admin user created successfully!');
        }
        
        console.log('\nLogin with:', email, 'and your password');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
    }
}

// Use command line args or default email
const args = process.argv.slice(2);
const email = args[0] || process.env.USER_EMAIL || 'admin@gocart.com';
const password = args[1] || process.env.USER_PASS || 'admin123';

createAdmin(email, password);
