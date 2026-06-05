/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    DEFAULT: '#1A237E', // Deep Royal Blue
                    light: '#3949AB',   // Lighter Indigo
                    dark: '#000051',    // Midnight Blue
                },
                accent: {
                    DEFAULT: '#00E5FF', // Cyan Accent
                    secondary: '#FFD740', // Amber/Gold
                    light: '#84FFFF',
                    dark: '#00B8D4',
                },
                background: {
                    DEFAULT: '#F3F4F6', // Light Gray
                    dark: '#121212',    // Dark Mode BG
                }
            },
            fontFamily: {
                sans: ['var(--font-inter)', 'sans-serif'],
            },
        },
    },
    plugins: [],
};
