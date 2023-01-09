const eventList = document.querySelector("#list");
const btn = document.querySelector("#button");
const websocketPath = '/websocket';

function createNote(message) {
  const elem = document.createElement("li");
  elem.innerText = `${new Date().toISOString().split("T")[1]} - ${message}`;
  return elem;
}

function addMessageToList(message) {
  eventList.append(createNote(message));
}

function getState() {
  if (document.visibilityState === "hidden") {
    return "hidden";
  }

  return document.hasFocus() ? "active" : "passive";
}

addMessageToList(`initial load - discarded: ${document.wasDiscarded}`);

// To track JS activity and websocket connections
const getWebsocket = () =>
  new Promise((res, rej) => {
    const ws = new WebSocket(websocketPath);
    ws.addEventListener("open", () => {
      res(ws);
    });
    ws.addEventListener("error", (err) => {
      console.error("WS error");
      rej("Error");
    });
  });

const ws = getWebsocket();

function logNextState(nextState, eventType) {
  const messege = `${eventType}, ${nextState}`;
  addMessageToList(messege);
  ws.then((wss) => wss.send(messege));
}

window.addEventListener(
  "pagehide",
  (event) => {
    const state = event.persisted ? "frozen" : "terminated";
    logNextState(state, "pagehide");
  },
  true
);

window.addEventListener(
  "freeze",
  () => {
    logNextState("frozen", "freeze");
  },
  true
);

["pageshow", "visibilitychange", "resume"].forEach((type) => {
  window.addEventListener(
    type,
    () => {
      logNextState(getState(), type);
    },
    true
  );
});

["focus", "blur"].forEach((type) => {
  window.addEventListener(
    type,
    (event) => {
      if (event.target === window) {
        logNextState(getState(), type);
      }
    },
    true
  );
});

// test how frequent a timer is, every 500ms
const btnHandle = () => {
  setInterval(() => {
    addMessageToList("500ms timer");
    ws.then((wss) => wss.send("500ms timer"));
  }, 500);
  btn.removeEventListener("click", btnHandle);
  btn.disabled = true;
};

btn.addEventListener("click", btnHandle);
