const express = require("express");
const profileRouter = express.Router();
const userAuth = require("../middleware/auth");
profileRouter.get("/profile", userAuth, async (req, res) => {
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

module.exports = { profileRouter };