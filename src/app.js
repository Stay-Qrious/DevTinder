const express = require("express");
const connectDB = require("./config/database");
const app = express();
const User = require("./models/user");
const { validateSignUpData } = require("./utils/validation");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const userAuth = require("./middleware/auth");



app.use(express.json());
app.use(cookieParser());
app.get("/login", async (req, res) => {

    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            throw new Error("Invalid Credentials");
        }
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            throw new Error("Invalid Credentials");
        }
        const token = jwt.sign({ _id: user._id }, "Devtinder@123", { expiresIn: '7d' });

        res.cookie("token", token);
        res.send("Login Successful");
    }
    catch (err) {
        console.error("Error details:", err.message);
        res.status(400).send("Error in login: " + err.message);
    }


});

app.post("/signup", async (req, res) => {
    try {
        //validation of data
        validateSignUpData(req);
        // encrypt password
        const passwordHash = await bcrypt.hash(req.body.password, 10);
        const { firstName, lastName, email, age, gender, photoUrl, about, skills } = req.body;

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
        res.status(400).send("Error while creating user" + err.message);
    }
});


app.get("/profile", userAuth, async (req, res) => {
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


app.patch("/sendConnectionRequest", userAuth, async (req, res) => {
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

app.use("/", (err, req, res, next) => {
    res.send("Ran !");
})


connectDB.then(() => {
    console.log("Database connected successfully");
    app.listen(3000, () => { console.log("Server started at port 3000"); });
});





