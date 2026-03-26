/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                hust: {
                    maroon: "#8B1D1D",
                    gold: "#F9B115",
                },
                scls: {
                    green: "#005A31",
                    emerald: "#10B981",
                },
                apple: {
                    gray: "#F5F5F7",
                    dark: "#1D1D1F",
                    secondary: "#86868B",
                }
            },
            fontFamily: {
                inter: ["Inter", "sans-serif"],
            },
            borderRadius: {
                'apple': '20px',
            }
        },
    },
    plugins: [],
}
