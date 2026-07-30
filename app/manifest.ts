import { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "NAICS Direct — Federal Bids Filtered For Your Industry",
    short_name: "NAICS Direct",
    description:
      "Federal contract bids from SAM.gov, filtered to your exact NAICS industry codes.",
    start_url: "/",
    display: "standalone",
    background_color: "#020617",
    theme_color: "#4f46e5",
    icons: [
      { src: "/icon", sizes: "32x32", type: "image/png" },
    ],
  }
}
