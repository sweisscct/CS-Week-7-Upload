const express = require("express");
const bodyParser = require("body-parser");

const PORT = 3000;
app = express();
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    console.log("Yay! A new visitor!");
    console.log(req);
    res.sendFile("index.html", {root: __dirname});
});

app.get("/parsing/:display", (req, res) => {
    res.send(req.params.display);
});

app.get("/rest", (req, res) => {
    res.send(`The number is: ${req.query.number} and the text is: ${req.query.text}`);
});

// app.get("/", function (req, res) {
//     console.log("Yay! A new visitor!");
//     res.sendFile("index.html", {root: __dirname});
// });

app.get("/hello", (req, res) => {
    console.log("Yay! A new visitor!");
    res.send("<h1>Hello!!</h1>");
});

app.post("/cool-form", (req, res) => {
    if (req.body.password == "password") {
        res.redirect("/hello");
    }
    res.send(`The username is: ${req.body.username} and the password is: ${req.body.password}`)
});

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});