/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        ink: "#111111",
        muted: "#6A6A6A",
        line: "#E7E7E7",
        shell: "#F7F7F5",
        primary: "#111111",
        accent: "#F2994A",
        success: "#35B46B",
        danger: "#EB5757",
        info: "#2F80ED",
      },
      fontSize: {
        "2xs": "11px",
      },
      borderRadius: {
        "4xl": "30px",
        "5xl": "38px",
      },
      boxShadow: {
        soft: "0 10px 30px rgba(17,17,17,0.08)",
      },
    },
  },
  plugins: [],
};
