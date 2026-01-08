const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        mongoose.connect('mongodb+srv://merausername:merapassword@cluster0.aplfsth.mongodb.net/devTinder');
       
    }
    catch (err) {
        console.error("Database connection error:", err.message);
    }
}



console.log("Database connection in progress...");

module.exports = connectDB();


