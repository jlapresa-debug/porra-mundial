import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "#0a0e1a",
          elevated: "#111827",
          card: "#1a1f2e",
          hover: "#222838",
        },
        accent: {
          DEFAULT: "#eab308",
          hover: "#ca8a04",
        },
        brand: {
          DEFAULT: "#2563eb",
          hover: "#1d4ed8",
        },
        muted: "#9ca3af",
        line: "#2a3142",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["'Space Grotesk'", "Inter", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
      },
      backgroundImage: {
        "gradient-brand": "linear-gradient(135deg, #2563eb 0%, #312e81 50%, #0a0e1a 100%)",
        "gradient-card": "linear-gradient(180deg, rgba(37,99,235,0.10) 0%, rgba(37,99,235,0) 100%)",
      },
    },
  },
  plugins: [],
} satisfies Config;
