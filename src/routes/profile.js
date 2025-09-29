const express = require("express");
const profileRouter = express.Router();
const userAuth = require("../middleware/auth");
const User = require("../models/user");
const { validateProfileEditData } = require("../utils/validation");

profileRouter.get("/profile/view", userAuth, async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            throw new Error("User not found");
        }
        res.send("Profile data " + user);
    } catch (err) {
        console.error("Error details:", err.message);
        res.status(400).send("Error in fetching profile");
    }
});

profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
    try {
        const user = req.user;
        if (validateProfileEditData(req) == false) {
            throw new Error("Not valid update Data");
        }

        Object.keys(req.body).forEach((key) => { user[key] = req.body[key] });
        user.save();
        res.json({ message: `${user.firstName} ,Profile Updated Successfully `, data: user });




    } catch (err) {
        console.error("Error details:", err.message);
        res.status(400).send("Error in editing profile");
    }
});





module.exports = { profileRouter };