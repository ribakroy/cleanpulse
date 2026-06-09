import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CleanPulse",
    short_name: "CleanPulse",
    description: "דיווחי שירותים בזמן אמת לעסקים.",
    start_url: "/",
    display: "standalone",
    background_color: "#F4FAFF",
    theme_color: "#1E88E5",
    lang: "he",
    dir: "rtl",
  };
}
