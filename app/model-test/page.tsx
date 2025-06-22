'use client';

import { useState } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Initialize Gemini AI
const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

interface ParsedExpense {
  amount: number;
  product_service: string | null;
  category: string;
  mode: string;
  vendor: string | null;
  expense_date: string;
}

export default function ModelTestPage() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<ParsedExpense | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testCases, setTestCases] = useState([
    "Bought coffee for $4.50 online today",
    "Paid $25 for lunch at Chipotle with card yesterday",
    "Spent $15 on groceries at Walmart using cash",
    "Ordered pizza for $30 from Dominos online",
    "Paid $100 for doctor's appointment at City Hospital with insurance"
  ]);

  const parseExpense = async (description: string) => {
    try {
      setLoading(true);
      setError(null);
      
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

Expense description: ${description}

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
      const parsedExpense: ParsedExpense = {
        amount: parsedData.amount || 0,
        product_service: parsedData.product_service || null,
        category: parsedData.category || 'Other',
        vendor: parsedData.vendor || null,
        mode: parsedData.mode || 'Unknown',
        expense_date: parsedData.expense_date || new Date().toISOString().split('T')[0],
      };
      
      setResult(parsedExpense);
    } catch (error) {
      console.error('Error parsing expense with AI:', error);
      setError('Failed to parse expense. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTest = (testCase: string) => {
    setInput(testCase);
    parseExpense(testCase);
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Gemini Model Test Interface</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter expense description..."
                className="flex-1"
              />
              <Button 
                onClick={() => parseExpense(input)}
                disabled={loading || !input.trim()}
              >
                {loading ? 'Parsing...' : 'Parse'}
              </Button>
            </div>

            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}

            {result && (
              <div className="space-y-4">
                <h3 className="font-semibold">Parsed Result:</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Field</TableHead>
                      <TableHead>Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>Amount</TableCell>
                      <TableCell>${result.amount.toFixed(2)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Product/Service</TableCell>
                      <TableCell>{result.product_service || 'N/A'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Category</TableCell>
                      <TableCell>{result.category}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Mode</TableCell>
                      <TableCell>{result.mode}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Vendor</TableCell>
                      <TableCell>{result.vendor || 'N/A'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>{result.expense_date}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Test Cases</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {testCases.map((testCase, index) => (
              <Button
                key={index}
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleTest(testCase)}
              >
                {testCase}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Add Custom Test Case</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Textarea
              placeholder="Enter a new test case..."
              className="min-h-[100px]"
              onChange={(e) => setInput(e.target.value)}
              value={input}
            />
            <Button 
              onClick={() => {
                if (input.trim()) {
                  setTestCases([...testCases, input.trim()]);
                  parseExpense(input);
                }
              }}
              disabled={loading || !input.trim()}
            >
              Add & Test
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 