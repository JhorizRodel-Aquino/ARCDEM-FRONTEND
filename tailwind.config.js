/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./dist/*.{html,js}", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    screens: {
      xs: "30rem", // 480px custom screen
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
    extend: {
      animation: {
        moveLeft: "moveLeft 0.3s ease-in-out",
        moveRight: "moveRight 0.3s ease-in-out",
        moveInLeft: "moveInLeft 0.3s ease-in-out",
        moveOutLeft: "moveOutLeft 0.4s ease-in-out",
      },
      keyframes: {
        moveLeft: {
          "0%": { opacity: "0", transform: "translateX(-100%)" },
          "100%": { opacity: "1", transform: "translateX(0%)" },
        },
        moveRight: {
          "0%": { opacity: "0", transform: "translateX(100%)" },
          "100%": { opacity: "1", transform: "translateX(0%)" },
        },
        moveInLeft: {
          "0%": { opacity: "0", transform: "translateX(-100%)" },
          "100%": { opacity: "1", transform: "translateX(0%)" },
        },
        moveOutLeft: {
          "0%": { opacity: "1", transform: "translateX(0%)" },
          "100%": { opacity: "0", transform: "translateX(-100%)" },
        },
      },
      fontFamily: {
        inter: ["Inter", "sans-serif"],
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
