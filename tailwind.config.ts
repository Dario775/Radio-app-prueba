import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#00bdc7",
        "background-light": "#f0f2f4",
        "background-dark": "#121212",
        "surface-dark": "#1E1E1E",
        "surface-highlight": "#222526",
      },
      fontFamily: {
        display: ["Space Grotesk", "sans-serif"],
        body: ["Noto Sans", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        "2xl": "1rem",
        full: "9999px",
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'equalizer': 'equalizer 1s ease-in-out infinite',
      },
      keyframes: {
        equalizer: {
          '0%, 100%': { height: '40%' },
          '50%': { height: '100%' },
        }
      }
    },
  },
  plugins: [],
};
export default config;
