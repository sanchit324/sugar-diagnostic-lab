"use client"

import type React from "react"

import { useState, useEffect } from "react"
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
import { useRouter } from "next/navigation"

function TestInputRow({
  testName,
  value,
  referenceRange,
  onChange,
  onRemove,
  isCustom,
}: {
  testName: string
  value: string
  referenceRange: string
  onChange: (field: "name" | "value" | "ref", value: string) => void
  onRemove?: () => void
  isCustom?: boolean
}) {
  return (
    <div className="grid grid-cols-3 items-center gap-4 py-2 border-b last:border-b-0">
      <div className="flex items-center gap-2">
        {isCustom ? (
          <Input
            type="text"
            value={testName}
            onChange={(e) => onChange("name", e.target.value)}
            placeholder="Test Name"
            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          />
        ) : (
          <Label className="text-gray-700">{testName}</Label>
        )}
        {isCustom && onRemove && (
          <Button type="button" size="sm" variant="ghost" onClick={onRemove} aria-label="Remove Test">
            ✕
          </Button>
        )}
      </div>
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange("value", e.target.value)}
        placeholder="Enter value"
        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
      />
      {isCustom ? (
        <Input
          type="text"
          value={referenceRange}
          onChange={(e) => onChange("ref", e.target.value)}
          placeholder="Reference Range"
          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
        />
      ) : (
        <p className="text-gray-600">{referenceRange}</p>
      )}
    </div>
  )
}

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
  referredBy: string
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
    referredBy: "SELF",
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<Patient[]>([])
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [showNewPatientForm, setShowNewPatientForm] = useState(false)
  const { toast } = useToast()
  const [customTests, setCustomTests] = useState<{
    name: string
    value: string
    ref: string
  }[]>([])

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

  const handleCustomTestChange = (idx: number, field: "name" | "value" | "ref", value: string) => {
    setCustomTests((prev) => {
      const updated = [...prev]
      updated[idx] = { ...updated[idx], [field]: value }
      return updated
    })
  }

  const handleAddCustomTest = () => {
    setCustomTests((prev) => [...prev, { name: "", value: "", ref: "" }])
  }

  const handleRemoveCustomTest = (idx: number) => {
    setCustomTests((prev) => prev.filter((_, i) => i !== idx))
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
        customTests: customTests.filter((t) => t.name && t.value && t.ref),
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
          testType: "CBC",
          customTests: customTests.filter((t) => t.name && t.value && t.ref),
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
        referredBy: "SELF",
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

  const testGroups = [
    {
      title: "Hematology",
      tests: [
        { name: "Hemoglobin", key: "hemoglobin", ref: "11-16 gm/dl" },
        { name: "Total RBC Count", key: "totalRbcCount", ref: "3.5-6 mill/cumm" },
        { name: "Hematocrit Value (HCT)", key: "hematocrit", ref: "36-47%" },
        { name: "Mean Corpuscular Volume (MCV)", key: "mcv", ref: "80-105 fL" },
        { name: "Mean Cell Hemoglobin (MCH)", key: "mch", ref: "27-32 pg/mL" },
        { name: "Mean Cell Hemoglobin Conc. (MCHC)", key: "mchc", ref: "32-36 gm/dL" },
      ],
    },
    {
      title: "White Blood Cell Count",
      tests: [{ name: "Total Leukocyte Count", key: "totalLeukocyteCount", ref: "4000-11000/cumm" }],
    },
    {
      title: "Differential Leukocyte Count",
      tests: [
        { name: "Neutrophils", key: "neutrophils", ref: "40-70 %" },
        { name: "Lymphocytes", key: "lymphocytes", ref: "20-40 %" },
        { name: "Eosinophils", key: "eosinophils", ref: "02-04 %" },
        { name: "Monocytes", key: "monocytes", ref: "00-03%" },
        { name: "Basophils", key: "basophils", ref: "00-02%" },
      ],
    },
    {
      title: "Platelet Count",
      tests: [{ name: "Platelet Count", key: "plateletCount", ref: "1.5-4.5 lac/cumm" }],
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <Navigation />

        <div className="max-w-4xl mx-auto">
          {/* Report Generation Form */}
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <FileText className="h-5 w-5" />
                  Generate Lab Report
                </CardTitle>
                <CardDescription className="text-red-100">
                Enter patient information and test results
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

                {/* Patient Information */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                          Patient Information
                        </h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
                        onChange={(e) => handleInputChange("sex", e.target.value as "Male" | "Female")}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        aria-label="Sex"
                        title="Sex"
                      >
                        <option>Male</option>
                        <option>Female</option>
                            </select>
                          </div>
                    <div className="space-y-2">
                      <Label htmlFor="referredBy" className="text-gray-700 font-medium">
                        Referred By
                      </Label>
                      <Input
                        id="referredBy"
                        type="text"
                        value={formData.referredBy}
                        onChange={(e) => handleInputChange("referredBy", e.target.value)}
                        placeholder="SELF"
                        className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                      />
                    </div>
                        </div>
                      </div>
                      <Separator />

                  {/* Test Parameters - CBC */}
                  {formData.testType === "CBC" && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Complete Blood Count (CBC)</h3>
                    <div className="space-y-6">
                      {testGroups.map((group) => (
                        <div key={group.title} className="p-6 bg-white rounded-lg shadow-md border border-gray-200">
                          <h4 className="text-lg font-medium text-blue-700 mb-4">{group.title}</h4>
                          <div className="grid grid-cols-3 items-center gap-4 font-semibold text-gray-600 mb-2">
                            <p>Test Name</p>
                            <p>Value</p>
                            <p>Reference Range</p>
                        </div>
                          {group.tests.map((test) => (
                            <TestInputRow
                              key={test.key}
                              testName={test.name}
                              value={formData[test.key as keyof FormData]}
                              referenceRange={test.ref}
                              onChange={(field, value) => handleInputChange(test.key as keyof FormData, value)}
                            />
                          ))}
                        </div>
                      ))}
                      {/* Custom Tests Section */}
                      <div className="p-6 bg-white rounded-lg shadow-md border border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-medium text-blue-700">Custom Tests</h3>
                          <Button type="button" variant="outline" onClick={handleAddCustomTest}>
                            + Add Test
                          </Button>
                        </div>
                        <div className="grid grid-cols-3 items-center gap-4 font-semibold text-gray-600 mb-2">
                          <p>Test Name</p>
                          <p>Value</p>
                          <p>Reference Range</p>
                        </div>
                        {customTests.map((test, idx) => (
                          <TestInputRow
                            key={idx}
                            testName={test.name}
                            value={test.value}
                            referenceRange={test.ref}
                            onChange={(field, value) => handleCustomTestChange(idx, field as any, value)}
                            onRemove={() => handleRemoveCustomTest(idx)}
                            isCustom
                          />
                        ))}
                      </div>
                      </div>
                    </div>
                  )}

                  {/* Test Parameters - LFT */}
                  {formData.testType === "LFT" && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Liver Function Test (LFT)</h3>
                      <div className="space-y-6">
                        {/* Group 1: Bilirubin */}
                        <div className="p-6 bg-white rounded-lg shadow-md border border-gray-200">
                          <h4 className="text-lg font-medium text-blue-700 mb-4">Bilirubin</h4>
                          <div className="grid grid-cols-3 items-center gap-4 font-semibold text-gray-600 mb-2">
                            <p>Test Name</p>
                            <p>Value</p>
                            <p>Reference Range</p>
                          </div>
                          <TestInputRow
                            testName="Serum Bilirubin (Total)"
                            value={formData.serumBilirubinTotal}
                            referenceRange="0.2 - 1.2 mg/dL"
                            onChange={(field, value) => handleInputChange("serumBilirubinTotal", value)}
                          />
                          <TestInputRow
                            testName="Serum Bilirubin (Direct)"
                            value={formData.serumBilirubinDirect}
                            referenceRange="0.0 - 0.3 mg/dL"
                            onChange={(field, value) => handleInputChange("serumBilirubinDirect", value)}
                          />
                          <TestInputRow
                            testName="Serum Bilirubin (Indirect)"
                            value={formData.serumBilirubinIndirect}
                            referenceRange="0.1 - 1.0 mg/dL"
                            onChange={(field, value) => handleInputChange("serumBilirubinIndirect", value)}
                          />
                        </div>
                        {/* Group 2: Enzymes */}
                        <div className="p-6 bg-white rounded-lg shadow-md border border-gray-200">
                          <h4 className="text-lg font-medium text-blue-700 mb-4">Enzymes</h4>
                          <div className="grid grid-cols-3 items-center gap-4 font-semibold text-gray-600 mb-2">
                            <p>Test Name</p>
                            <p>Value</p>
                            <p>Reference Range</p>
                          </div>
                          <TestInputRow
                            testName="SGPT (ALT)"
                            value={formData.sgptAlt}
                            referenceRange="5 - 40 U/L"
                            onChange={(field, value) => handleInputChange("sgptAlt", value)}
                          />
                          <TestInputRow
                            testName="SGOT (AST)"
                            value={formData.sgotAst}
                            referenceRange="5 - 40 U/L"
                            onChange={(field, value) => handleInputChange("sgotAst", value)}
                          />
                          <TestInputRow
                            testName="Serum Alkaline Phosphatase"
                            value={formData.serumAlkalinePhosphatase}
                            referenceRange="40 - 129 U/L"
                            onChange={(field, value) => handleInputChange("serumAlkalinePhosphatase", value)}
                          />
                        </div>
                        {/* Group 3: Proteins */}
                        <div className="p-6 bg-white rounded-lg shadow-md border border-gray-200">
                          <h4 className="text-lg font-medium text-blue-700 mb-4">Proteins</h4>
                          <div className="grid grid-cols-3 items-center gap-4 font-semibold text-gray-600 mb-2">
                            <p>Test Name</p>
                            <p>Value</p>
                            <p>Reference Range</p>
                          </div>
                          <TestInputRow
                            testName="Serum Protein (Total)"
                            value={formData.serumProtein}
                            referenceRange="6.0 - 8.3 g/dL"
                            onChange={(field, value) => handleInputChange("serumProtein", value)}
                          />
                          <TestInputRow
                            testName="Serum Albumin"
                            value={formData.serumAlbumin}
                            referenceRange="3.4 - 5.4 g/dL"
                            onChange={(field, value) => handleInputChange("serumAlbumin", value)}
                          />
                          <TestInputRow
                            testName="Globulin"
                            value={formData.globulin}
                            referenceRange="2.0 - 3.5 g/dL"
                            onChange={(field, value) => handleInputChange("globulin", value)}
                          />
                          <TestInputRow
                            testName="A/G Ratio"
                            value={formData.agRatio}
                            referenceRange="1.0 - 2.2"
                            onChange={(field, value) => handleInputChange("agRatio", value)}
                          />
                        </div>
                        {/* Custom Tests Section for LFT */}
                        <div className="p-6 bg-white rounded-lg shadow-md border border-gray-200">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium text-blue-700">Custom Tests</h3>
                            <Button type="button" variant="outline" onClick={handleAddCustomTest}>
                              + Add Test
                            </Button>
                          </div>
                          <div className="grid grid-cols-3 items-center gap-4 font-semibold text-gray-600 mb-2">
                            <p>Test Name</p>
                            <p>Value</p>
                            <p>Reference Range</p>
                          </div>
                          {customTests.map((test, idx) => (
                            <TestInputRow
                              key={idx}
                              testName={test.name}
                              value={test.value}
                              referenceRange={test.ref}
                              onChange={(field, value) => handleCustomTestChange(idx, field as any, value)}
                              onRemove={() => handleRemoveCustomTest(idx)}
                              isCustom
                            />
                          ))}
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
  const router = useRouter()
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isAdmin = localStorage.getItem("isAdmin") === "true"
      if (!isAdmin) {
        router.replace("/admin-login")
      }
    }
  }, [router])

  return <LabReportGeneratorContent />
}
