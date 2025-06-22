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
  // Blood Sugar
  fastingBloodSugar: string
  postPrandialBloodSugar: string
  randomBloodSugar: string
  hba1c: string
  // Renal Function
  bloodUrea: string
  serumCreatinine: string
  uricAcid: string
  // Lipid Profile
  totalCholesterol: string
  triglycerides: string
  hdlCholesterol: string
  ldlCholesterol: string
  vldlCholesterol: string
  referredBy: string
  tsh: string
  freeT3: string
  freeT4: string
  totalT3: string
  totalT4: string
  urineProtein: string
  urineGlucose: string
  urineKetones: string
  urinePh: string
  urineSpecificGravity: string
}

const testTypeOptions = [
  { value: "CBC", label: "Complete Blood Count (CBC)" },
  { value: "LFT", label: "Liver Function Test (LFT)" },
  { value: "BloodSugar", label: "Blood Sugar" },
  { value: "Renal", label: "Renal Function" },
  { value: "Lipid", label: "Lipid Profile" },
  { value: "TFT", label: "Thyroid Function Test (TFT)" },
  { value: "Urine", label: "Urine Analysis" },
];

const testGroupsMap: Record<string, { title: string; tests: { name: string; key: string; ref: string }[] }[]> = {
  CBC: [
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
  ],
  LFT: [
    {
      title: "Bilirubin",
      tests: [
        { name: "Serum Bilirubin (Total)", key: "serumBilirubinTotal", ref: "0.2 - 1.2 mg/dL" },
        { name: "Serum Bilirubin (Direct)", key: "serumBilirubinDirect", ref: "0.0 - 0.3 mg/dL" },
        { name: "Serum Bilirubin (Indirect)", key: "serumBilirubinIndirect", ref: "0.1 - 1.0 mg/dL" },
      ],
    },
    {
      title: "Enzymes",
      tests: [
        { name: "SGPT (ALT)", key: "sgptAlt", ref: "5 - 40 U/L" },
        { name: "SGOT (AST)", key: "sgotAst", ref: "5 - 40 U/L" },
        { name: "Serum Alkaline Phosphatase", key: "serumAlkalinePhosphatase", ref: "40 - 129 U/L" },
      ],
    },
    {
      title: "Proteins",
      tests: [
        { name: "Serum Protein (Total)", key: "serumProtein", ref: "6.0 - 8.3 g/dL" },
        { name: "Serum Albumin", key: "serumAlbumin", ref: "3.4 - 5.4 g/dL" },
        { name: "Globulin", key: "globulin", ref: "2.0 - 3.5 g/dL" },
        { name: "A/G Ratio", key: "agRatio", ref: "1.0 - 2.2" },
      ],
    },
  ],
  BloodSugar: [
    {
      title: "Blood Sugar",
      tests: [
        { name: "Fasting Blood Sugar", key: "fastingBloodSugar", ref: "70-100 mg/dL" },
        { name: "Post Prandial Blood Sugar", key: "postPrandialBloodSugar", ref: "<140 mg/dL" },
        { name: "Random Blood Sugar", key: "randomBloodSugar", ref: "<200 mg/dL" },
        { name: "HbA1c", key: "hba1c", ref: "4.0-5.6 %" },
      ],
    },
  ],
  Renal: [
    {
      title: "Renal Function",
      tests: [
        { name: "Blood Urea", key: "bloodUrea", ref: "15-40 mg/dL" },
        { name: "Serum Creatinine", key: "serumCreatinine", ref: "0.6-1.3 mg/dL" },
        { name: "Uric Acid", key: "uricAcid", ref: "3.5-7.2 mg/dL" },
      ],
    },
  ],
  Lipid: [
    {
      title: "Lipid Profile",
      tests: [
        { name: "Total Cholesterol", key: "totalCholesterol", ref: "<200 mg/dL" },
        { name: "Triglycerides", key: "triglycerides", ref: "<150 mg/dL" },
        { name: "HDL Cholesterol", key: "hdlCholesterol", ref: ">40 mg/dL" },
        { name: "LDL Cholesterol", key: "ldlCholesterol", ref: "<100 mg/dL" },
        { name: "VLDL Cholesterol", key: "vldlCholesterol", ref: "<30 mg/dL" },
      ],
    },
  ],
  TFT: [
    {
      title: "Thyroid Function Test",
      tests: [
        { name: "TSH (Thyroid Stimulating Hormone)", key: "tsh", ref: "0.4-4.0 mIU/L" },
        { name: "Free T3 (Triiodothyronine)", key: "freeT3", ref: "2.0-4.4 pg/mL" },
        { name: "Free T4 (Thyroxine)", key: "freeT4", ref: "0.93-1.7 ng/dL" },
        { name: "Total T3", key: "totalT3", ref: "80-200 ng/dL" },
        { name: "Total T4", key: "totalT4", ref: "5.1-14.1 µg/dL" },
      ],
    },
  ],
  Urine: [
    {
      title: "Urine Analysis",
      tests: [
        { name: "Urine Protein", key: "urineProtein", ref: "Negative" },
        { name: "Urine Glucose", key: "urineGlucose", ref: "Negative" },
        { name: "Urine Ketones", key: "urineKetones", ref: "Negative" },
        { name: "Urine pH", key: "urinePh", ref: "4.6-8.0" },
        { name: "Urine Specific Gravity", key: "urineSpecificGravity", ref: "1.005-1.030" },
      ],
    },
  ],
};

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
    // Blood Sugar
    fastingBloodSugar: "",
    postPrandialBloodSugar: "",
    randomBloodSugar: "",
    hba1c: "",
    // Renal Function
    bloodUrea: "",
    serumCreatinine: "",
    uricAcid: "",
    // Lipid Profile
    totalCholesterol: "",
    triglycerides: "",
    hdlCholesterol: "",
    ldlCholesterol: "",
    vldlCholesterol: "",
    referredBy: "SELF",
    tsh: "",
    freeT3: "",
    freeT4: "",
    totalT3: "",
    totalT4: "",
    urineProtein: "",
    urineGlucose: "",
    urineKetones: "",
    urinePh: "",
    urineSpecificGravity: "",
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
          testType: formData.testType,
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
        fastingBloodSugar: "",
        postPrandialBloodSugar: "",
        randomBloodSugar: "",
        hba1c: "",
        bloodUrea: "",
        serumCreatinine: "",
        uricAcid: "",
        totalCholesterol: "",
        triglycerides: "",
        hdlCholesterol: "",
        ldlCholesterol: "",
        vldlCholesterol: "",
        referredBy: "SELF",
        tsh: "",
        freeT3: "",
        freeT4: "",
        totalT3: "",
        totalT4: "",
        urineProtein: "",
        urineGlucose: "",
        urineKetones: "",
        urinePh: "",
        urineSpecificGravity: "",
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
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto mt-0">
          {/* Report Generation Form */}
            <Card className="shadow-lg border-0 min-h-[700px]">
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
                        aria-label="Test Type"
                        title="Test Type"
                      >
                        {testTypeOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
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

                  {/* Render only the selected test type's groups */}
                  {testGroupsMap[formData.testType] && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">{testTypeOptions.find(t => t.value === formData.testType)?.label}</h3>
                      <div className="space-y-6">
                        {testGroupsMap[formData.testType].map((group) => (
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
