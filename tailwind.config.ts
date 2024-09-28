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
      screens: {
        "custom-xsm": "320px",
        "custom-sm": "745px",
        "custom-xmd": "992px",
        "custom-md": "1024px",
      },
      colors: {
        white: {
          1: "#ffffff",
          2: "#d9d9d9",
          3: "#f0f0f0",
        },
        black: {
          1: "#000000",
        },
        red: {
          1: "#DB4444",
          2: "#ff3333",
        },
      },
      animation: {
        marquee: 'marquee 100s linear infinite',
        marquee2: 'marquee2 100s linear infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        marquee2: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0%)' },
        },
      },
    },
  },
  plugins: [],
};
export default config;
