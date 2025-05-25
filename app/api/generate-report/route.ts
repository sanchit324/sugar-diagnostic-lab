import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json()

    // Import jsPDF dynamically to avoid SSR issues
    const { jsPDF } = await import("jspdf")

    // Create new PDF document
    const doc = new jsPDF()

    // Set font
    doc.setFont("helvetica")

    // Start content lower to leave space for letterhead
    // Patient Information Section (starting at y=60 to leave space for letterhead)
    doc.setFontSize(11)
    doc.setTextColor(0, 0, 0)

    // Patient details on left
    doc.text(`Mr./Ms. ${formData.patientName || "Patient Name"}`, 15, 60)
    doc.setFontSize(9)
    doc.text(`Age / Sex    : ${formData.age || "N/A"} YRS / ${formData.sex || "M"}`, 15, 66)
    doc.text(`Referred by  : Self`, 15, 72)
    doc.text(`Reg. no.     : ${formData.regNo || "1001"}`, 15, 78)

    // Dates on right (removed barcode)
    const currentDate = new Date().toLocaleDateString("en-GB")
    const currentTime = new Date().toLocaleTimeString("en-GB", { hour12: false })
    doc.text(`Registered on : ${currentDate} ${currentTime}`, 120, 60)
    doc.text(`Collected on  : ${currentDate}`, 120, 66)
    doc.text(`Received on   : ${currentDate}`, 120, 72)
    doc.text(`Reported on   : ${currentDate} ${currentTime}`, 120, 78)

    // Test section header (moved closer)
    doc.setFontSize(14)
    doc.setTextColor(0, 0, 0)

    let testResults: Array<{
      test: string
      value: string
      unit: string
      reference: string
      flag: string
    }> = []

    if (formData.testType === "CBC") {
      doc.text("HAEMATOLOGY", 85, 95)
      doc.setFontSize(12)
      doc.text("COMPLETE BLOOD COUNT (CBC)", 70, 102)

      // Helper function to determine if value is abnormal for CBC
      const getFlag = (value: string, min: number, max: number) => {
        if (!value || value === "") return ""
        const numValue = Number.parseFloat(value)
        if (numValue < min) return "L"
        if (numValue > max) return "H"
        return ""
      }

      testResults = [
        {
          test: "HEMOGLOBIN",
          value: formData.hemoglobin || "",
          unit: "g/dl",
          reference: "13 - 17",
          flag: formData.hemoglobin ? getFlag(formData.hemoglobin, 13, 17) : "",
        },
        {
          test: "TOTAL LEUKOCYTE COUNT",
          value: formData.totalLeukocyteCount || "",
          unit: "cumm",
          reference: "4,800 - 10,800",
          flag: formData.totalLeukocyteCount ? getFlag(formData.totalLeukocyteCount, 4800, 10800) : "",
        },
        { test: "DIFFERENTIAL LEUCOCYTE COUNT", value: "", unit: "", reference: "", flag: "" },
        {
          test: "    NEUTROPHILS",
          value: formData.neutrophils || "",
          unit: "%",
          reference: "40 - 80",
          flag: formData.neutrophils ? getFlag(formData.neutrophils, 40, 80) : "",
        },
        {
          test: "    LYMPHOCYTE",
          value: formData.lymphocytes || "",
          unit: "%",
          reference: "20 - 40",
          flag: formData.lymphocytes ? getFlag(formData.lymphocytes, 20, 40) : "",
        },
        {
          test: "    EOSINOPHILS",
          value: formData.eosinophils || "",
          unit: "%",
          reference: "1 - 6",
          flag: formData.eosinophils ? getFlag(formData.eosinophils, 1, 6) : "",
        },
        {
          test: "    MONOCYTES",
          value: formData.monocytes || "",
          unit: "%",
          reference: "2 - 10",
          flag: formData.monocytes ? getFlag(formData.monocytes, 2, 10) : "",
        },
        {
          test: "    BASOPHILS",
          value: formData.basophils || "",
          unit: "%",
          reference: "< 2",
          flag: formData.basophils ? (Number.parseFloat(formData.basophils) > 2 ? "H" : "") : "",
        },
        {
          test: "PLATELET COUNT",
          value: formData.plateletCount || "",
          unit: "lakhs/cumm",
          reference: "1.5 - 4.1",
          flag: formData.plateletCount ? getFlag(formData.plateletCount, 1.5, 4.1) : "",
        },
        {
          test: "TOTAL RBC COUNT",
          value: formData.totalRbcCount || "",
          unit: "million/cumm",
          reference: "4.5 - 5.5",
          flag: formData.totalRbcCount ? getFlag(formData.totalRbcCount, 4.5, 5.5) : "",
        },
        {
          test: "HEMATOCRIT VALUE, HCT",
          value: formData.hematocrit || "",
          unit: "%",
          reference: "40 - 50",
          flag: formData.hematocrit ? getFlag(formData.hematocrit, 40, 50) : "",
        },
        {
          test: "MEAN CORPUSCULAR VOLUME, MCV",
          value: formData.mcv || "",
          unit: "fL",
          reference: "83 - 101",
          flag: formData.mcv ? getFlag(formData.mcv, 83, 101) : "",
        },
        {
          test: "MEAN CELL HAEMOGLOBIN, MCH",
          value: formData.mch || "",
          unit: "Pg",
          reference: "27 - 32",
          flag: formData.mch ? getFlag(formData.mch, 27, 32) : "",
        },
        {
          test: "MEAN CELL HAEMOGLOBIN CON, MCHC",
          value: formData.mchc || "",
          unit: "%",
          reference: "31.5 - 34.5",
          flag: formData.mchc ? getFlag(formData.mchc, 31.5, 34.5) : "",
        },
      ]
    } else if (formData.testType === "LFT") {
      doc.text("BIOCHEMISTRY", 85, 95)
      doc.setFontSize(12)
      doc.text("LIVER FUNCTION TEST (LFT)", 70, 102)

      // Helper function to determine if value is abnormal for LFT
      const getLFTFlag = (value: string, min: number, max: number) => {
        if (!value || value === "") return ""
        const numValue = Number.parseFloat(value)
        if (numValue < min) return "L"
        if (numValue > max) return "H"
        return ""
      }

      testResults = [
        {
          test: "SERUM BILIRUBIN (TOTAL)",
          value: formData.serumBilirubinTotal || "",
          unit: "mg/dl",
          reference: "0.2 - 1.2",
          flag: formData.serumBilirubinTotal ? getLFTFlag(formData.serumBilirubinTotal, 0.2, 1.2) : "",
        },
        {
          test: "SERUM BILIRUBIN (DIRECT)",
          value: formData.serumBilirubinDirect || "",
          unit: "mg/dl",
          reference: "0 - 0.3",
          flag: formData.serumBilirubinDirect ? getLFTFlag(formData.serumBilirubinDirect, 0, 0.3) : "",
        },
        {
          test: "SERUM BILIRUBIN (INDIRECT)",
          value: formData.serumBilirubinIndirect || "",
          unit: "mg/dl",
          reference: "0.2 - 1",
          flag: formData.serumBilirubinIndirect ? getLFTFlag(formData.serumBilirubinIndirect, 0.2, 1) : "",
        },
        {
          test: "SGPT (ALT)",
          value: formData.sgptAlt || "",
          unit: "U/l",
          reference: "13 - 40",
          flag: formData.sgptAlt ? getLFTFlag(formData.sgptAlt, 13, 40) : "",
        },
        {
          test: "SGOT (AST)",
          value: formData.sgotAst || "",
          unit: "U/l",
          reference: "0 - 37",
          flag: formData.sgotAst ? getLFTFlag(formData.sgotAst, 0, 37) : "",
        },
        {
          test: "SERUM ALKALINE PHOSPHATASE",
          value: formData.serumAlkalinePhosphatase || "",
          unit: "U/l",
          reference: "44 - 147",
          flag: formData.serumAlkalinePhosphatase ? getLFTFlag(formData.serumAlkalinePhosphatase, 44, 147) : "",
        },
        {
          test: "SERUM PROTEIN",
          value: formData.serumProtein || "",
          unit: "g/dl",
          reference: "6.4 - 8.3",
          flag: formData.serumProtein ? getLFTFlag(formData.serumProtein, 6.4, 8.3) : "",
        },
        {
          test: "SERUM ALBUMIN",
          value: formData.serumAlbumin || "",
          unit: "g/dl",
          reference: "3.5 - 5.2",
          flag: formData.serumAlbumin ? getLFTFlag(formData.serumAlbumin, 3.5, 5.2) : "",
        },
        {
          test: "GLOBULIN",
          value: formData.globulin || "",
          unit: "g/dl",
          reference: "1.8 - 3.6",
          flag: formData.globulin ? getLFTFlag(formData.globulin, 1.8, 3.6) : "",
        },
        {
          test: "A/G RATIO",
          value: formData.agRatio || "",
          unit: "",
          reference: "1.1 - 2.1",
          flag: formData.agRatio ? getLFTFlag(formData.agRatio, 1.1, 2.1) : "",
        },
      ]
    }

    // Table with borders
    const tableStartY = 110
    const tableWidth = 180
    const tableHeight = 8
    const rowHeight = 6

    // Table headers with border
    doc.setFillColor(240, 240, 240)
    doc.rect(15, tableStartY, tableWidth, tableHeight, "FD")
    doc.setFontSize(10)
    doc.setTextColor(0, 0, 0)
    doc.text("TEST", 20, tableStartY + 5)
    doc.text("VALUE", 90, tableStartY + 5)
    doc.text("UNIT", 120, tableStartY + 5)
    doc.text("REFERENCE", 150, tableStartY + 5)

    // Vertical lines for table headers
    doc.line(85, tableStartY, 85, tableStartY + tableHeight) // After TEST
    doc.line(115, tableStartY, 115, tableStartY + tableHeight) // After VALUE
    doc.line(145, tableStartY, 145, tableStartY + tableHeight) // After UNIT

    let yPos = tableStartY + tableHeight
    testResults.forEach((result, index) => {
      // Skip empty rows
      if (!result.test && !result.value) return

      const currentRowY = yPos

      // Highlight abnormal values with light red background
      if (result.flag) {
        doc.setFillColor(255, 230, 230) // Light red background for abnormal values
        doc.rect(15, currentRowY, tableWidth, rowHeight, "F")
      } else if (index % 2 === 0) {
        doc.setFillColor(250, 250, 250) // Light gray for alternate rows
        doc.rect(15, currentRowY, tableWidth, rowHeight, "F")
      }

      // Draw row border
      doc.setDrawColor(200, 200, 200)
      doc.rect(15, currentRowY, tableWidth, rowHeight, "D")

      // Vertical lines for each column
      doc.line(85, currentRowY, 85, currentRowY + rowHeight) // After TEST
      doc.line(115, currentRowY, 115, currentRowY + rowHeight) // After VALUE
      doc.line(145, currentRowY, 145, currentRowY + rowHeight) // After UNIT

      doc.setFontSize(9)
      doc.setTextColor(0, 0, 0)
      doc.text(result.test, 20, currentRowY + 4)

      // Highlight abnormal values with red text and flag
      if (result.flag) {
        doc.setTextColor(255, 0, 0) // Red text for abnormal values
        doc.text(`${result.value} ${result.flag}`, 90, currentRowY + 4)
        doc.setTextColor(0, 0, 0) // Reset to black
      } else if (result.value) {
        doc.text(result.value, 90, currentRowY + 4)
      }

      doc.text(result.unit, 120, currentRowY + 4)
      doc.text(result.reference, 150, currentRowY + 4)
      yPos += rowHeight
    })

    // Signatures (moved closer)
    yPos += 15
    doc.setFontSize(10)
    doc.text("Lab Technician", 20, yPos)
    doc.text("Dr. Pathologist", 140, yPos)
    doc.setFontSize(8)
    doc.text("DMLT, Lab Incharge", 20, yPos + 4)
    doc.text("MBBS, MD Pathologist", 140, yPos + 4)

    // Page number
    doc.text("Page 1 of 1", 95, yPos + 12)

    // Footer
    doc.setFontSize(8)
    doc.setTextColor(100, 100, 100)
    doc.text("NOT VALID FOR MEDICO LEGAL PURPOSE", 75, yPos + 20)
    doc.text("Work timings: Monday to Sunday, 8 am to 8 pm", 65, yPos + 25)

    // Generate PDF buffer
    const pdfBuffer = doc.output("arraybuffer")

    // Return PDF as response
    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="sugar_diagnostic_${formData.testType.toLowerCase()}_report.pdf"`,
      },
    })
  } catch (error) {
    console.error("Error generating PDF:", error)
    return NextResponse.json({ error: "Failed to generate PDF report" }, { status: 500 })
  }
}
