const express = require("express");
const connectDB = require("./config/database");
const app = express();
const User = require("./models/user");


app.post("/signup", async (req, res) => {
    const newUser = new User({
        firstName: "John",
        lastName: "Doe",
        email: "johndoe@gmail.com",
        password: "password123",
        age: 25, gender: "male"
    });
    await newUser.save();
    console.log("User created");
    res.send("User created");
});




connectDB.then(() => {
    console.log("Database connected successfully");
    app.listen(3000, () => { console.log("Server started at port 3000"); });
});

app.use("/", (err, req, res, next) => {
    res.send("Ran !");
})



