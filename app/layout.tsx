import type React from "react"
import "./globals.css"
import { Outfit, Rubik } from "next/font/google"
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
const rubik = Rubik({ subsets: ["latin", "arabic"], variable: "--font-rubik" })

export const metadata: Metadata = {
  title: "Morx - Reports and Statistics",
  description: "Advanced reports and statistics platform for data-driven decisions.",
  generator: 'MorxCorp'
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
      <body className={`${outfit.variable} ${rubik.variable} font-sans`}>
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

