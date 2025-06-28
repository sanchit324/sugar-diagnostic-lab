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
      
      // Generate serial number (incrementing number)
      const { data: lastPatient, error: countError } = await supabase
        .from("patients")
        .select("serial_number")
        .order("serial_number", { ascending: false })
        .limit(1)
        .single()

      let serialNumber = "1"
      if (lastPatient && lastPatient.serial_number) {
        const lastSerial = parseInt(lastPatient.serial_number)
        serialNumber = (lastSerial + 1).toString()
      }

      // Insert patient data
      const { data: newPatient, error: patientError } = await supabase
        .from("patients")
        .insert({
          name: formData.patientName,
          age: Number.parseInt(formData.age),
          sex: formData.sex,
          phone_number: formData.phoneNumber || "",
          reg_no: regNo,
          serial_number: serialNumber,
          referred_by: formData.referredBy || "Self",
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

    // Debug logging
    console.log("Save Patient - Returning patient data:", {
      id: patientData.id,
      name: patientData.name,
      serial_number: patientData.serial_number,
      reg_no: patientData.reg_no
    })

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
