const eventList = document.querySelector("#list");
const btn = document.querySelector("#button");

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

function log(messege) {
  addMessageToList(messege);
  sendLog(messege);
}

function logNextState(nextState, eventType) {
  const messege = `${eventType}, ${nextState}`;
  log(messege);
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

window.addEventListener("pageshow", (event) => {
  const persisted = event.persisted
  logNextState(getState(), `pageshow:${persisted}`);
}, true);

["visibilitychange", "resume"].forEach((type) => {
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
    log("500ms timer");
  }, 500);
  btn.removeEventListener("click", btnHandle);
  btn.disabled = true;
};

btn.addEventListener("click", btnHandle);
