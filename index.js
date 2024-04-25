const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const path = require('path');

// Specify the port on the command line
const PORT = (process.argv[2] || 3000);
app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, 'public')));

let viewCount = 0;

let BlogPosts = [
    { title: "Cool title", text: "Some more cool text" },
    { title: "Another post", text: "Yet more text" }
]

let WikiArticles = {
    "cars" : [
        { title: "Cars", text: "Aren't cars cool? Who doesn't like cars?"}
    ],
    "books" : [
        { title: "Books", text: "Books are great! I need to read the ones I have before I get more though :("}
    ]
}

app.get("/wiki/:topic", (req, res) => {
    if (WikiArticles[req.params.topic]) res.render("article", { article: WikiArticles[req.params.topic] });
    res.send("That page does not yet exist");
})



app.get("/", (req, res) => {
    console.log("Yay! A new visitor!");
    console.log(req);
    viewCount += 1;
    res.render("index.ejs", { viewCount } );
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

app.get("/blog", (req, res) => {
    res.render("blog", { BlogPosts }); // BlogPosts: BlogPosts
})

app.post("/new-post", (req, res) => {
    BlogPosts.push({ title: req.body.title, text: req.body.text });
    res.redirect("/blog");
});



app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});