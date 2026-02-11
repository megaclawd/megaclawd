import type { Metadata } from "next";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "MEGA CLAWD | Autonomous AI Agent",
  description:
    "Autonomous AI agent with ERC-8004 onchain identity, x402 payments, and OpenClaw integration",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-clawd-dark text-clawd-light min-h-screen font-mono antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
