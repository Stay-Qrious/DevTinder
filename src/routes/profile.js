const express = require("express");
const profileRouter = express.Router();
const passwordRouter = express.Router();
const userAuth = require("../middleware/auth");
const User = require("../models/user");
const { validateProfileEditData } = require("../utils/validation");
const bcrypt = require("bcrypt");

profileRouter.get("/profile/view", userAuth, async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            throw new Error("User not found");
        }
        res.send(user);
    } catch (err) {
        console.error("Error details:", err.message);
        res.status(401).send("Please Login");
    }
});

profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
    try {
        const user = req.user;
        if (validateProfileEditData(req) == false) {
            throw new Error("Not valid update Data");
        }

        Object.keys(req.body).forEach((key) => { user[key] = req.body[key] });
        await user.save();
        res.json({ message: `${user.firstName} ,Profile Updated Successfully `, data: user });

    } catch (err) {
        console.error("Error details:", err.message);
        res.status(400).send(err.message);
    }
});

passwordRouter.patch("/profile/password", userAuth, async (req, res) => {
    console.log("Yha aaya tha");
    try {
        const user = req.user;
        const { password } = req.body;

        user.password = await bcrypt.hash(password, 10);
        user.save();
        res.send("Password Changed Successfully");
    }
    catch (e) {
        console.log("Theres an error " + e.message);
        res.send("Here's the error ", e.message);
    }

});





module.exports = { profileRouter, passwordRouter };