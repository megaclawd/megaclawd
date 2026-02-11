import WebSocket from "ws";

const ws = new WebSocket("ws://localhost:8402/chat");

ws.on("open", () => {
  console.log("Connected to dashboard chat");
  console.log("Sending: hello");
  ws.send(JSON.stringify({ type: "message", text: "hello" }));
});

ws.on("message", (data) => {
  const msg = JSON.parse(data.toString());
  console.log("\nResponse:", msg.text);
  console.log("Timestamp:", msg.timestamp);

  // Test another message
  console.log("\nSending: what is your token?");
  ws.send(JSON.stringify({ type: "message", text: "what is your token?" }));

  // Wait for second response then close
  ws.once("message", (data2) => {
    const msg2 = JSON.parse(data2.toString());
    console.log("\nResponse:", msg2.text);
    ws.close();
    process.exit(0);
  });
});

ws.on("error", (err) => {
  console.error("Error:", err.message);
  process.exit(1);
});

setTimeout(() => {
  console.log("Timeout");
  process.exit(1);
}, 10000);
