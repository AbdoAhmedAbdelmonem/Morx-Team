import type React from "react"
import "./globals.css"
import { Outfit, Rubik, Rock_Salt } from "next/font/google"
import type { Metadata } from "next"
import { ThemeProvider } from "@/components/theme-provider"
import { ColorThemeProvider } from "@/components/color-theme-provider"
import { AuthProvider } from "@/contexts/auth-context"
import { Toaster } from "@/components/ui/sonner"


const outfit = Outfit({ 
  subsets: ["latin"], 
  variable: "--font-outfit",
  display: "swap",
})
const rubik = Rubik({ 
  subsets: ["latin", "arabic"], 
  variable: "--font-rubik",
  weight: "variable",
  display: "swap"
})
const rockSalt = Rock_Salt({ 
  weight: "400",
  subsets: ["latin"],
  variable: "--font-rock-salt" 
})

export const metadata: Metadata = {
  title: "Morx - Reports and Statistics",
  description: "Advanced reports and statistics platform for data-driven decisions.",
  generator: 'Morx Team'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/Morx.png" type="image/png" />
      </head>
      <body className={`${outfit.variable} ${rubik.variable} ${rockSalt.variable} font-sans`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <ColorThemeProvider defaultTheme="mint">
            <AuthProvider>
              <div className="pt-24 pb-12">
                {children}
              </div>
              <Toaster position="top-right" closeButton />
            </AuthProvider>
          </ColorThemeProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

