const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const path = require('path');
const WebSocket = require('ws');

// Hashing and salting of stored passwords
const passport = require('passport');

// Manage authentication and user sessions
const session = require('session');
const MongoDBStore = require('connect-mongodb-session')(session);

// import our new Schema
const { Chat, User } = require('./mongoSchema');
// const mongoSchema = require('./mongoSchema');
// const Chat = mongoSchema.Chat;

// Specify the port on the command line
const PORT = (process.argv[2] || 3000);
app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
// app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
    store: new MongoDBStore({
        mongoUrl: '127.0.0.1:27017',
        collection: 'chatSessions',
    }, err=> console.log(err))
}));

app.use(passport.initialize());
app.use(passport.session());
const LocalStrategy = require('passport-local').Strategy;
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


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

app.get("/login", (req, res) => {
    if (req.isAuthenticated()) res.redirect("/chat");
    res.render("login");
});

app.post('/login', passport.authenticate('local', {failureRedirect: '/login', failureFlash: true}), (req, res) => {
    res.redirect("chat");
});

app.get('/logout', (req, res) => {
    req.logout(err => {
        if (err) console.log(err);
        res.redirect("/");
    });
});

app.get('/create-account', (req, res) => {
    if (req.isAuthenticated()) res.redirect("/chat");
    res.render("create-account");
})

app.post('/create-account', (req, res) => {
    if (req.isAuthenticated()) res.redirect("/chat");
    User.create({
        name: req.body.name,
        username: req.body.username,
        dateCreated: new Date()
    }).then(newUser => newUser.setPassword(req.body.password, () => newUser.save()));
    res.redirect("/chat");
});

app.get("/chat", (req, res) => {
    if (!req.isAuthenticated()) res.redirect("/login");
    res.render("chat-selection");
})




app.get("/wiki/:topic", (req, res) => {
    const topic = req.params.topic;
    if (WikiArticles[topic]) res.render("article", { article: WikiArticles[topic], topic });
    res.send("That page does not yet exist");
})

app.post("/wiki/:topic/new-section", (req, res) => {
    const topic = req.params.topic;
    WikiArticles[topic].push({ title: req.body.title, text: req.body.text });
    res.redirect(`/wiki/${topic}`);
})

app.get("/", (req, res) => {
    console.log("Yay! A new visitor!");
    // console.log(req);
    viewCount += 1;
    res.render("index.ejs", { viewCount, PORT } );
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

app.get("/chat/:username", (req, res) => {
    console.log(req.query.sender)
    console.log(req.params.username)
    res.render("chat", { sender: req.query.sender, reciever: req.params.username, PORT });
});



const httpServer = app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});

const wsServer = new WebSocket.Server( { noServer: true } );

httpServer.on('upgrade', async (request, socket, head) => {
    wsServer.handleUpgrade(request, socket, head, (ws) => {
        wsServer.emit('connection', ws, request);
    });
});

wsServer.on("connection", (ws) => {
    ws.on("message", (message) => {
        console.log(message);
        console.log(message.toLocaleString());

        wsServer.clients.forEach(client => {
            if (client.readyState == WebSocket.OPEN) client.send(message.toLocaleString());
        })
    })
})