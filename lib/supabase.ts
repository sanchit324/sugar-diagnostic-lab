import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Patient = {
  id: string
  name: string
  age: number
  sex: "M" | "F"
  reg_no: string
  referred_by: string
  created_at: string
  updated_at: string
}

export type TestResult = {
  id: string
  patient_id: string
  test_type: "CBC" | "LFT" | "BloodSugar" | "Renal" | "Lipid" | "TFT" | "Urine"
  test_data: any
  registered_on: string
  collected_on: string
  received_on: string
  reported_on: string
  created_at: string
}

export type PatientWithTests = Patient & {
  test_results: TestResult[]
}
