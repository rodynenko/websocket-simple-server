const express = require('express');
const { parse } = require('url');
const WebSocketServer = require('ws');
const { v4 } = require('uuid');
const port = process.env.PORT || 8080;
 
const app = express();
const wss = new WebSocketServer.Server({ noServer: true });

// Serve static
app.use(express.static('public'));

// Creating connection using websocket
wss.on("connection", ws => {
  const id = v4().split('-')[1];
  console.log(`new client connected, ${id}`);
  ws._id = id;
  ws.on('message', data => {
      console.log(`#${id}: ${(new Date).toISOString()} - ${data}`)
  });
  ws.on('close', () => {
      console.log(`#${id}: ${(new Date).toISOString()} the client has disconnected`);
  });
  ws.onerror = function () {
      console.log(`#${id}: Some Error occurred`)
  }

  // CHECK ALIVE
  ws.isAlive = true;
  ws.on('pong', () => {
    ws.isAlive = true;
  });
});

// CHECK ALIVE
setInterval(() => {
  wss.clients.forEach((ws) => {
      if (!ws.isAlive) {
        console.log(`#${ws._id}: Was terminated by server`);
        return ws.terminate();
      }
      ws.isAlive = false;
      ws.ping(null, false, true);
  });
}, 10000);

const server = app.listen(port, () => {
  console.log(`Server started on port ${server.address().port}`);
});

server.on('upgrade', (request, socket, head) => {
  const { pathname } = parse(request.url);
  if (pathname === '/websocket') { 
    wss.handleUpgrade(request, socket, head, socket => {
      wss.emit('connection', socket, request);
    });
  } else {
    socket.destroy();
  }
});
