import type { Metadata } from "next";
import "mapbox-gl/dist/mapbox-gl.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mai Vàng • Your little guide to Bến Tre",
  description: "Places, local tips and little discoveries selected by Mai Vàng Homstay in Bến Tre, Vietnam.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
