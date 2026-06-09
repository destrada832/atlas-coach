import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Atlas — Your Daily Coach",
  description: "A personal coach that shows up every day. Clear instruction. Real follow-up. Adjusts to your life.",
  manifest: "/manifest.json",
  themeColor: "#0D0D0F",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
