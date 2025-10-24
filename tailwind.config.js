/** @type {import('tailwindcss').Config} */
module.exports = {
  // Dark modu sınıfla yöneteceğiz
  darkMode: 'class',
  // V4'te content zorunlu değil ama Next dizinlerini yine de ekliyoruz
  content: [
    "./src/app/**/*.{ts,tsx,js,jsx}",
    "./src/components/**/*.{ts,tsx,js,jsx}",
    "./src/lib/**/*.{ts,tsx,js,jsx}",
  ],
  theme: { extend: {} },
  plugins: [],
};
