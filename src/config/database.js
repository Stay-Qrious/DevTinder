const mongoose = require('mongoose');

const connectDB = async () => {
mongoose.connect('mongodb+srv://merausername:merapassword@cluster0.aplfsth.mongodb.net/devTinder');}

 

console.log("Database connection in progress...");

module.exports = connectDB();


