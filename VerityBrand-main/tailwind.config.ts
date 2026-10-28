import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Strict Blue & Deep Navy Palette:
        // Primary blue:    #3395FF
        // Secondary blue:  #528FF0
        // Deep navy:       #192839
        // Dark text:       #2A2A2A
        // White:           #FFFFFF
        // Light blue tint: #B4CDFD
        obsidian: "#192839",
        charcoal: "#13202E",
        surface: "#1E3045",
        forest: {
          DEFAULT: "#192839",
          dark: "#121D2B",
          light: "#243850",
          vivid: "#3395FF",
          teal: "#528FF0",
          lime: "#B4CDFD",
        },
        raspberry: {
          DEFAULT: "#3395FF",
          light: "#B4CDFD",
          dark: "#528FF0",
        },
        amber: {
          warn: "#B4CDFD",
        },
        cannoli: {
          DEFAULT: "#FFFFFF",
          muted: "#B4CDFD",
          dim: "rgba(180, 205, 253, 0.58)",
        },
        darktext: "#2A2A2A",
      },
      fontFamily: {
        serif: ["'Playfair Display'", "Georgia", "serif"],
        sans: ["'Inter'", "-apple-system", "BlinkMacSystemFont", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
