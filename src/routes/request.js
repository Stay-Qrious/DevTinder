const express = require('express');
const requestRouter = express.Router();
const userAuth = require("../middleware/auth");

requestRouter.patch("/sendConnectionRequest", userAuth, async (req, res) => {
    try {
        if (!req.user) {
            throw new Error("User not found");
        }
        res.send("Connection request sent successfully by the user " + req.user.firstName + " " + req.user.lastName);


    } catch (err) {
        console.error("Error details:", err.message);
        res.status(400).send("Error in sending connection request");
    }
});

module.exports = { requestRouter };