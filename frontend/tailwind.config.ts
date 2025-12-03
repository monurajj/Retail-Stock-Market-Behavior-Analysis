import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0f766e",
        secondary: "#0369a1",
        accent: "#f97316"
      }
    }
  },
  plugins: []
};

export default config;


