import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { CartProvider } from "@/components/ui/cart-provider"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "ImportStyle - Productos Importados de Calidad",
  description:
    "Descubre nuestra colección exclusiva de ropa, termos, joyería y accesorios importados directamente para ofrecerte lo mejor del mundo",
  keywords: "productos importados, ropa, termos, joyería, accesorios, calidad premium",
  authors: [{ name: "ImportStyle" }],
  creator: "ImportStyle",
  publisher: "ImportStyle",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: "https://importstyle.com",
    title: "ImportStyle - Productos Importados de Calidad",
    description: "Descubre nuestra colección exclusiva de productos importados",
    siteName: "ImportStyle",
  },
  twitter: {
    card: "summary_large_image",
    title: "ImportStyle - Productos Importados de Calidad",
    description: "Descubre nuestra colección exclusiva de productos importados",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  )
}
