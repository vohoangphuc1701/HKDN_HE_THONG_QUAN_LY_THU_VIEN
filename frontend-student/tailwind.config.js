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
      'lg': '1024px',    // Desktop (phân hệ PC)
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        uth: {
          primary: '#00666b',       // Xanh mòng két chủ đạo theo thiết kế Figma
          hover: '#005458',
          secondary: '#147277',
          dark: '#0a4549',
          surface: '#f4f8f7',       // Nền xám xanh nhạt trong thiết kế
          mint: '#eaf3f0',          // Nền thẻ/khối nổi bật
          border: '#d1e5e0',
          accent: '#0d9488',
        }
      }
    },
  },
  plugins: [],
}
