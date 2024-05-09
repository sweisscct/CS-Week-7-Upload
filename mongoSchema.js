const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/chatSessions')
    .then(conn => console.log(conn.models));
const Schema = mongoose.Schema;

const chatSchema = new Schema({
    sender: String,
    reciever: String,
    _id: String,
    dateCreated: Date,
    text: String
});

const Chat = mongoose.model("Chat", chatSchema);

const userSchema = new Schema({
    name: String,
    username: String,
    password: String,
    dateCreated: Date,
    chats: []
});
userSchema.plugin(passportLocalMongoose);
const User = mongoose.model("User", userSchema);

module.exports = {
    Chat,
    User
}