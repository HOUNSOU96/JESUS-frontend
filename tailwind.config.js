/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class", // 👈 Active le mode sombre via la classe "dark"
  theme: {
    extend: {
      colors: {
        primary: "#1E3A8A",
        secondary: "#10B981",
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
  theme: {
  extend: {
    colors: {
      primary: '#1e40af',
      accent: '#fbbf24',
    },
  },
},
extend: {
  animation: {
    'spin-slow': 'spin 8s linear infinite',
  },
}


};
