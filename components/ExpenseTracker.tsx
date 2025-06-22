import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini AI
const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const parseExpenseMessage = async (msg: string) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = `Extract the following information from the expense description and provide the output as a JSON object:
{
  "amount": number, // The monetary value, extract only the number
  "product_service": string, // What was purchased or the service received
  "category": string, // One of: Food & Dining, Transportation, Groceries, Shopping, Entertainment, Health & Medical, Bills & Utilities, Travel, Education, Personal Care, Other
  "mode": string, // One of: Cash, Card, Digital, Check, Bank Transfer, Unknown
  "vendor": string, // Where the purchase was made, null if not mentioned
  "expense_date": string // Format: YYYY-MM-DD, use today's date if not specified
}

Expense description: ${msg}

Rules:
1. If amount is not specified, use 0
2. If date is not specified, use today's date
3. If mode is not specified, use "Unknown"
4. If vendor is not specified, use null
5. If product/service is not specified, use null
6. Category should be determined based on the context and common sense
7. Return ONLY the JSON object, no other text`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse the JSON response
    const parsedData = JSON.parse(text);
    
    // Ensure all required fields are present
    return {
      amount: parsedData.amount || 0,
      description: msg,
      category: parsedData.category || 'Other',
      vendor: parsedData.vendor || null,
      product_service: parsedData.product_service || null,
      mode: parsedData.mode || 'Unknown',
      expense_date: parsedData.expense_date || new Date().toISOString().split('T')[0],
    };
  } catch (error) {
    console.error('Error parsing expense with AI:', error);
    // Fallback to basic parsing if AI fails
    return {
      amount: 0,
      description: msg,
      category: 'Other',
      vendor: null,
      product_service: null,
      mode: 'Unknown',
      expense_date: new Date().toISOString().split('T')[0],
    };
  }
}; 