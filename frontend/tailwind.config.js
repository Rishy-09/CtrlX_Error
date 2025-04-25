module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'media', // Changed from 'class' to 'media' to follow system preferences
  theme: {
    extend: {
      colors: {
        primary: '#3b82f6',
        secondary: '#6b7280',
        success: '#10b981',
        danger: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6',
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
} 