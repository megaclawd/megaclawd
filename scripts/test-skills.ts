import WebSocket from "ws";

const tests = ["skills", "deploy a contract", "build an app", "help"];
let idx = 0;

const ws = new WebSocket("ws://localhost:8402/chat");

ws.on("open", () => {
  console.log("=== OpenClaw Skills Chat Test ===\n");
  send();
});

function send() {
  if (idx >= tests.length) {
    ws.close();
    process.exit(0);
    return;
  }
  const msg = tests[idx];
  console.log(`> ${msg}`);
  ws.send(JSON.stringify({ type: "message", text: msg }));
}

ws.on("message", (data) => {
  const msg = JSON.parse(data.toString());
  console.log(`\n${msg.text}\n`);
  console.log("---\n");
  idx++;
  send();
});

setTimeout(() => process.exit(1), 15000);
