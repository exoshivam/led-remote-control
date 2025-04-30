const express = require("express");
const path = require("path");
const http = require("http");
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let hardwareSocket = null;

wss.on("connection", (ws) => {
  console.log("New WebSocket connection");

  ws.on("message", (msg) => {
    try {
      const { type, data } = JSON.parse(msg);

      if (type === "register" && data === "hardware") {
        hardwareSocket = ws;
        console.log("Hardware connected");
      } else if (
        type === "color" &&
        hardwareSocket &&
        hardwareSocket.readyState === WebSocket.OPEN
      ) {
        hardwareSocket.send(JSON.stringify({ type: "color", data }));
        console.log("Forwarded color to hardware:", data);
      }
    } catch (err) {
      console.error("Failed to parse message:", err);
    }
  });

  ws.on("close", () => {
    if (ws === hardwareSocket) {
      hardwareSocket = null;
      console.log("Hardware disconnected");
    }
  });
});

app.use(express.static(path.join(__dirname, "public")));

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
