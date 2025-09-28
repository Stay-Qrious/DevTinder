const express = require('express');
const authRouter = express.Router();
const User = require("../models/user");
const { validateSignUpData } = require("../utils/validation");
const bcrypt = require("bcrypt");

authRouter.get("/login", async (req, res) => {

    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            throw new Error("Invalid Credentials");
        }
        const isPasswordMatch = await user.checkPassword(password);
        if (!isPasswordMatch) {
            throw new Error("Invalid Credentials");
        }
        const token = user.getJWT();

        res.cookie("token", token);
        res.send("Login Successful");
    }
    catch (err) {
        console.error("Error details:", err.message);
        res.status(400).send("Error in login: " + err.message);
    }


});

authRouter.post("/signup", async (req, res) => {
    try {
        //validation of data
        validateSignUpData(req);
        // encrypt password
        const passwordHash = await bcrypt.hash(req.body.password, 10);
        const { firstName, lastName, email, age, gender, photoUrl, about, skills } = req.body;

        const newUser = new User(
            {
                firstName,
                lastName,
                email,
                password: passwordHash,
                age,
                gender,
                photoUrl,
                about,
                skills
            }
        );
        await newUser.save();
        console.log("User created");
        res.send("User created Successfully !!!");
    }
    catch (err) {
        console.error("Error details:", err.message);
        res.status(400).send("Error while creating user" + err.message);
    }
});


module.exports = { authRouter };