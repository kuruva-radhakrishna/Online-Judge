const mongoose = require('mongoose');
module.exports.connection = async() =>{
    const mongo_url = process.env.MONGOOSE_URL;
    try { 
        await mongoose.connect(mongo_url);
        console.log('Connected to the Database');
    } catch (err){
        console.log('DB is not connected');
    }
}

