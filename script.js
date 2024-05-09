const url = "ws://localhost:3123";
const wsServer = new WebSocket(url);

function sendMessage() {
    wsServer.send("Test message from client");
}
const button = document.getElementById("message");
button.addEventListener("click", () => {
    sendMessage();
})

// function messageGenerator(message, from) {

// }