const colors = require('tailwindcss/colors')

module.exports = {
    purge: [],
    darkMode: false, // or 'media' or 'class'
    theme: {
        colors: {
            transparent: 'transparent',
            current: 'currentColor',
            black: colors.black,
            white: colors.white,
            gray: colors.trueGray,
            indigo: colors.indigo,
            red: colors.rose,
            yellow: colors.amber,
            teal: colors.teal,
            blue: colors.blue,
        },
        minHeight: {
            '0': '0',
            '1/4': '25%',
            '1/2': '50%',
            '3/4': '75%',
            'full': '100%',
        },
        fontFamily: {
            'sans': ['Noto Sans', 'Noto Sans',],
            'serif': ['Noto Sans', 'Noto Sans',],
            'mono': ['Noto Sans', 'Noto Sans',],
            'display': ['Noto Sans',],
            'body': ['Noto Sans',],
        },
        extend: {},
    },
    variants: {
        extend: {},
    },
    plugins: [],
}
