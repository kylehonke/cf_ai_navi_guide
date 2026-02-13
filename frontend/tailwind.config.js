/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'zelda-gold': '#C8A947',
                'zelda-dark': '#0A2610',
                'zelda-green': '#1A6B25',
                'navi-blue': '#8CD6FF',
            },
            fontFamily: {
                'retro': ['"Courier New"', 'monospace'],
            }
        },
    },
    plugins: [],
}
