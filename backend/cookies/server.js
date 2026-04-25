const cookieParser = require("cookie-parser");
const express = require("express");
const app = express();

app.use(cookieParser("secretcode"));

app.listen(3000, () => {
    console.log("Server is listening on port 3000");
});

app.get("/getsignedcookie",(req,res)=>{
    res.cookie("made-in","India",{signed:true});
    res.send("signed cookie sent");
})

app.get("/verify",(req,res)=>{
    console.log(req.signedCookies);
    res.send("verified");
})
app.get("/getcookies", (req, res) => {
    res.cookie("greet", "hello");
    res.send("Sent you a cookie!");
});

app.get("/greet",(req,res)=>{
    let {name="anonymous"}=req.cookies;
    res.send(`Hi,${name}`);
})

app.get("/", (req, res) => {
    console.dir(req.cookies);
    res.send("Root");
});
