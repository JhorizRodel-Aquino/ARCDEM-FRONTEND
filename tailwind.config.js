/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./dist/*.{html,js}", "./src/**/*.{vue,js,ts,jsx,tsx}"],
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

