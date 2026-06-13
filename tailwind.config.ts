import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Acento azul "Apple"
        brand: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdcff",
          300: "#8ec5ff",
          400: "#52a9ff",
          500: "#0a84ff",
          600: "#0071e3",
          700: "#0062c4",
          800: "#0a4ba0",
          900: "#0c3d80",
        },
        // Cinza de fundo "Apple" (#f5f5f7)
        canvas: "#f5f5f7",
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Text",
          "SF Pro Display",
          "var(--font-inter)",
          "system-ui",
          "sans-serif",
        ],
      },
      letterSpacing: {
        tightest: "-0.022em",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.25rem",
        "4xl": "1.75rem",
      },
      boxShadow: {
        // Sombras difusas, baixíssima opacidade — estilo Apple
        card: "0 1px 2px rgba(15,23,42,0.04), 0 6px 20px -6px rgba(15,23,42,0.06)",
        "card-hover": "0 8px 30px -8px rgba(15,23,42,0.12), 0 2px 8px -2px rgba(15,23,42,0.06)",
        glass: "0 1px 0 rgba(255,255,255,0.6) inset, 0 8px 30px -10px rgba(15,23,42,0.10)",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};

export default config;
