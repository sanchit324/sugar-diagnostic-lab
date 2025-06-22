"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { AdminGuard } from "@/components/admin-guard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { supabase, type PatientWithTests } from "@/lib/supabase"
import { Search, Download, Calendar, User, TestTube2, Filter, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface FilterState {
  name: string
  regNo: string
  testType: string
  dateFrom: string
  dateTo: string
}

function AdminPanelContent() {
  const [patients, setPatients] = useState<PatientWithTests[]>([])
  const [filteredPatients, setFilteredPatients] = useState<PatientWithTests[]>([])
  const [filters, setFilters] = useState<FilterState>({
    name: "",
    regNo: "",
    testType: "",
    dateFrom: "",
    dateTo: "",
  })
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchPatients()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [filters, patients])

  const applyFilters = () => {
    let filtered = patients

    // Filter by name
    if (filters.name.trim()) {
      filtered = filtered.filter((patient) => patient.name.toLowerCase().includes(filters.name.toLowerCase()))
    }

    // Filter by registration number
    if (filters.regNo.trim()) {
      filtered = filtered.filter((patient) => patient.reg_no.toLowerCase().includes(filters.regNo.toLowerCase()))
    }

    // Filter by test type
    if (filters.testType && filters.testType !== "all") {
      filtered = filtered.filter((patient) => patient.test_results.some((test) => test.test_type === filters.testType))
    }

    // Filter by date range
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom)
      filtered = filtered.filter((patient) => {
        const patientDate = new Date(patient.created_at)
        return patientDate >= fromDate
      })
    }

    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo)
      toDate.setHours(23, 59, 59, 999) // Include the entire day
      filtered = filtered.filter((patient) => {
        const patientDate = new Date(patient.created_at)
        return patientDate <= toDate
      })
    }

    setFilteredPatients(filtered)
  }

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const clearAllFilters = () => {
    setFilters({
      name: "",
      regNo: "",
      testType: "",
      dateFrom: "",
      dateTo: "",
    })
  }

  const getActiveFilterCount = () => {
    return Object.values(filters).filter((value) => value.trim() !== "").length
  }

  const fetchPatients = async () => {
    try {
      const { data: patientsData, error: patientsError } = await supabase
        .from("patients")
        .select(`
          *,
          test_results (*)
        `)
        .order("created_at", { ascending: false })

      if (patientsError) throw patientsError

      setPatients(patientsData || [])
      setFilteredPatients(patientsData || [])
    } catch (error) {
      console.error("Error fetching patients:", error)
      toast({
        title: "Error",
        description: "Failed to fetch patient data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const downloadReport = async (patient: PatientWithTests, testResult: any) => {
    try {
      const formData = {
        testType: testResult.test_type,
        patientName: patient.name,
        age: patient.age.toString(),
        sex: patient.sex,
        ...testResult.test_data,
      }

      const response = await fetch("/api/generate-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error("Failed to generate report")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.style.display = "none"
      a.href = url
      const testTypeName = testResult.test_type.toLowerCase()
      a.download = `sugar_diagnostic_${testTypeName}_report_${patient.name.replace(/\s+/g, "_")}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: "Report Downloaded",
        description: `${testResult.test_type} report for ${patient.name} has been downloaded.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download the report",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-white">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading patient data...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Panel</h1>
          <p className="text-gray-600">Manage patient records and lab reports</p>
        </div>

        {/* Enhanced Search and Filters */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Search & Filter
                </CardTitle>
                <CardDescription>Use multiple filters to find specific patients and reports</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {getActiveFilterCount() > 0 && (
                  <Badge variant="secondary" className="bg-red-100 text-red-700">
                    {getActiveFilterCount()} filter{getActiveFilterCount() > 1 ? "s" : ""} active
                  </Badge>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className="flex items-center gap-2"
                >
                  <Filter className="h-4 w-4" />
                  {showAdvancedFilters ? "Hide" : "Show"} Filters
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Quick Search Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Patient Name</label>
                <Input
                  type="text"
                  placeholder="Search by patient name..."
                  value={filters.name}
                  onChange={(e) => handleFilterChange("name", e.target.value)}
                  className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Registration Number</label>
                <Input
                  type="text"
                  placeholder="Search by reg no..."
                  value={filters.regNo}
                  onChange={(e) => handleFilterChange("regNo", e.target.value)}
                  className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Test Type</label>
                <select
                  value={filters.testType}
                  onChange={(e) => handleFilterChange("testType", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-red-500 focus:ring-red-500"
                  aria-label="Test Type"
                  title="Test Type"
                >
                  <option value="">All Test Types</option>
                  <option value="CBC">CBC Only</option>
                  <option value="LFT">LFT Only</option>
                </select>
              </div>
            </div>

            {/* Advanced Filters */}
            {showAdvancedFilters && (
              <div className="border-t pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Date From</label>
                    <Input
                      type="date"
                      value={filters.dateFrom}
                      onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
                      className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Date To</label>
                    <Input
                      type="date"
                      value={filters.dateTo}
                      onChange={(e) => handleFilterChange("dateTo", e.target.value)}
                      className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Clear Filters Button */}
            {getActiveFilterCount() > 0 && (
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAllFilters}
                  className="flex items-center gap-2 text-gray-600 hover:text-red-600"
                >
                  <X className="h-4 w-4" />
                  Clear All Filters
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-red-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Patients</p>
                  <p className="text-2xl font-bold text-gray-900">{patients.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TestTube2 className="h-4 w-4 text-red-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Tests</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {patients.reduce((acc, patient) => acc + patient.test_results.length, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-red-600" />
                <div>
                  <p className="text-sm text-gray-600">Filtered Results</p>
                  <p className="text-2xl font-bold text-gray-900">{filteredPatients.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-red-600" />
                <div>
                  <p className="text-sm text-gray-600">Active Filters</p>
                  <p className="text-2xl font-bold text-gray-900">{getActiveFilterCount()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Patient List */}
        <Card>
          <CardHeader>
            <CardTitle>Patient Records</CardTitle>
            <CardDescription>
              {filteredPatients.length === patients.length
                ? `Showing all ${patients.length} patient records`
                : `Showing ${filteredPatients.length} of ${patients.length} patient records`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredPatients.length === 0 ? (
              <div className="text-center py-8">
                <TestTube2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  {getActiveFilterCount() > 0 ? "No patients match your search criteria" : "No patients found"}
                </p>
                {getActiveFilterCount() > 0 && (
                  <Button variant="outline" size="sm" onClick={clearAllFilters} className="mt-2">
                    Clear filters to see all patients
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPatients.map((patient) => (
                  <div
                    key={patient.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-4">
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900">{patient.name}</h3>
                          <p className="text-sm text-gray-600">
                            Reg No: {patient.reg_no} • Age: {patient.age} • Sex: {patient.sex}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {new Date(patient.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {patient.test_results.length > 0 ? (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-700 mb-2">Test Reports:</p>
                        {patient.test_results.map((test) => (
                          <div key={test.id} className="flex items-center justify-between bg-gray-50 rounded-md p-3">
                            <div className="flex items-center gap-3">
                              <Badge
                                variant={test.test_type === "CBC" ? "default" : "secondary"}
                                className={
                                  test.test_type === "CBC" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"
                                }
                              >
                                {test.test_type}
                              </Badge>
                              <div>
                                <p className="text-sm font-medium">
                                  {test.test_type === "CBC" ? "Complete Blood Count" : "Liver Function Test"}
                                </p>
                                <p className="text-xs text-gray-600">
                                  Reported: {new Date(test.reported_on).toLocaleString()}
                                </p>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => downloadReport(patient, test)}
                              className="flex items-center gap-2"
                            >
                              <Download className="h-4 w-4" />
                              Download PDF
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic">No test reports available</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function AdminPanel() {
  return (
    <AdminGuard>
      <AdminPanelContent />
    </AdminGuard>
  )
}
