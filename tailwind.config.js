/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // Habilita el modo oscuro cuando se añade la clase 'dark'
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}", // Rutas donde Tailwind buscará clases
  ],
  theme: {
    extend: {
      // Personalización de colores
      colors: {
        primary: '#2563EB', // Azul personalizado
        secondary: '#EC4899', // Rosa personalizado
        darkBackground: '#1F2937', // Fondo oscuro personalizado
        lightBackground: '#F9FAFB', // Fondo claro personalizado
      },
      // Configuración de breakpoints (tamaños de pantalla)
      screens: {
        sm: '480px',  // Pantalla pequeña
        md: '768px',  // Pantalla mediana
        lg: '1024px', // Pantalla grande
        xl: '1280px', // Pantalla extra grande
        '2xl': '1536px', // Pantalla muy grande
      },
      // Fuente personalizada
      fontFamily: {
        body: ['Roboto', 'sans-serif'], // Usando la fuente 'Roboto'
      },
      // Personalización de sombras
      boxShadow: {
        'lg': '0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.1)', // Sombra personalizada
      },
    },
  },
  plugins: [
    
  ],
}
