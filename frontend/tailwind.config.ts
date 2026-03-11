import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      // Custom animation for pulsing agent dots
      animation: {
        pulse_dot: "pulse_dot 1.5s ease-in-out infinite",
        fade_in: "fade_in 0.4s ease-out",
        slide_up: "slide_up 0.3s ease-out",
      },
      keyframes: {
        pulse_dot: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.4" },
        },
        fade_in: {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        slide_up: {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
