// Importing the required modules
const WebSocketServer = require('ws');
const { v4 } = require('uuid');
const port = process.env.PORT || 8080;
 
// Creating a new websocket server
const wss = new WebSocketServer.Server({ port });

// Creating connection using websocket
wss.on("connection", ws => {
  const id = v4().split('-')[1];
  console.log(`new client connected, ${id}`);
  // sending message
  ws.on("message", data => {
      console.log(`#${id}: ${(new Date).toISOString()} - ${data}`)
  });
  // handling what to do when clients disconnects from server
  ws.on("close", () => {
      console.log(`#${id}: ${(new Date).toISOString()} the client has disconnected`);
  });
  // handling client connection error
  ws.onerror = function () {
      console.log(`#${id}: Some Error occurred`)
  }
});
console.log(`The WebSocket server is running on port ${port}`);