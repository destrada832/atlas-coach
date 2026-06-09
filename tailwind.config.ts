import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Atlas palette
        obsidian: "#0D0D0F",
        ink: "#141417",
        carbon: "#1E1E24",
        slate: "#2A2A33",
        mist: "#6B6B7B",
        fog: "#9B9BAA",
        cloud: "#D4D4E0",
        white: "#F5F5FA",
        // Accent — warm amber/gold
        ember: "#E8A34A",
        "ember-dim": "#C4862C",
        "ember-glow": "rgba(232,163,74,0.12)",
      },
      fontFamily: {
        display: ["Georgia", "Times New Roman", "serif"],
        body: ["system-ui", "-apple-system", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
