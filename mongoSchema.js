const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

mongoose.connect('127.0.0.1:27017')
    .then(conn => console.log(conn.models));
const Schema = mongoose.Schema;

const chatSchema = new Schema({
    sender: User,
    reciever: User,
    _id: String,
    dateCreated: Date,
    text: String
});

const Chat = mongoose.models("Chat", chatSchema);

const userSchema = new Schema({
    name: String,
    username: String,
    dateCreated: Date,
    chats: [Chat]
});
userSchema.plugin(passportLocalMongoose);
const User = mongoose.models("User", userSchema);

module.exports = {
    Chat,
    User
}