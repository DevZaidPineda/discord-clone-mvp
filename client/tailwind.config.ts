import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        discord: {
          bg: "#313338",
          "bg-dark": "#1e1f22",
          "bg-darker": "#111214",
          sidebar: "#2b2d31",
          "sidebar-dark": "#1e1f22",
          channel: "#5865f2",
          "channel-hover": "#4752c4",
          green: "#23a559",
          text: "#dbdee1",
          "text-muted": "#949ba4",
          "text-dark": "#6d6f78",
          "hover": "rgba(79, 84, 92, 0.16)",
          "hover-strong": "rgba(79, 84, 92, 0.32)",
          separator: "#3f4147",
        },
      },
    },
  },
  plugins: [],
};

export default config;
