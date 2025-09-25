const express = require("express");
const connectDB = require("./config/database");
const app = express();
const User = require("./models/user");



app.use(express.json());


app.post("/signup", async (req, res) => {

    console.log(req.body);
    const newUser = new User(req.body);
    await newUser.save();
    console.log("User created");
    res.send("User created!!!");
});




connectDB.then(() => {
    console.log("Database connected successfully");
    app.listen(3000, () => { console.log("Server started at port 3000"); });
});

app.use("/", (err, req, res, next) => {
    res.send("Ran !");
})



