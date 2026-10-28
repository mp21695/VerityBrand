import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VerityBrand — Every Claim Grounded",
  description:
    "VerityBrand checks content against approved rules, verifies claims against traceable sources, and asks a human before anything goes live.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400;1,500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased bg-obsidian text-cannoli min-h-screen">
        {children}
      </body>
    </html>
  );
}
