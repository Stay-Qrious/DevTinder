const express = require('express');
const requestRouter = express.Router();
const userAuth = require("../middleware/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");

requestRouter.post("/request/send/:status/:toUserId", userAuth, async (req, res) => {
    try {
        if (!req.user) {
            throw new Error("User not found");
        }
        const fromUserId = req.user.id;
        const toUserId = req.params.toUserId;
        const status = req.params.status;


        const allowedStatus = ["interested", "ignored"];
        if (!allowedStatus.includes(status)) {
            throw new Error("invalid status send by the user");
        }

        const connection = await ConnectionRequest.findOne({
            $or: [
                { fromUserId, toUserId },
                { fromUserId: toUserId, toUserId: fromUserId }
            ]
        });

        if (connection) {
            throw new Error("Relation already exists");
        }

        const toUser = await User.findById(toUserId);


        const newConnectionRequest = new ConnectionRequest({
            fromUserId,
            toUserId,
            status
        }
        )

        await newConnectionRequest.save();
        if (status === "interested") res.send(`${req.user.firstName} is ${status} in ${toUser.firstName} ${toUser.lastName} `);
        else res.send(`${req.user.firstName}  ${status} ${toUser.firstName} ${toUser.lastName} `);


    } catch (err) {
        console.error("Error details:", err.message);
        res.status(400).send("Errrror in sending connection request " + err.message);
    }
});

requestRouter.post("/request/review/:status/:requestId", userAuth, async (req, res) => {



    try {
        const { status, requestId } = req.params;
        const allowedStatus = ["accepted", "rejected"];
        if (!allowedStatus.includes(status)) {
            return res.status(400).json({ message: "Not permitted status" });
        }

        const request = await ConnectionRequest.findOne({
            _id: requestId,
            toUserId: req.user._id,
            status: "interested"
        });
        if (!request) {
            return res.status(400).json({ message: "No Request Found !" });
        }
        request.status = status;
        const data = await request.save();
        res.json({ message: "connection request " + status, data });


    } catch (err) {
        console.error("Error in review:", err.message);
        res.status(400).send("Error in reviewing requests " + err.message);
    }
})



module.exports = { requestRouter };