const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const path = require('path');
const WebSocket = require('ws');

// Hashing and salting of stored passwords
const passport = require('passport');

// Manage authentication and user sessions
const session = require('express-session');

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


passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Move this here
const LocalStrategy = require('passport-local').Strategy;
passport.use(new LocalStrategy(User.authenticate()));

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
    User.register(new User({ // change from create
        name: req.body.name,
        username: req.body.username,
        dateCreated: new Date()
    }), req.body.password, (err, user) => {
        if (err) {
            console.log(err);
            res.send(err);
        }
        passport.authenticate('local')(req, res, () => {
            console.log(req.session.passport);
            res.redirect("/chat");
        })
    })
});

app.get("/chat", (req, res) => {
    if (!req.isAuthenticated()) res.redirect("/login");
    User.find({"username": {$ne: req.session.passport.user}}).exec().then(users => res.render("chat-selection", { users }));
})

app.get("/chat/:username", (req, res) => {
    console.log(req.session.passport.user)
    console.log(req.params.username)
    // let chats;
    Chat.find({ $or: [ {$and:[ {sender: req.session.passport.user}, {reciever: req.params.username } ]}, {$and:[{ sender: req.params.username }, {reciever: req.session.passport.user } ]} ] })
    .exec().then(results => {
        chats = results.sort((a, b) => {
            return new Date(a.dateCreated) - new Date(b.dateCreated);
        });
        console.log(chats)
        res.render("chat", { sender: req.session.passport.user, reciever: req.params.username, PORT, chats });
    });

});


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
        // console.log(message);
        // console.log(message.toLocaleString());
        message = JSON.parse(message.toLocaleString());
        Chat.create({
            sender: message.sender,
            reciever: message.reciever,
            text: message.message,
            dateCreated: new Date()
        }).then(() => {
            wsServer.clients.forEach(client => {
                if (client.readyState == WebSocket.OPEN) client.send(JSON.stringify(message));
            })
        })
    })
})