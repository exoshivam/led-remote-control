const express = require("express");
const path = require("path");
const WebSocket = require("ws");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "public")));

const server = app.listen(PORT, () => {
  console.log(`Cloud server running on port ${PORT}`);
});

// WebSocket relay
const wss = new WebSocket.Server({ server });

let hardwareClient = null;

wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.on("message", (msg) => {
    try {
      const { type, data } = JSON.parse(msg);

      if (type === "register" && data === "hardware") {
        hardwareClient = ws;
        console.log("Hardware client registered");
      } else if (type === "color" && hardwareClient) {
        hardwareClient.send(JSON.stringify({ type: "color", data }));
      }
    } catch (e) {
      console.error("Invalid message:", msg);
    }
  });

  ws.on("close", () => {
    if (ws === hardwareClient) {
      hardwareClient = null;
      console.log("Hardware disconnected");
    }
  });
});
