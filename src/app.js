const express = require("express");
const connectDB = require("./config/database");
const app = express();
const cookieParser = require("cookie-parser");
const { authRouter } = require("./routes/auth");
const { profileRouter } = require("./routes/profile");
const { requestRouter } = require("./routes/request");




app.use(express.json());
app.use(cookieParser());
app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);







app.use("/", (err, req, res, next) => {
    res.send("Ran !");
})


connectDB.then(() => {
    console.log("Database connected successfully");
    app.listen(3000, () => { console.log("Server started at port 3000"); });
});





