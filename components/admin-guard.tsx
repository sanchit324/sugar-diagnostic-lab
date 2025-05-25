"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { TestTube, Lock } from "lucide-react"

interface AdminGuardProps {
  children: React.ReactNode
}

export function AdminGuard({ children }: AdminGuardProps) {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const router = useRouter()

  useEffect(() => {
    const checkAdminStatus = () => {
      const adminStatus = localStorage.getItem("isAdmin")
      const loginTime = localStorage.getItem("adminLoginTime")

      if (adminStatus === "true" && loginTime) {
        // Check if login is still valid (24 hours)
        const loginTimestamp = Number.parseInt(loginTime)
        const currentTime = Date.now()
        const twentyFourHours = 24 * 60 * 60 * 1000

        if (currentTime - loginTimestamp < twentyFourHours) {
          setIsAdmin(true)
        } else {
          // Session expired
          localStorage.removeItem("isAdmin")
          localStorage.removeItem("adminLoginTime")
          setIsAdmin(false)
        }
      } else {
        setIsAdmin(false)
      }
    }

    checkAdminStatus()
  }, [])

  useEffect(() => {
    if (isAdmin === false) {
      router.push("/admin-login")
    }
  }, [isAdmin, router])

  if (isAdmin === null) {
    // Loading state
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    )
  }

  if (isAdmin === false) {
    // Unauthorized access
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="p-4 bg-red-100 rounded-full w-16 h-16 mx-auto mb-4">
              <Lock className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Restricted</h2>
            <p className="text-gray-600 mb-6">This area is restricted to authorized administrators only.</p>
            <div className="flex items-center justify-center gap-3 mb-4">
              <TestTube className="h-5 w-5 text-red-600" />
              <span className="font-bold text-red-600">SUGAR DIAGNOSTIC LAB</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}
