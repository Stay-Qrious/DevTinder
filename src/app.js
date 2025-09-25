const express = require("express");
const connectDB = require("./config/database");
const app = express();
const User = require("./models/user");



app.use(express.json());



app.get("/feed", async (req, res) => {

    const a = await User.find({});
    if (a.length === 0) {
        return res.status(404).send("No user found");
    }
    else { res.send(a); }
});

app.delete("/user", async (req, res) => {
    console.log(req.body);
    const userId = req.body.userId;
    const user = await User.findByIdAndDelete(userId);
    res.send("Deleted user");
});

app.patch("/user/:userId", async (req, res) => {

    console.log("Update request received");
    try {
        const userId = req.params?.userId;
        console.log(req.body);
        const allowedUpdates = ["photoUrl", "about", "skills", "age", "gender"];
        const isUpdateAllowed = Object.keys(req.body).every((k) => allowedUpdates.includes(k));
        if (!isUpdateAllowed) { throw new Error("Invalid updates!"); }
        await User.findByIdAndUpdate({ _id: userId }, req.body, { runValidators: true });
        res.send("User updated");
    } catch (err) {
        console.error("Error details:", err.message);
        res.status(400).send("Error in updating user");
    }
});




app.post("/signup", async (req, res) => {
    console.log("yha aaya tha");
    try {
        console.log(req.body);
        const newUser = new User(req.body);
        await newUser.save();
        console.log("User created");
        res.send("User created!!!");
    }
    catch (err) {
        console.error("Error details:", err.message);
        res.status(400).send("Error while creating user");
    }
});




connectDB.then(() => {
    console.log("Database connected successfully");
    app.listen(3000, () => { console.log("Server started at port 3000"); });
});

app.use("/", (err, req, res, next) => {
    res.send("Ran !");
})



