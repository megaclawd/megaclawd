import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        clawd: {
          primary: "#ff6b2b",
          secondary: "#1a1a2e",
          accent: "#e94560",
          dark: "#0f0f23",
          light: "#f0f0f0",
          gold: "#ffd700",
        },
      },
      fontFamily: {
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      animation: {
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "slide-up": "slide-up 0.3s ease-out",
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 5px #ff6b2b, 0 0 10px #ff6b2b" },
          "50%": { boxShadow: "0 0 20px #ff6b2b, 0 0 40px #ff6b2b" },
        },
        "slide-up": {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
