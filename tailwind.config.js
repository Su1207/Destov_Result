const flowbite = require("flowbite-react/tailwind");

/** @type {import('tailwindcss').Config} */

export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}", flowbite.content()],
  theme: {
    extend: {
      screens: {
        xs: "401px",
      },
    },
  },
  plugins: [flowbite.plugin()],
};
