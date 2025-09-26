const express = require("express");
const connectDB = require("./config/database");
const app = express();
const User = require("./models/user");
const { validateSignUpData } = require("./utils/validation");
const bcrypt = require("bcrypt");




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

app.get("/login", async (req, res) => {

    try{
        const {email, password} = req.body;
        const user = await User.findOne({email});
        if(!user){
            throw new Error("Invalid Credentials");
        }
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if(!isPasswordMatch){
            throw new Error("Invalid Credentials");
        }
        res.send("Login Successful");
    }
    catch(err){
        console.error("Error details:", err.message);
        res.status(400).send("Error in login: "+err.message);       }


});





app.post("/signup", async (req, res) => {
    try {
        //validation of data
        validateSignUpData(req);
        // encrypt password
        const passwordHash = await bcrypt.hash(req.body.password, 10);
        const { firstName, lastName, email, age ,gender, photoUrl, about, skills } = req.body;

        const newUser = new User(
            {
                firstName,
                lastName,
                email,
                password: passwordHash,
                age,
                gender,
                photoUrl,
                about,
                skills
            }
        );
        await newUser.save();
        console.log("User created");
        res.send("User created Successfully !!!");
    }
    catch (err) {
        console.error("Error details:", err.message);
        res.status(400).send("Error while creating user"+err.message);
    }
});




connectDB.then(() => {
    console.log("Database connected successfully");
    app.listen(3000, () => { console.log("Server started at port 3000"); });
});

app.use("/", (err, req, res, next) => {
    res.send("Ran !");
})



