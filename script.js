const url = "ws://localhost:3123";
const wsServer = new WebSocket(url);

function sendMessage() {
    wsServer.send("Test message from client");
}

sendMessage();

// function messageGenerator(message, from) {

// }