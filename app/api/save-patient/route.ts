import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json()
    let patientData

    // Check if we're using an existing patient
    if (formData.existingPatientId) {
      // Get existing patient data
      const { data: existingPatient, error: fetchError } = await supabase
        .from("patients")
        .select("*")
        .eq("id", formData.existingPatientId)
        .single()

      if (fetchError) {
        console.error("Error fetching existing patient:", fetchError)
        throw fetchError
      }

      patientData = existingPatient
    } else {
      // Create new patient
      // Generate registration number
      const regNo = `REG${Date.now()}`

      // Insert patient data
      const { data: newPatient, error: patientError } = await supabase
        .from("patients")
        .insert({
          name: formData.patientName,
          age: Number.parseInt(formData.age),
          sex: formData.sex,
          reg_no: regNo,
          referred_by: "Self",
        })
        .select()
        .single()

      if (patientError) {
        console.error("Patient insert error:", patientError)
        throw patientError
      }

      patientData = newPatient
    }

    // Prepare test data (remove patient info and metadata from test data)
    const testData = { ...formData }
    delete testData.patientName
    delete testData.age
    delete testData.sex
    delete testData.testType
    delete testData.existingPatientId

    // Insert test results
    const { data: testResultData, error: testResultError } = await supabase
      .from("test_results")
      .insert({
        patient_id: patientData.id,
        test_type: formData.testType,
        test_data: testData,
      })
      .select()
      .single()

    if (testResultError) {
      console.error("Test result insert error:", testResultError)
      throw testResultError
    }

    return NextResponse.json({
      success: true,
      patient: patientData,
      testResult: testResultData,
      isNewPatient: !formData.existingPatientId,
    })
  } catch (error) {
    console.error("Error saving patient data:", error)
    return NextResponse.json({ error: "Failed to save patient data" }, { status: 500 })
  }
}
