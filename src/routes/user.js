const express = require("express");
const userAuth = require("../middleware/auth");
const ConnectionRequest = require("../models/connectionRequest");
const userRouter = express.Router();
const userSafeData = "firstName lastName photoUrl about gender skills"

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

module.exports = userRouter;