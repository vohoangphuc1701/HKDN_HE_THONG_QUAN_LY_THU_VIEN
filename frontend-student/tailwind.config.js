```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      xs: '375px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        heading: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
      },
      colors: {
        uth: {
          primary: '#00666b',
          hover: '#005458',
          secondary: '#147277',
          dark: '#0a4549',
          surface: '#f4f8f7',
          mint: '#eaf3f0',
          border: '#d1e5e0',
          accent: '#0d9488',
        },
        brand: {
          50: '#f0f7f7',
          100: '#e0eff0',
          200: '#bfe0e2',
          300: '#8cc4c8',
          400: '#4d9fa5',
          500: '#008086',
          600: '#007379',
          700: '#00666B',
          800: '#004f53',
          900: '#00383b',
          950: '#002426',
        },
        slate: {
          850: '#151e2e',
        }
      },
      borderRadius: {
        none: '0px',
        sm: '3px',
        DEFAULT: '4px',
        md: '6px',
        lg: '8px',
        xl: '12px',
      },
      boxShadow: {
        xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        sm: '0 1px 3px 0 rgba(0, 0, 0, 0.07), 0 1px 2px -1px rgba(0, 0, 0, 0.04)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -2px rgba(0, 0, 0, 0.04)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.04)',
      }
    },
  },
  plugins: [],
}
```