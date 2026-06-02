/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1c1c1c",
        "primary-light": "rgba(28, 28, 28, 0.83)",
        success: "#1c1c1c",
        warning: "rgba(28, 28, 28, 0.83)",
        error: "rgba(28, 28, 28, 0.83)",
        background: "#f7f4ed",
        card: "#f7f4ed",
        "text-dark": "#1c1c1c",
        "text-light": "#5f5f5d",
      },
      spacing: {
        2.5: "10px",
        14: "56px",
        22: "88px",
        24: "96px",
        44: "176px",
        48: "192px",
        52: "208px",
      },
      borderRadius: {
        sm: "4px",
        DEFAULT: "6px",
        md: "8px",
        lg: "12px",
        xl: "16px",
      },
    },
  },
  plugins: [],
};
