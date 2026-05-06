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
        brand: {
          50:  "#eefbf3",
          100: "#d6f5e3",
          200: "#b0eacb",
          300: "#7dd8ad",
          400: "#46bf88",
          500: "#22a36b",
          600: "#168356",
          700: "#136847",
          800: "#125339",
          900: "#104530",
          950: "#082318",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },
      animation: {
        "fade-in": "fadeIn 0.4s cubic-bezier(0.16,1,0.3,1) both",
        "slide-up": "slideUp 0.5s cubic-bezier(0.16,1,0.3,1) both",
        "pulse-slow": "pulse 3s cubic-bezier(0.4,0,0.6,1) infinite",
      },
      keyframes: {
        fadeIn:  { from: { opacity: "0" }, to: { opacity: "1" } },
        slideUp: { from: { transform: "translateY(16px)", opacity: "0" }, to: { transform: "translateY(0)", opacity: "1" } },
      },
      boxShadow: {
        "tinted-sm": "0 4px 24px -8px rgba(34,163,107,0.12)",
        "tinted":    "0 8px 40px -12px rgba(34,163,107,0.18)",
      },
    },
  },
  plugins: [],
};

export default config;
