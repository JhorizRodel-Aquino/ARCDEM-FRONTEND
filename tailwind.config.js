/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./dist/*.{html,js}"],
  theme: {
    extend: {
      fontFamily: {
        inter: "Inter",
      },
      colors: {
        primary: "#D2B746",
        dark: "#2F2F2F",
        light: "#FFFFFF",
      },
    },
  },
  plugins: [],
};

