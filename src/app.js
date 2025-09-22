const express = require("express");
const app = express();

app.listen(3000, () => { console.log("Server started at port 3000"); });

app.use("/", (err,req, res,next) => {
  console.log("This is error from home page");
})

app.use("/admin", (err,req, res,next) => {
    throw new Error("This is error from admin page");
    if(err){
        console.log("This is error from admin page");
        res.status(500).send("Something broke!");
    }   
 
});


app.get("/admin/getData", (req, res) => {
    res.send("This is absfjkslkjflksjdfklsjdklout page");
});

app.get("/about/us", (req, res,next) => {
    console.log("This is khiikhiii us page");
    res.send("This is about us page");
    next();
    console.log("This is about us page");
},(req, res, next) => {
    console.log("This is khiikhiii us page - 2");
    // next();
});

