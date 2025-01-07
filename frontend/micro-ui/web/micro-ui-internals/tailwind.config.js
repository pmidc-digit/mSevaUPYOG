module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./public/index.html",
    "./modules/**/*.{html,js,ts,jsx,tsx}",
    "./modules/*.{html,js,ts,jsx,tsx}",
    "./modules/**/**/*.{html,js,ts,jsx,tsx}",
    "./react-components/*.{html,js,ts,jsx,tsx}",
    "./react-components/**/*.{html,js,ts,jsx,tsx}",
    "./react-components/**/**/*.{html,js,ts,jsx,tsx}",
    "../**/*.{html,js,ts,jsx,tsx}"
  ],
  future: {
    // removeDeprecatedGapUtilities: true,
    // purgeLayersByDefault: true,
  },
  purge: [],
  theme: {
    extend: {},
  },
  variants: {},
  plugins: [],
}
