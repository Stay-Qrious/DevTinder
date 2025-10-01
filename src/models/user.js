const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true, minLength: 4, maxLength: 30 },
    lastName: String,
    email: { type: String, required: true, unique: true, trim: true },
    password: { type: String, validator(val) { if (!validator.isStrongPassword(val)) throw new Error("This is not strong Password Baby") } },
    age: { type: Number, min: 18, max: 100 },
    gender: {
        type: String, enum: {
            values: ["male", "female", "chakka"],
            message: `{VALUE} is not supported`,
        }
    },
    photoUrl: { type: String, validate(val) { if (!validator.isURL(val)) { throw new Error("Photo URL is not valid") } } },
    about: { type: String, default: "Hello! I am new here." },
    skills: [String],
},
    { timestamps: true });

userSchema.methods.getJWT = function () {
    const token = jwt.sign({ _id: this._id }, "Devtinder@123", { expiresIn: '7d' });
    return token;
}

userSchema.methods.checkPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
}


module.exports = mongoose.model("User", userSchema);