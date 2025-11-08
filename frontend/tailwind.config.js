/** @type {import('tailwindcss').Config} */
export default {
  darkMode: false, // Disable dark mode
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "node_modules/flowbite/**/*.js",
    "node_modules/flowbite-react/lib/esm/**/*.js"
  ],
  theme: {
    extend: {
      // ✅ SBCC Brand Colors
      colors: {
        sbcc: {
          cream: '#FAFBFD',
          'light-orange': '#FFF5E1',
          orange: '#F6C67E',
          'dark-orange': '#FDB54A',
          primary: '#FDB54A',
          gray: '#A0A0A0',
          dark: '#383838',
        },
      },
      // ✅ Background Colors
      backgroundColor: {
        'sbcc-cream': '#FAFBFD',
        'sbcc-light': '#FFF5E1',
        'sbcc-light-orange': '#FFF5E1',
        'sbcc-orange': '#F6C67E',
        'sbcc-primary': '#FDB54A',
      },
      // ✅ Text Colors
      textColor: {
        'sbcc-gray': '#A0A0A0',
        'sbcc-dark': '#383838',
        'sbcc-orange': '#F6C67E',
        'sbcc-primary': '#FDB54A',
      },
      // ✅ Border Colors
      borderColor: {
        'sbcc-orange': '#F6C67E',
        'sbcc-primary': '#FDB54A',
      },
      // ✅ Background Images (Gradients)
      backgroundImage: {
        'sbcc-gradient': 'linear-gradient(135deg, #F6C67E 0%, #FDB54A 100%)',
      },
      // ✅ Custom Responsive Breakpoints (Mobile-First)
      // These breakpoints coordinate with the sidebar collapse behavior
      screens: {
        // Sidebar shows compact icons only below 670px
        // Above this breakpoint, sidebar shows full labels
        'sidebar-compact': '671px',

        // Sidebar fully expands above 950px
        // Below this, some elements are hidden to save space
        'sidebar-wide': '951px',
      }
    },
  },
  plugins: [
    require('flowbite/plugin'),
  ],
}
