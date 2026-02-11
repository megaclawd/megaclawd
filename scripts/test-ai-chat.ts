import WebSocket from "ws";

const ws = new WebSocket("ws://localhost:8402/chat");

ws.on("open", () => {
  console.log("=== MEGA CLAWD AI Chat Test ===\n");
  console.log("> build me simple jackpot app where user deposit 1 usdc after 24H, program choose the random winner to win 50% of the pot where another 50% is used to buyback our token\n");
  console.log("Waiting for Claude AI response...\n");
  ws.send(
    JSON.stringify({
      type: "message",
      text: "build me simple jackpot app where user deposit 1 usdc after 24H, program choose the random winner to win 50% of the pot where another 50% is used to buyback our token",
    })
  );
});

ws.on("message", (data) => {
  const msg = JSON.parse(data.toString());
  console.log("MEGA CLAWD:\n");
  console.log(msg.text);
  ws.close();
  process.exit(0);
});

ws.on("error", (err) => {
  console.error("Error:", err.message);
  process.exit(1);
});

// 6 min timeout for large code generation
setTimeout(() => {
  console.log("\nTimeout - no response in 6 minutes");
  process.exit(1);
}, 360000);
