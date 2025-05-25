import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Sugar Diagnostic Lab – Trusted Pathology & Biochemistry Testing",
  description:
    "Accurate, reliable, and timely blood tests at Sugar Diagnostic Lab. Trusted by healthcare professionals and patients alike. Book your test today for fast, professional results.",
  keywords:
    "pathology lab, blood sugar test, trusted lab, CBC test, LFT test, diagnostic lab, blood tests, health checkup, medical laboratory",
  openGraph: {
    title: "Sugar Diagnostic Lab – Trusted Pathology & Biochemistry Testing",
    description:
      "Professional medical laboratory providing accurate pathology and biochemistry tests with fast turnaround times.",
    type: "website",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
