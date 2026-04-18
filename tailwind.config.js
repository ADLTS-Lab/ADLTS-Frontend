/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./app/**/*.{js,ts,jsx,tsx,mdx}",
      "./components/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
      extend: {
        colors: {
          primary: "#1E3A8A",
          "primary-light": "#3B82F6",
          success: "#16A34A",
          warning: "#FACC15",
          error: "#DC2626",
          background: "#F5F7FA",
          card: "#FFFFFF",
          "text-dark": "#1F2937",
          "text-light": "#6B7280",
        },
      },
    },
    plugins: [],
  };