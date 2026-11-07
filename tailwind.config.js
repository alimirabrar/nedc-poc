/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: "#0F172A", 800: "#1E293B", 700: "#334155" },
        nama: { teal: "#0D9488", emerald: "#059669", amber: "#D97706", crimson: "#E11D48" },
      },
      keyframes: {
        pulseRing: {
          "0%": { boxShadow: "0 0 0 0 rgba(13,148,136,0.6)" },
          "100%": { boxShadow: "0 0 0 10px rgba(13,148,136,0)" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        pulseRing: "pulseRing 1.2s ease-out infinite",
        fadeUp: "fadeUp .35s ease-out both",
      },
    },
  },
  plugins: [],
};
