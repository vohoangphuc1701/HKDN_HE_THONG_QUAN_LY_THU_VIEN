/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      'xs': '375px',     // Smartphone nhỏ
      'sm': '640px',     // Mobile breakpoint theo kế hoạch Tuần 1
      'md': '768px',     // Tablet / Ranh giới Mobile & Desktop
      'lg': '1024px',    // Desktop (phân hệ TV3)
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        uth: {
          primary: '#0284c7',   // Xanh UTH
          secondary: '#0369a1',
          accent: '#2563eb',
          dark: '#0f172a',
          surface: '#f8fafc',
        }
      }
    },
  },
  plugins: [],
}
