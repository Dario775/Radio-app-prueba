import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AudioProvider } from "@/context/AudioContext";
import MiniPlayer from "@/components/MiniPlayer";
import ThemeColorManager from "@/components/ThemeColorManager";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";
import AlarmSoundOverlay from "@/components/AlarmSoundOverlay";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RadioWave - Radio en Vivo",
  description: "Descubre y escucha miles de emisoras de radio de todo el mundo. Música en vivo, noticias, deportes y más.",
  keywords: ["radio", "streaming", "música", "radio en vivo", "radio por internet"],
  authors: [{ name: "RadioWave" }],
  openGraph: {
    title: "RadioWave - Radio en Vivo",
    description: "Descubre y escucha miles de emisoras de radio de todo el mundo.",
    type: "website",
  },
};

export const viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <head>
        <script src="https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1" async></script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
      >
        <ServiceWorkerRegistration />
        <AudioProvider>
          <ThemeColorManager />
          {children}
          <AlarmSoundOverlay />
        </AudioProvider>
      </body>
    </html>
  );
}
