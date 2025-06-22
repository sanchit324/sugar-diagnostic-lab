import { type NextRequest, NextResponse } from "next/server"
import jsPDF from "jspdf"

// Define the data structure for a single test
interface TestData {
  id: string
  name: string
  value: string
  referenceRange: string
}

// Helper function to parse a reference range string (e.g., "11.0 - 16.0") into min/max numbers
function parseReferenceRange(referenceRange: string): { min: number; max: number } | null {
  const rangeMatch = referenceRange.match(/(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)/)
  if (rangeMatch) {
    return {
      min: Number.parseFloat(rangeMatch[1]),
      max: Number.parseFloat(rangeMatch[2]),
    }
  }
  return null
}

// Helper function to determine if a value is low, high, or normal
function getValueStatus(value: string, referenceRange: string): "normal" | "low" | "high" {
  if (!value) return "normal"
  const numValue = Number.parseFloat(value)
  if (isNaN(numValue)) return "normal"

  const parsedRange = parseReferenceRange(referenceRange)
  if (parsedRange) {
    if (numValue < parsedRange.min) return "low"
    if (numValue > parsedRange.max) return "high"
  }
  return "normal"
}

// Helper function to convert a string to Title Case
function toTitleCase(str: string): string {
  return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase())
}

// Helper function to shorten long test names for better display
function shortenTestName(testName: string): string {
  const shortened = testName.replace(/CONCENTRATION/gi, "Conc.").replace(/CORPUSCULAR/gi, "Corp.")
  return toTitleCase(shortened)
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json()

    // Transform the flat formData into the structured TestData array
    let allTests: TestData[] = [];
    let testOrder: (string | { isGroupHeading: boolean; label: string; ids?: string[] })[] = [];
    let groupHeadings: Record<string, string> = {};
    if (formData.testType === "LFT") {
      // LFT tests
      allTests = [
        { id: "serumBilirubinTotal", name: "Serum Bilirubin (Total)", value: formData.serumBilirubinTotal, referenceRange: "0.2 - 1.2 mg/dL" },
        { id: "serumBilirubinDirect", name: "Serum Bilirubin (Direct)", value: formData.serumBilirubinDirect, referenceRange: "0.0 - 0.3 mg/dL" },
        { id: "serumBilirubinIndirect", name: "Serum Bilirubin (Indirect)", value: formData.serumBilirubinIndirect, referenceRange: "0.1 - 1.0 mg/dL" },
        { id: "sgptAlt", name: "SGPT (ALT)", value: formData.sgptAlt, referenceRange: "5 - 40 U/L" },
        { id: "sgotAst", name: "SGOT (AST)", value: formData.sgotAst, referenceRange: "5 - 40 U/L" },
        { id: "serumAlkalinePhosphatase", name: "Serum Alkaline Phosphatase", value: formData.serumAlkalinePhosphatase, referenceRange: "40 - 129 U/L" },
        { id: "serumProtein", name: "Serum Protein (Total)", value: formData.serumProtein, referenceRange: "6.0 - 8.3 g/dL" },
        { id: "serumAlbumin", name: "Serum Albumin", value: formData.serumAlbumin, referenceRange: "3.4 - 5.4 g/dL" },
        { id: "globulin", name: "Globulin", value: formData.globulin, referenceRange: "2.0 - 3.5 g/dL" },
        { id: "agRatio", name: "A/G Ratio", value: formData.agRatio, referenceRange: "1.0 - 2.2" },
      ];
      testOrder = [
        { isGroupHeading: true, label: "BILIRUBIN" },
        "serumBilirubinTotal",
        "serumBilirubinDirect",
        "serumBilirubinIndirect",
        { isGroupHeading: true, label: "ENZYMES" },
        "sgptAlt",
        "sgotAst",
        "serumAlkalinePhosphatase",
        { isGroupHeading: true, label: "PROTEINS" },
        "serumProtein",
        "serumAlbumin",
        "globulin",
        "agRatio",
      ];
      groupHeadings = {
        "serumBilirubinTotal": "BILIRUBIN",
        "sgptAlt": "ENZYMES",
        "serumProtein": "PROTEINS",
      };
    } else if (formData.testType === "BloodSugar") {
      allTests = [
        { id: "fastingBloodSugar", name: "Fasting Blood Sugar", value: formData.fastingBloodSugar, referenceRange: "70-100 mg/dL" },
        { id: "postPrandialBloodSugar", name: "Post Prandial Blood Sugar", value: formData.postPrandialBloodSugar, referenceRange: "<140 mg/dL" },
        { id: "randomBloodSugar", name: "Random Blood Sugar", value: formData.randomBloodSugar, referenceRange: "<200 mg/dL" },
        { id: "hba1c", name: "HbA1c", value: formData.hba1c, referenceRange: "4.0-5.6 %" },
      ];
      testOrder = [
        { isGroupHeading: true, label: "BLOOD SUGAR TESTS", ids: ["fastingBloodSugar", "postPrandialBloodSugar", "randomBloodSugar"] },
        "fastingBloodSugar",
        "postPrandialBloodSugar",
        "randomBloodSugar",
        { isGroupHeading: true, label: "GLYCATED HEMOGLOBIN", ids: ["hba1c"] },
        "hba1c",
      ];
    } else if (formData.testType === "Renal") {
      allTests = [
        { id: "bloodUrea", name: "Blood Urea", value: formData.bloodUrea, referenceRange: "15-40 mg/dL" },
        { id: "serumCreatinine", name: "Serum Creatinine", value: formData.serumCreatinine, referenceRange: "0.6-1.3 mg/dL" },
        { id: "uricAcid", name: "Uric Acid", value: formData.uricAcid, referenceRange: "3.5-7.2 mg/dL" },
      ];
      testOrder = [
        { isGroupHeading: true, label: "RENAL FUNCTION TESTS", ids: ["bloodUrea", "serumCreatinine", "uricAcid"] },
        "bloodUrea",
        "serumCreatinine",
        "uricAcid",
      ];
    } else if (formData.testType === "Lipid") {
      allTests = [
        { id: "totalCholesterol", name: "Total Cholesterol", value: formData.totalCholesterol, referenceRange: "<200 mg/dL" },
        { id: "triglycerides", name: "Triglycerides", value: formData.triglycerides, referenceRange: "<150 mg/dL" },
        { id: "hdlCholesterol", name: "HDL Cholesterol", value: formData.hdlCholesterol, referenceRange: ">40 mg/dL" },
        { id: "ldlCholesterol", name: "LDL Cholesterol", value: formData.ldlCholesterol, referenceRange: "<100 mg/dL" },
        { id: "vldlCholesterol", name: "VLDL Cholesterol", value: formData.vldlCholesterol, referenceRange: "<30 mg/dL" },
      ];
      testOrder = [
        { isGroupHeading: true, label: "CHOLESTEROL", ids: ["totalCholesterol", "hdlCholesterol", "ldlCholesterol", "vldlCholesterol"] },
        "totalCholesterol",
        "hdlCholesterol",
        "ldlCholesterol",
        "vldlCholesterol",
        { isGroupHeading: true, label: "TRIGLYCERIDES", ids: ["triglycerides"] },
        "triglycerides",
      ];
    } else if (formData.testType === "TFT") {
      allTests = [
        { id: "tsh", name: "TSH (Thyroid Stimulating Hormone)", value: formData.tsh, referenceRange: "0.4-4.0 mIU/L" },
        { id: "freeT3", name: "Free T3 (Triiodothyronine)", value: formData.freeT3, referenceRange: "2.0-4.4 pg/mL" },
        { id: "freeT4", name: "Free T4 (Thyroxine)", value: formData.freeT4, referenceRange: "0.93-1.7 ng/dL" },
        { id: "totalT3", name: "Total T3", value: formData.totalT3, referenceRange: "80-200 ng/dL" },
        { id: "totalT4", name: "Total T4", value: formData.totalT4, referenceRange: "5.1-14.1 µg/dL" },
      ];
      testOrder = [
        { isGroupHeading: true, label: "THYROID HORMONES", ids: ["tsh", "freeT3", "freeT4", "totalT3", "totalT4"] },
        "tsh",
        "freeT3",
        "freeT4",
        "totalT3",
        "totalT4",
      ];
    } else if (formData.testType === "Urine") {
      allTests = [
        { id: "urineProtein", name: "Urine Protein", value: formData.urineProtein, referenceRange: "Negative" },
        { id: "urineGlucose", name: "Urine Glucose", value: formData.urineGlucose, referenceRange: "Negative" },
        { id: "urineKetones", name: "Urine Ketones", value: formData.urineKetones, referenceRange: "Negative" },
        { id: "urinePh", name: "Urine pH", value: formData.urinePh, referenceRange: "4.6-8.0" },
        { id: "urineSpecificGravity", name: "Urine Specific Gravity", value: formData.urineSpecificGravity, referenceRange: "1.005-1.030" },
      ];
      testOrder = [
        { isGroupHeading: true, label: "URINE CHEMICAL EXAMINATION", ids: ["urineProtein", "urineGlucose", "urineKetones", "urinePh", "urineSpecificGravity"] },
        "urineProtein",
        "urineGlucose",
        "urineKetones",
        "urinePh",
        "urineSpecificGravity",
      ];
    } else {
      // CBC tests (existing logic)
      allTests = [
        { id: "hemoglobin", name: "Hemoglobin", value: formData.hemoglobin, referenceRange: "11.0 - 16.0 g/dL" },
        { id: "totalRbcCount", name: "Total RBC count", value: formData.totalRbcCount, referenceRange: "3.5 - 6.0 mill/cumm" },
        { id: "hematocrit", name: "Hematocrit value (HCT)", value: formData.hematocrit, referenceRange: "36 - 47 %" },
        { id: "mcv", name: "Mean corpuscular count (MCV)", value: formData.mcv, referenceRange: "80 - 105 fL" },
        { id: "mch", name: "Mean cell hemoglobin (MCH)", value: formData.mch, referenceRange: "27 - 32 pg/mL" },
        { id: "mchc", name: "Mean cell hemoglobin con, MCHC", value: formData.mchc, referenceRange: "32 - 36 gm/dL" },
        { id: "wbcCount", name: "Total leukocyte count", value: formData.totalLeukocyteCount, referenceRange: "4000 - 11000 /cumm" },
        { id: "neutrophils", name: "Neutrophils", value: formData.neutrophils, referenceRange: "40 - 70 %" },
        { id: "lymphocytes", name: "Lymphocyte", value: formData.lymphocytes, referenceRange: "20 - 40 %" },
        { id: "eosinophils", name: "Eosinophils", value: formData.eosinophils, referenceRange: "02 - 04 %" },
        { id: "monocytes", name: "Monocytes", value: formData.monocytes, referenceRange: "00 - 03 %" },
        { id: "basophils", name: "Basophils", value: formData.basophils, referenceRange: "00 - 02 %" },
        { id: "plateletCount", name: "Platelet count", value: formData.plateletCount, referenceRange: "1.5 - 4.5 lac/cumm" },
      ];
      testOrder = [
        { isGroupHeading: true, label: "HEMATOLOGY", ids: ["hemoglobin", "totalRbcCount", "hematocrit", "mcv", "mch", "mchc"] },
        "hemoglobin", "totalRbcCount", "hematocrit", "mcv", "mch", "mchc",
        { isGroupHeading: true, label: "WHITE BLOOD CELL COUNT", ids: ["wbcCount"] },
        "wbcCount",
        { isGroupHeading: true, label: "DIFFERENTIAL LEUKOCYTE COUNT", ids: ["neutrophils", "lymphocytes", "eosinophils", "monocytes", "basophils"] },
        "neutrophils", "lymphocytes", "eosinophils", "monocytes", "basophils",
        { isGroupHeading: true, label: "PLATELET COUNT", ids: ["plateletCount"] },
        "plateletCount",
      ];
    }

    // Filter out tests that don't have a value
    const testsWithValues = allTests.filter((test) => test.value && test.value.trim() !== "")
    if (testsWithValues.length === 0) {
      return NextResponse.json({ error: "No test values provided" }, { status: 400 })
    }

    // Build ordered tests array with group headings for LFT or DLC heading for CBC
    const testMap = new Map(testsWithValues.map((test) => [test.id, test]))
    const orderedTests: (TestData | { isGroupHeading?: boolean; isDLCHeading?: boolean; label?: string })[] = [];
    if (formData.testType === "LFT") {
      testOrder.forEach((item) => {
        if (typeof item === "object" && item.isGroupHeading) {
          // Only add group heading if at least one test in this group is present
          const groupTests = testOrder
            .slice(testOrder.indexOf(item) + 1)
            .filter((t) => typeof t === "string") as string[];
          if (groupTests.some((id) => testMap.has(id))) {
            orderedTests.push({ isGroupHeading: true, label: item.label });
          }
        } else if (typeof item === "string" && testMap.has(item)) {
          orderedTests.push(testMap.get(item)!);
        }
      });
    } else {
      let addedGroups: Record<string, boolean> = {};
      testOrder.forEach((item) => {
        if (typeof item === "object" && item.isGroupHeading) {
          // Only add group heading if at least one test in this group is present
          if (item.ids && !addedGroups[item.label] && item.ids.some((id: string) => testMap.has(id))) {
            orderedTests.push({ isGroupHeading: true, label: item.label });
            addedGroups[item.label] = true;
          }
        } else if (typeof item === "string" && testMap.has(item)) {
          orderedTests.push(testMap.get(item)!);
        }
      });
    }

    // After orderedTests, add custom tests if present
    let customTests: { name: string; value: string; ref: string }[] = []
    if (formData.customTests && Array.isArray(formData.customTests)) {
      customTests = formData.customTests.filter(
        (t: any) => t.name && t.value && t.ref
      )
    }

    // Create PDF
    const pdf = new jsPDF("p", "mm", "a4")
    const pageWidth = 210
    pdf.setFont("helvetica")

    let yPosition = 40
    const leftMargin = 6
    const rightMargin = 6
    const headerHeight = 20
    pdf.rect(leftMargin, yPosition, pageWidth - leftMargin - rightMargin, headerHeight)

    // Patient info (left side)
    pdf.setFontSize(12)
    pdf.setFont("helvetica", "normal")
    pdf.text("PATIENT NAME: ", leftMargin + 5, yPosition + 7)
    pdf.setFont("helvetica", "bold")
    pdf.text((formData.patientName || "").toUpperCase(), leftMargin + 5 + pdf.getTextWidth("PATIENT NAME: "), yPosition + 7)
    pdf.setFont("helvetica", "normal")
    pdf.text("AGE/GENDER: ", leftMargin + 5, yPosition + 14)
    pdf.setFont("helvetica", "bold")
    pdf.text(`${formData.age || ""} YRS/${(formData.sex || "").toUpperCase()}`, leftMargin + 5 + pdf.getTextWidth("AGE/GENDER: "), yPosition + 14)

    // Report info (right side)
    const currentDate = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
    const rightEdge = pageWidth - rightMargin - 5
    pdf.setFont("helvetica", "normal")
    const reportDateLabel = "REPORT DATE: "
    pdf.setFont("helvetica", "bold")
    const dateText = currentDate
    const fullReportDateText = reportDateLabel + dateText
    pdf.setFont("helvetica", "normal")
    pdf.text(reportDateLabel, rightEdge - pdf.getTextWidth(fullReportDateText), yPosition + 7)
    pdf.setFont("helvetica", "bold")
    pdf.text(dateText, rightEdge - pdf.getTextWidth(dateText), yPosition + 7)

    pdf.setFont("helvetica", "normal")
    const referredByLabel = "REFERRED BY: "
    pdf.setFont("helvetica", "bold")
    const referredByText = (formData.referredBy || "SELF").toUpperCase()
    const fullReferredByText = referredByLabel + referredByText
    pdf.setFont("helvetica", "normal")
    pdf.text(referredByLabel, rightEdge - pdf.getTextWidth(fullReferredByText), yPosition + 14)
    pdf.setFont("helvetica", "bold")
    pdf.text(referredByText, rightEdge - pdf.getTextWidth(referredByText), yPosition + 14)

    yPosition += headerHeight + 5

    // Main table
    const tableStartY = yPosition
    const tableHeight = Math.max(180, orderedTests.length * 8 + 45)
    const tableWidth = pageWidth - leftMargin - rightMargin
    const col1Width = tableWidth * 0.5
    const col2Width = tableWidth * 0.25
    const col3Width = tableWidth * 0.25
    pdf.rect(leftMargin, tableStartY, tableWidth, tableHeight)
    pdf.line(leftMargin + col1Width, tableStartY, leftMargin + col1Width, tableStartY + tableHeight)
    pdf.line(leftMargin + col1Width + col2Width, tableStartY, leftMargin + col1Width + col2Width, tableStartY + tableHeight)

    // Table headers
    pdf.setFontSize(12)
    pdf.setFont("helvetica", "bold")
    const col1CenterX = leftMargin + col1Width / 2
    const col2CenterX = leftMargin + col1Width + col2Width / 2
    const col3CenterX = leftMargin + col1Width + col2Width + col3Width / 2
    pdf.text("TEST NAME", col1CenterX, tableStartY + 10, { align: "center" })
    pdf.text("OBSERVATION", col2CenterX, tableStartY + 10, { align: "center" })
    pdf.text("REFERENCE", col3CenterX, tableStartY + 10, { align: "center" })
    pdf.line(leftMargin, tableStartY + 15, pageWidth - rightMargin, tableStartY + 15)

    // Table data
    let currentY = tableStartY + 25
    const normalLineHeight = 8
    const groupLineHeight = 7
    const groupHeadingSpacing = 6
    pdf.setFont("helvetica", "normal")
    pdf.setFontSize(11)

    let inGroup = false;
    orderedTests.forEach((item, idx) => {
      if ("isDLCHeading" in item && item.isDLCHeading) {
        pdf.setTextColor(0, 0, 0);
        pdf.setFont("helvetica", "bold");
        pdf.text("DIFFERENTIAL LEUKOCYTE COUNT", leftMargin + 5, currentY);
        pdf.setFont("helvetica", "normal");
        currentY += groupHeadingSpacing + 2; // Extra space before DLC group
        inGroup = true;
        return;
      }
      if ("isGroupHeading" in item && item.isGroupHeading) {
        // Add extra space before a new group, except for the first group
        if (idx !== 0) {
          currentY += 3; // Smaller gap between groups
        }
        pdf.setTextColor(0, 0, 0);
        pdf.setFont("helvetica", "bold");
        pdf.text(item.label || "", leftMargin + 5, currentY);
        pdf.setFont("helvetica", "normal");
        currentY += groupHeadingSpacing; // Small gap after group heading
        inGroup = true;
        return;
      }
      const test = item as TestData;
      // Indent all tests under any group
      let displayName = shortenTestName(test.name);
      if (inGroup) {
        displayName = "        " + displayName; // 8 spaces for indentation
      }
      pdf.setFont("helvetica", "normal");
      pdf.text(displayName, leftMargin + 5, currentY);
      const status = getValueStatus(test.value, test.referenceRange);
      if (test.value) {
        if (status === "low" || status === "high") {
          pdf.setFont("helvetica", "bold");
          pdf.text(test.value, col2CenterX, currentY, { align: "center" });
          pdf.setFont("helvetica", "bold");
          const indicatorX = leftMargin + col1Width + col2Width - 15;
          const indicator = status === "low" ? "(L)" : "(H)";
          pdf.text(indicator, indicatorX, currentY);
        } else {
          pdf.setFont("helvetica", "normal");
          pdf.text(test.value, col2CenterX, currentY, { align: "center" });
        }
      }
      pdf.setTextColor(0, 0, 0);
      pdf.setFont("helvetica", "normal");
      if (test.referenceRange) {
        pdf.text(test.referenceRange, col3CenterX, currentY, { align: "center" });
      }
      // Tighter spacing within a group, more space after group heading
      currentY += groupLineHeight; // 7mm for tight grouping
    })

    // Add custom tests to the PDF table if any
    if (customTests.length > 0) {
      // Add a small gap and a section header
      currentY += 5
      pdf.setFont("helvetica", "bold")
      pdf.setFontSize(11)
      pdf.text("CUSTOM TESTS", leftMargin + 5, currentY)
      pdf.setFont("helvetica", "normal")
      pdf.setFontSize(11)
      currentY += 5
      customTests.forEach((test) => {
        // Try to parse and check abnormal for custom tests
        let abnormal = false;
        let status: "normal" | "low" | "high" = "normal";
        if (test.value && test.ref) {
          status = getValueStatus(test.value, test.ref);
          abnormal = status === "low" || status === "high";
        }
        let displayName = "        " + test.name; // 8 spaces for indentation
        pdf.setFont("helvetica", "normal");
        pdf.text(displayName, leftMargin + 5, currentY);
        if (test.value) {
          if (abnormal) {
            pdf.setFont("helvetica", "bold");
            pdf.text(test.value, col2CenterX, currentY, { align: "center" });
            pdf.setFont("helvetica", "bold");
            const indicatorX = leftMargin + col1Width + col2Width - 15;
            const indicator = status === "low" ? "(L)" : "(H)";
            pdf.text(indicator, indicatorX, currentY);
          } else {
            pdf.setFont("helvetica", "normal");
            pdf.text(test.value, col2CenterX, currentY, { align: "center" });
          }
        }
        pdf.setFont("helvetica", "normal");
        pdf.text(test.ref, col3CenterX, currentY, { align: "center" })
        currentY += 5
      })
    }

    // Generate and return PDF
    const pdfBuffer = pdf.output("arraybuffer")
    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="lab_report_${formData.patientName.replace(/\s+/g, "_")}.pdf"`,
      },
    })
  } catch (error) {
    console.error("Error generating PDF:", error)
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 })
  }
}
