const express = require("express");
const userAuth = require("../middleware/auth");
const ConnectionRequest = require("../models/connectionRequest");
const userRouter = express.Router();
const User = require("../models/user");
const userSafeData = "firstName lastName photoUrl about gender skills";


userRouter.get("/user/requests/received", userAuth, async (req, res) => {


    try {
        const data = await ConnectionRequest.find({
            toUserId: req.user._id,
            status: "interested"
        }).populate("fromUserId", userSafeData);

        res.json({
            message: "Here you go !",
            data
        })
    }
    catch (e) {
        console.log("Got error ", e.message);
        res.status(400).json({
            message: "Here's the error" + e.message
        })
    }

})


userRouter.get("/user/connections", userAuth, async (req, res) => {
    try {

        const connectionRequests = await ConnectionRequest.find({
            $or: [
                { fromUserId: req.user._id, status: "accepted" },
                { toUserId: req.user._id, status: "accepted" }

            ]
        }).populate("fromUserId", userSafeData).populate("toUserId", userSafeData);
        const data = connectionRequests.map((row) => {
            if (row.fromUserId._id.toString() === req.user._id.toString()) {
                return row.toUserId
            }
            else return row.fromUserId
        });


        console.log(data);
        res.json({ data })

    }
    catch (e) {
        res.status(400).json({ message: `failed to get the connections because of  ${e.message}` });
    }
})

userRouter.get("/feed", userAuth, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || 10;
        limit = (limit > 50) ? 50 : limit;

        const skip = (page - 1) * limit;

        const connectionRequests = await ConnectionRequest.find({
            $or: [{ fromUserId: req.user._id }, { toUserId: req.user._id }]
        }).select("fromUserId toUserId");

        const hideUsersFromFeed = new Set();
        connectionRequests.forEach((k) => {
            hideUsersFromFeed.add(k.fromUserId.toString());
            hideUsersFromFeed.add(k.toUserId.toString());
        });
        hideUsersFromFeed.add(req.user._id.toString());

        const users = await User.find({
            _id: { $nin: Array.from(hideUsersFromFeed) }
        }).select(userSafeData).skip(skip).limit(limit);

        res.send(users);





    }
    catch (e) {
        console.log("Error ", e.message);
        res.status(400).json({
            message: `Got the error ${e.message}`
        })
    }
})

module.exports = userRouter;