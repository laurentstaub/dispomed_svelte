/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        rupture: 'rgb(213, 76, 117)',
        'rupture-dark': 'rgb(145, 30, 64)',
        tension: 'rgb(251, 184, 84)',
        'tension-dark': 'rgb(224, 130, 0)',
        'tension-light': 'rgb(255, 202, 100)',
        'tension-verylight': 'rgba(255, 202, 100, 0.3)',
        available: 'rgb(111, 189, 77)',
        'available-dark': 'rgb(59, 119, 43)',
        'available-light': 'rgb(226, 248, 224)',
        gris: {
          50: 'rgb(248, 248, 248)',
          100: 'rgb(235, 235, 235)',
          200: 'rgb(230, 230, 230)',
          300: 'rgb(170, 170, 170)',
          400: 'rgb(110, 110, 110)',
          500: 'rgb(90, 90, 90)',
          600: 'rgb(50, 50, 50)',
        }
      },
      fontFamily: {
        'sans': ['Inter', 'Roboto', 'Arial', 'sans-serif'],
      },
      maxWidth: {
        '900': '900px',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}

