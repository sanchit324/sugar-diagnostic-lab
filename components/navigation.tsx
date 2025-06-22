"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { TestTube, Users, FileText, Home } from "lucide-react"

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <TestTube className="h-6 w-6 text-red-600" />
              <span className="text-xl font-bold text-red-600">SUGAR</span>
              <span className="text-sm text-gray-600">DIAGNOSTIC LAB</span>
            </div>
          </Link>

          <div className="flex items-center gap-6">
            <Link
              href="/"
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                pathname === "/" ? "bg-red-100 text-red-700" : "text-gray-600 hover:text-red-600 hover:bg-red-50"
              }`}
            >
              <FileText className="h-4 w-4" />
              Generate Report
            </Link>
            <Link
              href="/admin"
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                pathname === "/admin" ? "bg-red-100 text-red-700" : "text-gray-600 hover:text-red-600 hover:bg-red-50"
              }`}
            >
              <Users className="h-4 w-4" />
              Admin Panel
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
