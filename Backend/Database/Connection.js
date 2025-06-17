const mongoose = require('mongoose');
require('dotenv').config();

module.exports.connection = async() =>{
    const mongo_url = process.env.MONGOOSE_URL;
    try { 
        await mongoose.connect(mongo_url);
        console.log('Connected to the Database');
    } catch {
        console.log(err);
    }
}

