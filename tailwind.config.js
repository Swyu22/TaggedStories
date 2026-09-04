/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', '"Source Han Serif SC"', 'STSong', 'SimSun', 'serif'],
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"PingFang SC"', '"Hiragino Sans GB"', '"Microsoft YaHei"', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'paper': '0 1px 3px 0 rgba(44, 42, 38, 0.05), 0 1px 2px -1px rgba(44, 42, 38, 0.05)',
        'paper-md': '0 4px 6px -1px rgba(44, 42, 38, 0.07), 0 2px 4px -2px rgba(44, 42, 38, 0.05)',
        'paper-lg': '0 10px 15px -3px rgba(44, 42, 38, 0.08), 0 4px 6px -4px rgba(44, 42, 38, 0.05)',
      }
    },
  },
  plugins: [],
}
