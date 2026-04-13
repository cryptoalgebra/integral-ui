/** @type {import('tailwindcss').Config} */
module.exports = {
    theme: {
        extend: {
            keyframes: {
                "accordion-down": {
                    from: { height: 0 },
                    to: { height: "var(--radix-accordion-content-height)" },
                },
                "accordion-up": {
                    from: { height: "var(--radix-accordion-content-height)" },
                    to: { height: 0 },
                },
                "fade-in": {
                    "0%": { opacity: 0, transform: "translateY(10px)" },
                    "100%": { opacity: 1, transform: "translateY(0)" },
                },
                "fade-in-left": {
                    "0%": { opacity: 0, transform: "translateX(-20px)" },
                    "100%": { opacity: 1, transform: "translateX(0)" },
                },
                in: {
                    "0%": { opacity: 0 },
                    "100%": { opacity: 1 },
                },
            },
            animation: {
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up": "accordion-up 0.2s ease-out",
                "fade-in": "fade-in 0.2s ease-out",
                "fade-in-left": "fade-in-left 0.3s ease-out forwards",
                in: "in 0.3s ease-out forwards",
            },
        },
    },
    plugins: [require("tailwindcss-animate")],
};
