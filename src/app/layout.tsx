import type { Metadata, Viewport } from "next";
import { DM_Sans, Libre_Baskerville, Fragment_Mono } from "next/font/google";
import { MotionProvider } from "@/components/motion/MotionProvider";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dm-sans",
  display: "swap",
});

const libreBaskerville = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-libre-baskerville",
  display: "swap",
});

const fragmentMono = Fragment_Mono({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-fragment-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "VerityBrand — Evidence-backed AI for brand governance",
    template: "%s · VerityBrand",
  },
  description:
    "Find flaws, verify claims, explain every finding, and move approved content safely toward publication. AI proposes. Humans decide.",
};

export const viewport: Viewport = {
  themeColor: "#0e231a",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${libreBaskerville.variable} ${fragmentMono.variable}`}
    >
      <body>
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
