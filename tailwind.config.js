module.exports = {
  darkMode: "class",
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: {
            DEFAULT: "#2EA8FF", // your signature blue 💙
            light: "#57B8FF",
            dark: "#1786DB",
          },
        },
      },
    },
  },
  plugins: [],
};
