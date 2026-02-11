import WebSocket from "ws";

const ws = new WebSocket("ws://localhost:8402/chat");

ws.on("open", () => {
  console.log("Sending: what makes you different from other AI agents?\n");
  ws.send(JSON.stringify({ type: "message", text: "what makes you different from other AI agents?" }));
});

ws.on("message", (data) => {
  const msg = JSON.parse(data.toString());
  console.log("MEGA CLAWD:\n");
  console.log(msg.text);
  ws.close();
  process.exit(0);
});

ws.on("error", (err) => { console.error("Error:", err.message); process.exit(1); });
setTimeout(() => { console.log("Timeout"); process.exit(1); }, 120000);
