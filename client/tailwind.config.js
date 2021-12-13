module.exports = {
    purge: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
    darkMode: false, // or 'media' or 'class'
    theme: {
        extend: {},
        colors: {
            white: {
                DEFAULT: "#FFFFFF",
            },
            blue: {
                DEFAULT: "#0285E4",
            },
        },
    },
    variants: {
        extend: {},
    },
    plugins: [require("@tailwindcss/line-clamp")],
}
