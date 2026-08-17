/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Terracotta brand palette (matches main mobile app)
        terracotta: {
          50: "#fdf6f3",
          100: "#fbebe6",
          200: "#f7d5cc",
          300: "#f0b5a4",
          400: "#e48a70",
          500: "#C85A32", // Primary light accent
          600: "#b64a24",
          700: "#973c1c",
          800: "#7d331a",
          900: "#682e1a",
          950: "#38140a",
        },
        // Blueprint alias mapped to terracotta so all studio controls immediately take the theme
        blueprint: {
          50: "#fdf6f3",
          100: "#fbebe6",
          200: "#f7d5cc",
          300: "#f0b5a4",
          400: "#e48a70",
          500: "#C85A32",
          600: "#b64a24",
          700: "#973c1c",
          800: "#7d331a",
          900: "#682e1a",
          950: "#38140a",
        },
        studio: {
          50: "#FBFBFC", // Mobile light background
          100: "#F3F4F6", // Mobile light element
          200: "#E5E7EB", // Mobile light border
          300: "#D1D5DB",
          400: "#9CA3AF",
          500: "#6B7280",
          600: "#4B5563",
          700: "#374151",
          800: "#272A30", // Mobile dark border
          850: "#24272E", // Mobile dark selected
          900: "#1A1C20", // Mobile dark element
          950: "#121316", // Mobile dark background
        },
        accent: {
          terracotta: "#C85A32",
          terracottaLight: "#E07A5F",
          cyan: "#06b6d4",
          amber: "#f59e0b",
          emerald: "#10b981",
          rose: "#f43f5e",
          violet: "#8b5cf6",
        },
      },
      boxShadow: {
        card: "0 4px 20px -2px rgba(0, 0, 0, 0.04), 0 2px 6px -1px rgba(0, 0, 0, 0.02)",
        "card-dark": "0 8px 30px -4px rgba(0, 0, 0, 0.5), 0 4px 10px -2px rgba(0, 0, 0, 0.3)",
        glow: "0 0 25px -5px rgba(200, 90, 50, 0.35)",
      },
      animation: {
        "fade-in": "fadeIn 0.25s ease-out forwards",
        "slide-up": "slideUp 0.3s ease-out forwards",
        "pulse-subtle": "pulseSubtle 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseSubtle: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.85" },
        },
      },
    },
  },
  plugins: [],
};
