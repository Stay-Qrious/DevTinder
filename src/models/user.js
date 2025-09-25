const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true ,minLength:4,maxLength:30},
    lastName: String,
    email: { type: String, required: true, unique: true,trim:true },
    password: String,
    age: { type: Number, min: 18, max: 100 },
    gender: { type: String,validate(val){if(!["male","female","other"].includes(val)){throw new Error("Gender is not valid")}} },
    photoUrl: String,
    about: { type: String, default: "Hello! I am new here." },
    skills: [String],
},
    { timestamps: true });


module.exports = mongoose.model("User", userSchema);