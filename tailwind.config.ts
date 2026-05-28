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
          DEFAULT: "#10b981",
          hover: "#059669",
        },
        brand: {
          DEFAULT: "#a855f7",
          hover: "#9333ea",
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
        "gradient-brand": "linear-gradient(135deg, #a855f7 0%, #6366f1 50%, #10b981 100%)",
        "gradient-card": "linear-gradient(180deg, rgba(168,85,247,0.08) 0%, rgba(168,85,247,0) 100%)",
      },
    },
  },
  plugins: [],
} satisfies Config;
