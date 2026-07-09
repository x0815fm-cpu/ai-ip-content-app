import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/data/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/services/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        cream: "#FFF8EF",
        ink: "#2A241F",
        cocoa: "#6E5546",
        honey: "#E8B86B",
        coral: "#E88C72",
        sage: "#8EAD8B",
        mist: "#F3E8D8"
      },
      boxShadow: {
        soft: "0 24px 80px rgba(92, 65, 38, 0.14)",
        glow: "0 16px 50px rgba(232, 184, 107, 0.28)"
      }
    }
  },
  plugins: []
};

export default config;
