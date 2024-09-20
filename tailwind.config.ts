import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "30px",
      screens: {
        "2xl": "1372px",
      },
    },
    extend: {      
      colors: {
        white: {
          1: "#ffffff",
        },
        black: {
          1: "#000000",
        },
        red: {
          1: "#DB4444",
        }
      },
    },
  },
  plugins: [],
};
export default config;
