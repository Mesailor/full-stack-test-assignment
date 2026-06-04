/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [],
  theme: {
    extend: {
      colors: {
        primary: "#FECE14",
        secondary: "#000000",
        success: "#16A34A",
        warning: "#D97706",
        danger: "#DC2626",
        surface: "#FFFFFF",
        text: "#111827",
      },
      fontFamily: {
        sans: ["Poppins", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
      fontSize: {
        h1: "3rem",
        "body-md": "1rem",
        "label-caps": "0.75rem",
      },
      spacing: {
        xs: "4px",
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "24px",
        "2xl": "32px",
      },
      borderRadius: {
        sm: "4px",
        md: "8px",
      },
    },
  },
  plugins: [],
};
