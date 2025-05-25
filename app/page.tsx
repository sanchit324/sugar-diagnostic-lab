"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { FileText, Download, Loader2, Search, Plus, User } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Navigation } from "@/components/navigation"
import { AdminGuard } from "@/components/admin-guard"
import { supabase, type Patient } from "@/lib/supabase"

interface FormData {
  testType: string
  patientName: string
  age: string
  sex: string
  // CBC fields
  hemoglobin: string
  totalLeukocyteCount: string
  neutrophils: string
  lymphocytes: string
  eosinophils: string
  monocytes: string
  basophils: string
  plateletCount: string
  totalRbcCount: string
  hematocrit: string
  mcv: string
  mch: string
  mchc: string
  // LFT fields
  serumBilirubinTotal: string
  serumBilirubinDirect: string
  serumBilirubinIndirect: string
  sgptAlt: string
  sgotAst: string
  serumAlkalinePhosphatase: string
  serumProtein: string
  serumAlbumin: string
  globulin: string
  agRatio: string
}

function LabReportGeneratorContent() {
  const [formData, setFormData] = useState<FormData>({
    testType: "CBC",
    patientName: "",
    age: "",
    sex: "M",
    // CBC fields
    hemoglobin: "",
    totalLeukocyteCount: "",
    neutrophils: "",
    lymphocytes: "",
    eosinophils: "",
    monocytes: "",
    basophils: "",
    plateletCount: "",
    totalRbcCount: "",
    hematocrit: "",
    mcv: "",
    mch: "",
    mchc: "",
    // LFT fields
    serumBilirubinTotal: "",
    serumBilirubinDirect: "",
    serumBilirubinIndirect: "",
    sgptAlt: "",
    sgotAst: "",
    serumAlkalinePhosphatase: "",
    serumProtein: "",
    serumAlbumin: "",
    globulin: "",
    agRatio: "",
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<Patient[]>([])
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [showNewPatientForm, setShowNewPatientForm] = useState(false)
  const { toast } = useToast()

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const searchPatients = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    try {
      const { data, error } = await supabase
        .from("patients")
        .select("*")
        .or(`name.ilike.%${searchTerm}%,reg_no.ilike.%${searchTerm}%`)
        .order("created_at", { ascending: false })
        .limit(10)

      if (error) throw error
      setSearchResults(data || [])
    } catch (error) {
      console.error("Error searching patients:", error)
      toast({
        title: "Search Error",
        description: "Failed to search for patients",
        variant: "destructive",
      })
    } finally {
      setIsSearching(false)
    }
  }

  const selectExistingPatient = (patient: Patient) => {
    setSelectedPatient(patient)
    setFormData((prev) => ({
      ...prev,
      patientName: patient.name,
      age: patient.age.toString(),
      sex: patient.sex,
    }))
    setSearchResults([])
    setShowNewPatientForm(false)
  }

  const createNewPatient = () => {
    setSelectedPatient(null)
    setShowNewPatientForm(true)
    setSearchResults([])
    setFormData((prev) => ({
      ...prev,
      patientName: "",
      age: "",
      sex: "M",
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.patientName || !formData.age) {
      toast({
        title: "Missing Information",
        description: "Please fill in at least the patient name and age.",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)

    try {
      // Prepare the data to send
      const submitData = {
        ...formData,
        existingPatientId: selectedPatient?.id || null,
      }

      // First save to database
      const saveResponse = await fetch("/api/save-patient", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      })

      if (!saveResponse.ok) {
        throw new Error("Failed to save patient data")
      }

      const saveResult = await saveResponse.json()

      // Then generate PDF
      const response = await fetch("/api/generate-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          regNo: saveResult.patient.reg_no, // Use the actual reg number from database
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate report")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.style.display = "none"
      a.href = url
      const testTypeName = formData.testType === "CBC" ? "cbc" : "lft"
      a.download = `sugar_diagnostic_${testTypeName}_report_${formData.patientName.replace(/\s+/g, "_")}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: "Success",
        description: selectedPatient
          ? `New ${formData.testType} test added for existing patient ${formData.patientName}`
          : `New patient registered and ${formData.testType} report generated successfully.`,
      })

      // Reset form but keep patient if it was existing
      const resetFormData = {
        testType: "CBC",
        patientName: selectedPatient ? formData.patientName : "",
        age: selectedPatient ? formData.age : "",
        sex: selectedPatient ? formData.sex : "M",
        hemoglobin: "",
        totalLeukocyteCount: "",
        neutrophils: "",
        lymphocytes: "",
        eosinophils: "",
        monocytes: "",
        basophils: "",
        plateletCount: "",
        totalRbcCount: "",
        hematocrit: "",
        mcv: "",
        mch: "",
        mchc: "",
        serumBilirubinTotal: "",
        serumBilirubinDirect: "",
        serumBilirubinIndirect: "",
        sgptAlt: "",
        sgotAst: "",
        serumAlkalinePhosphatase: "",
        serumProtein: "",
        serumAlbumin: "",
        globulin: "",
        agRatio: "",
      }

      setFormData(resetFormData)

      // If it was a new patient, update the selected patient
      if (!selectedPatient) {
        setSelectedPatient(saveResult.patient)
        setShowNewPatientForm(false)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save patient data or generate report. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <Navigation />

        <div className="max-w-4xl mx-auto">
          {/* Patient Selection Card */}
          <Card className="shadow-lg border-0 mb-6">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2 text-xl">
                <User className="h-5 w-5" />
                Patient Selection
              </CardTitle>
              <CardDescription className="text-blue-100">
                Search for existing patient or create a new patient record
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {!selectedPatient && !showNewPatientForm ? (
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      type="text"
                      placeholder="Search by patient name or registration number..."
                      onChange={(e) => searchPatients(e.target.value)}
                      className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                    {isSearching && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                      </div>
                    )}
                  </div>

                  {searchResults.length > 0 && (
                    <div className="border rounded-lg max-h-60 overflow-y-auto">
                      {searchResults.map((patient) => (
                        <div
                          key={patient.id}
                          className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                          onClick={() => selectExistingPatient(patient)}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium text-gray-900">{patient.name}</p>
                              <p className="text-sm text-gray-600">
                                Reg: {patient.reg_no} • Age: {patient.age} • Sex: {patient.sex}
                              </p>
                            </div>
                            <Button size="sm" variant="outline">
                              Select
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-center pt-4">
                    <Button onClick={createNewPatient} className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Create New Patient
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedPatient ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-green-900">Selected Patient: {selectedPatient.name}</p>
                          <p className="text-sm text-green-700">
                            Reg: {selectedPatient.reg_no} • Age: {selectedPatient.age} • Sex: {selectedPatient.sex}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedPatient(null)
                            setFormData((prev) => ({ ...prev, patientName: "", age: "", sex: "M" }))
                          }}
                        >
                          Change Patient
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-blue-900">Creating New Patient</p>
                          <p className="text-sm text-blue-700">Fill in the patient information below</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setShowNewPatientForm(false)
                            setFormData((prev) => ({ ...prev, patientName: "", age: "", sex: "M" }))
                          }}
                        >
                          Search Existing
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Report Generation Form */}
          {(selectedPatient || showNewPatientForm) && (
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <FileText className="h-5 w-5" />
                  Generate Lab Report
                </CardTitle>
                <CardDescription className="text-red-100">
                  {selectedPatient
                    ? `Adding new test for ${selectedPatient.name}`
                    : "Enter patient information and test results"}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Test Type Selection */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Test Type</h3>
                    <div className="space-y-2">
                      <Label htmlFor="testType" className="text-gray-700 font-medium">
                        Select Test Type *
                      </Label>
                      <select
                        id="testType"
                        value={formData.testType}
                        onChange={(e) => handleInputChange("testType", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-red-500 focus:ring-red-500"
                        required
                      >
                        <option value="CBC">Complete Blood Count (CBC)</option>
                        <option value="LFT">Liver Function Test (LFT)</option>
                      </select>
                    </div>
                  </div>

                  <Separator />

                  {/* Patient Information - Only show if creating new patient */}
                  {showNewPatientForm && (
                    <>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                          Patient Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="patientName" className="text-gray-700 font-medium">
                              Patient Name *
                            </Label>
                            <Input
                              id="patientName"
                              type="text"
                              value={formData.patientName}
                              onChange={(e) => handleInputChange("patientName", e.target.value)}
                              placeholder="Enter patient's full name"
                              className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="age" className="text-gray-700 font-medium">
                              Age *
                            </Label>
                            <Input
                              id="age"
                              type="number"
                              value={formData.age}
                              onChange={(e) => handleInputChange("age", e.target.value)}
                              placeholder="Enter age"
                              className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="sex" className="text-gray-700 font-medium">
                              Sex
                            </Label>
                            <select
                              id="sex"
                              value={formData.sex}
                              onChange={(e) => handleInputChange("sex", e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-red-500 focus:ring-red-500"
                            >
                              <option value="M">Male</option>
                              <option value="F">Female</option>
                            </select>
                          </div>
                        </div>
                      </div>
                      <Separator />
                    </>
                  )}

                  {/* Test Parameters - CBC */}
                  {formData.testType === "CBC" && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Complete Blood Count (CBC)</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="hemoglobin" className="text-gray-700 font-medium">
                            Hemoglobin (g/dL)
                          </Label>
                          <Input
                            id="hemoglobin"
                            type="number"
                            step="0.1"
                            value={formData.hemoglobin}
                            onChange={(e) => handleInputChange("hemoglobin", e.target.value)}
                            placeholder="e.g., 15.0"
                            className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="totalLeukocyteCount" className="text-gray-700 font-medium">
                            Total Leukocyte Count (cumm)
                          </Label>
                          <Input
                            id="totalLeukocyteCount"
                            type="number"
                            value={formData.totalLeukocyteCount}
                            onChange={(e) => handleInputChange("totalLeukocyteCount", e.target.value)}
                            placeholder="e.g., 5100"
                            className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="plateletCount" className="text-gray-700 font-medium">
                            Platelet Count (lakhs/cumm)
                          </Label>
                          <Input
                            id="plateletCount"
                            type="number"
                            step="0.1"
                            value={formData.plateletCount}
                            onChange={(e) => handleInputChange("plateletCount", e.target.value)}
                            placeholder="e.g., 3.5"
                            className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                          />
                        </div>
                      </div>

                      <h4 className="text-md font-semibold text-gray-700 mt-6 mb-4">
                        Differential Leucocyte Count (%)
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="neutrophils" className="text-gray-700 font-medium">
                            Neutrophils (%)
                          </Label>
                          <Input
                            id="neutrophils"
                            type="number"
                            value={formData.neutrophils}
                            onChange={(e) => handleInputChange("neutrophils", e.target.value)}
                            placeholder="e.g., 79"
                            className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lymphocytes" className="text-gray-700 font-medium">
                            Lymphocytes (%)
                          </Label>
                          <Input
                            id="lymphocytes"
                            type="number"
                            value={formData.lymphocytes}
                            onChange={(e) => handleInputChange("lymphocytes", e.target.value)}
                            placeholder="e.g., 18"
                            className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="eosinophils" className="text-gray-700 font-medium">
                            Eosinophils (%)
                          </Label>
                          <Input
                            id="eosinophils"
                            type="number"
                            value={formData.eosinophils}
                            onChange={(e) => handleInputChange("eosinophils", e.target.value)}
                            placeholder="e.g., 1"
                            className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="monocytes" className="text-gray-700 font-medium">
                            Monocytes (%)
                          </Label>
                          <Input
                            id="monocytes"
                            type="number"
                            value={formData.monocytes}
                            onChange={(e) => handleInputChange("monocytes", e.target.value)}
                            placeholder="e.g., 1"
                            className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="basophils" className="text-gray-700 font-medium">
                            Basophils (%)
                          </Label>
                          <Input
                            id="basophils"
                            type="number"
                            value={formData.basophils}
                            onChange={(e) => handleInputChange("basophils", e.target.value)}
                            placeholder="e.g., 1"
                            className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                          />
                        </div>
                      </div>

                      <h4 className="text-md font-semibold text-gray-700 mt-6 mb-4">Additional Parameters</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="totalRbcCount" className="text-gray-700 font-medium">
                            Total RBC Count (million/cumm)
                          </Label>
                          <Input
                            id="totalRbcCount"
                            type="number"
                            step="0.1"
                            value={formData.totalRbcCount}
                            onChange={(e) => handleInputChange("totalRbcCount", e.target.value)}
                            placeholder="e.g., 5.0"
                            className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="hematocrit" className="text-gray-700 font-medium">
                            Hematocrit (%)
                          </Label>
                          <Input
                            id="hematocrit"
                            type="number"
                            value={formData.hematocrit}
                            onChange={(e) => handleInputChange("hematocrit", e.target.value)}
                            placeholder="e.g., 42"
                            className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="mcv" className="text-gray-700 font-medium">
                            MCV (fL)
                          </Label>
                          <Input
                            id="mcv"
                            type="number"
                            step="0.1"
                            value={formData.mcv}
                            onChange={(e) => handleInputChange("mcv", e.target.value)}
                            placeholder="e.g., 84.0"
                            className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="mch" className="text-gray-700 font-medium">
                            MCH (Pg)
                          </Label>
                          <Input
                            id="mch"
                            type="number"
                            step="0.1"
                            value={formData.mch}
                            onChange={(e) => handleInputChange("mch", e.target.value)}
                            placeholder="e.g., 30.0"
                            className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="mchc" className="text-gray-700 font-medium">
                            MCHC (%)
                          </Label>
                          <Input
                            id="mchc"
                            type="number"
                            step="0.1"
                            value={formData.mchc}
                            onChange={(e) => handleInputChange("mchc", e.target.value)}
                            placeholder="e.g., 35.7"
                            className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Test Parameters - LFT */}
                  {formData.testType === "LFT" && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Liver Function Test (LFT)</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="serumBilirubinTotal" className="text-gray-700 font-medium">
                            Serum Bilirubin Total (mg/dl)
                          </Label>
                          <Input
                            id="serumBilirubinTotal"
                            type="number"
                            step="0.1"
                            value={formData.serumBilirubinTotal}
                            onChange={(e) => handleInputChange("serumBilirubinTotal", e.target.value)}
                            placeholder="e.g., 0.9"
                            className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="serumBilirubinDirect" className="text-gray-700 font-medium">
                            Serum Bilirubin Direct (mg/dl)
                          </Label>
                          <Input
                            id="serumBilirubinDirect"
                            type="number"
                            step="0.1"
                            value={formData.serumBilirubinDirect}
                            onChange={(e) => handleInputChange("serumBilirubinDirect", e.target.value)}
                            placeholder="e.g., 0.2"
                            className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="serumBilirubinIndirect" className="text-gray-700 font-medium">
                            Serum Bilirubin Indirect (mg/dl)
                          </Label>
                          <Input
                            id="serumBilirubinIndirect"
                            type="number"
                            step="0.1"
                            value={formData.serumBilirubinIndirect}
                            onChange={(e) => handleInputChange("serumBilirubinIndirect", e.target.value)}
                            placeholder="e.g., 0.70"
                            className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="sgptAlt" className="text-gray-700 font-medium">
                            SGPT (ALT) (U/l)
                          </Label>
                          <Input
                            id="sgptAlt"
                            type="number"
                            value={formData.sgptAlt}
                            onChange={(e) => handleInputChange("sgptAlt", e.target.value)}
                            placeholder="e.g., 36"
                            className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="sgotAst" className="text-gray-700 font-medium">
                            SGOT (AST) (U/l)
                          </Label>
                          <Input
                            id="sgotAst"
                            type="number"
                            value={formData.sgotAst}
                            onChange={(e) => handleInputChange("sgotAst", e.target.value)}
                            placeholder="e.g., 32"
                            className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="serumAlkalinePhosphatase" className="text-gray-700 font-medium">
                            Serum Alkaline Phosphatase (U/l)
                          </Label>
                          <Input
                            id="serumAlkalinePhosphatase"
                            type="number"
                            value={formData.serumAlkalinePhosphatase}
                            onChange={(e) => handleInputChange("serumAlkalinePhosphatase", e.target.value)}
                            placeholder="e.g., 11"
                            className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="serumProtein" className="text-gray-700 font-medium">
                            Serum Protein (g/dl)
                          </Label>
                          <Input
                            id="serumProtein"
                            type="number"
                            step="0.1"
                            value={formData.serumProtein}
                            onChange={(e) => handleInputChange("serumProtein", e.target.value)}
                            placeholder="e.g., 7.2"
                            className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="serumAlbumin" className="text-gray-700 font-medium">
                            Serum Albumin (g/dl)
                          </Label>
                          <Input
                            id="serumAlbumin"
                            type="number"
                            step="0.1"
                            value={formData.serumAlbumin}
                            onChange={(e) => handleInputChange("serumAlbumin", e.target.value)}
                            placeholder="e.g., 4.7"
                            className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="globulin" className="text-gray-700 font-medium">
                            Globulin (g/dl)
                          </Label>
                          <Input
                            id="globulin"
                            type="number"
                            step="0.1"
                            value={formData.globulin}
                            onChange={(e) => handleInputChange("globulin", e.target.value)}
                            placeholder="e.g., 2.50"
                            className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="agRatio" className="text-gray-700 font-medium">
                            A/G Ratio
                          </Label>
                          <Input
                            id="agRatio"
                            type="number"
                            step="0.01"
                            value={formData.agRatio}
                            onChange={(e) => handleInputChange("agRatio", e.target.value)}
                            placeholder="e.g., 1.88"
                            className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <Separator />

                  {/* Submit Button */}
                  <div className="flex justify-center">
                    <Button
                      type="submit"
                      disabled={isGenerating}
                      className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 text-lg font-medium"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Generating Report...
                        </>
                      ) : (
                        <>
                          <Download className="mr-2 h-5 w-5" />
                          Generate {formData.testType} Report
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500">
          <p>© 2024 Sugar Diagnostic Lab - Professional Lab Report Generator</p>
        </div>
      </div>
    </div>
  )
}

export default function LabReportGenerator() {
  return (
    <AdminGuard>
      <LabReportGeneratorContent />
    </AdminGuard>
  )
}
