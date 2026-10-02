/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          yellow: "#E3D200",
          olive: "#393500",
          50: "#FCFBE8",
          100: "#F7F3C5",
          200: "#EFE793",
          300: "#E8DB52",
          400: "#E3D200",
          500: "#797100",
          600: "#6C6500",
          700: "#575100",
          800: "#474200",
          900: "#393500",
          950: "#242200",
        },
        studio: {
          50: "#F7F7F2",
          100: "#EFEFE7",
          200: "#DEDFD4",
          300: "#C3C5B7",
          400: "#969A87",
          500: "#6C705F",
          600: "#565B49",
          700: "#414635",
          800: "#323727",
          850: "#2A2F21",
          900: "#23271C",
          950: "#171A12",
        },
        accent: {
          cyan: "#0891b2",
          amber: "#b45309",
          emerald: "#059669",
          rose: "#e11d48",
          violet: "#7c3aed",
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'],
      },
      boxShadow: {
        card: "0 2px 5px rgba(35, 39, 28, 0.025)",
        "card-dark": "0 2px 5px rgba(0, 0, 0, 0.12)",
      },
      animation: {
        "fade-in": "fadeIn 0.2s ease-out forwards",
        "slide-up": "slideUp 0.2s ease-out forwards",
        "pulse-subtle": "pulseSubtle 3s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        slideUp: { "0%": { opacity: "0", transform: "translateY(6px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        pulseSubtle: { "0%, 100%": { opacity: "1" }, "50%": { opacity: "0.85" } },
      },
    },
  },
  plugins: [],
};
