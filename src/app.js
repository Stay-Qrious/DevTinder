const express = require("express");
const app = express();

app.listen(3000, () => { console.log("Server started at port 3000"); });

app.use("/", (req, res) => {
    res.send("Hellll        asd  fa    dfasdv     fllv   vvvl    ll    sjflkasjflk");
})