const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/gocart';
        const baseUri = mongoUri.includes('?') ? mongoUri.split('?')[0] : mongoUri;
        const query = mongoUri.includes('?') ? `?${mongoUri.split('?').slice(1).join('?')}` : '';
        const finalMongoUri = baseUri.endsWith('/gocart') ? `${baseUri}${query}` : `${baseUri}/gocart${query}`;

        await mongoose.connect(finalMongoUri);
        console.log("MongoDB connected to GoCart");
    } 
    catch (error) {
        console.error("Error connecting to MongoDB:", error.message);
        process.exit(1);
    }
};

module.exports = connectDB;