"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { LayoutGrid, Columns, AlertTriangle, CheckCircle, XCircle, Info } from "lucide-react";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { JournalEntry } from "@/app/journal-entries/page";
import { JournalEntryCard } from "@/app/journal-entries/_components/journal-entry-card";

interface UploadResponse {
  s3_key: string;
  data: string;
}

interface ExtractedResultCardProps {
  uploadResponse: UploadResponse | null;
  pdfUrl: string | null;
}


// Compliance and validation data
interface ComplianceIssue {
  id: string;
  type: 'error' | 'warning' | 'info';
  category: string;
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  field?: string;
  value?: string;
  expected?: string;
  actionable_steps: ActionableStep[];
}

interface ActionableStep {
  id: string;
  title: string;
  description: string;
  action_type: 'manual_review' | 'auto_correct' | 'verification_required' | 'approval_needed';
  priority: 'high' | 'medium' | 'low';
  estimated_time: string;
  completed: boolean;
}

const dummyComplianceIssues: ComplianceIssue[] = [
  // {
  //   id: 'comp-001',
  //   type: 'error',
  //   category: 'Accounting Standards',
  //   title: 'Debit/Credit Balance Mismatch',
  //   description: 'The extracted journal entry has an imbalance of RM 150.00. Total debits (RM 2,500.00) do not equal total credits (RM 2,350.00).',
  //   severity: 'high',
  //   field: 'journal_lines',
  //   value: 'Debit: RM 2,500.00, Credit: RM 2,350.00',
  //   expected: 'Debit: RM 2,500.00, Credit: RM 2,500.00',
  //   actionable_steps: [
  //     {
  //       id: 'step-001-1',
  //       title: 'Review Original Document',
  //       description: 'Manually verify the amounts in the source document to identify the correct figures.',
  //       action_type: 'manual_review',
  //       priority: 'high',
  //       estimated_time: '5 minutes',
  //       completed: false
  //     },
  //     {
  //       id: 'step-001-2',
  //       title: 'Correct Entry Amounts',
  //       description: 'Update the journal entry with the correct debit and credit amounts to ensure balance.',
  //       action_type: 'manual_review',
  //       priority: 'high',
  //       estimated_time: '3 minutes',
  //       completed: false
  //     }
  //   ]
  // },
  // {
  //   id: 'comp-002',
  //   type: 'warning',
  //   category: 'Document Quality',
  //   title: 'Low OCR Confidence on Amount',
  //   description: 'The OCR confidence for the main amount (RM 2,500.00) is only 78%. Consider manual verification.',
  //   severity: 'medium',
  //   field: 'amount_extraction',
  //   value: '78% confidence',
  //   expected: '>95% confidence',
  //   actionable_steps: [
  //     {
  //       id: 'step-002-1',
  //       title: 'Manual Amount Verification',
  //       description: 'Cross-reference the extracted amount with the original document to ensure accuracy.',
  //       action_type: 'verification_required',
  //       priority: 'medium',
  //       estimated_time: '2 minutes',
  //       completed: false
  //     },
  //     {
  //       id: 'step-002-2',
  //       title: 'Document Quality Check',
  //       description: 'Assess if document scan quality can be improved for future extractions.',
  //       action_type: 'manual_review',
  //       priority: 'low',
  //       estimated_time: '1 minute',
  //       completed: false
  //     }
  //   ]
  // },
  // {
  //   id: 'comp-003',
  //   type: 'warning',
  //   category: 'Compliance Check',
  //   title: 'Missing Supporting Documentation Reference',
  //   description: 'No invoice number or supporting document reference was found in the extracted data.',
  //   severity: 'medium',
  //   field: 'supporting_documents',
  //   value: 'None detected',
  //   expected: 'Invoice/Receipt reference',
  //   actionable_steps: [
  //     {
  //       id: 'step-003-1',
  //       title: 'Add Supporting Document Reference',
  //       description: 'Manually add the invoice number or supporting document reference to the journal entry.',
  //       action_type: 'manual_review',
  //       priority: 'medium',
  //       estimated_time: '2 minutes',
  //       completed: false
  //     },
  //     {
  //       id: 'step-003-2',
  //       title: 'Attach Supporting Documents',
  //       description: 'Upload and link the original invoice or receipt to this journal entry.',
  //       action_type: 'manual_review',
  //       priority: 'low',
  //       estimated_time: '3 minutes',
  //       completed: false
  //     }
  //   ]
  // },
  // {
  //   id: 'comp-004',
  //   type: 'info',
  //   category: 'Best Practices',
  //   title: 'Account Classification Suggestion',
  //   description: 'Consider using more specific account codes for rent expenses (e.g., 5001-001 for Office Rent vs 5001-002 for Equipment Rent).',
  //   severity: 'low',
  //   field: 'account_classification',
  //   value: '5001 - Rent Expense',
  //   expected: '5001-001 - Office Rent',
  //   actionable_steps: [
  //     {
  //       id: 'step-004-1',
  //       title: 'Review Chart of Accounts',
  //       description: 'Check if more specific sub-accounts exist for different types of rent expenses.',
  //       action_type: 'manual_review',
  //       priority: 'low',
  //       estimated_time: '2 minutes',
  //       completed: false
  //     },
  //     {
  //       id: 'step-004-2',
  //       title: 'Update Account Code',
  //       description: 'If specific sub-accounts exist, update the journal entry to use the more specific account code.',
  //       action_type: 'manual_review',
  //       priority: 'low',
  //       estimated_time: '1 minute',
  //       completed: false
  //     }
  //   ]
  // }
];

export default function ExtractedResultCard({ uploadResponse, pdfUrl }: ExtractedResultCardProps) {
  const [viewMode, setViewMode] = useState<'side-by-side' | 'stacked'>('side-by-side');
  
  // Parse the journal entries from the upload response and transform to match JournalEntry interface
  let journalEntries: JournalEntry[] = [];
  
  if (uploadResponse) {
    try {
      const parsedData = JSON.parse(uploadResponse.data);
      journalEntries = parsedData.map((entry: any, index: number) => ({
        id: index + 1,
        date: new Date(entry.date || new Date()),
        reference: entry.reference || `JE-${String(index + 1).padStart(3, '0')}`,
        description: entry.description || 'Extracted journal entry',
        created_at: new Date(),
        lines: (entry.lines || []).map((line: any, lineIndex: number) => ({
          id: lineIndex + 1,
          account_id: parseInt(line.account_id) || 0,
          account_name: line.account_name || `Account ${line.account_id || 'Unknown'}`,
          debit: parseFloat(line.debit) || 0,
          credit: parseFloat(line.credit) || 0,
          description: line.description || ''
        }))
      }));
    } catch (error) {
      console.error('Error parsing journal entry data:', error);
      toast.error('Error parsing extracted data');
    }
  }

  if (!uploadResponse) {
    return null; // Don't render anything if no upload response
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Extracted Result</CardTitle>
            <CardDescription>Review the extracted data against the original document.</CardDescription>
          </div>
          {/* Layout Toggle */}
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'side-by-side' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('side-by-side')}
              className="gap-2"
            >
              <Columns className="h-4 w-4" />
              Side by Side
            </Button>
            <Button
              variant={viewMode === 'stacked' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('stacked')}
              className="gap-2"
            >
              <LayoutGrid className="h-4 w-4" />
              Stacked
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {viewMode === 'side-by-side' ? (
          /* Side-by-side layout */
          <div className="flex gap-6">
            {/* Left column - PDF Viewer (30% width) */}
            <div className="w-[30%] space-y-2">
              <h3 className="text-lg font-semibold">Original Document</h3>
              <div className="border rounded-lg overflow-hidden bg-gray-50 min-h-[600px]">
                {pdfUrl ? (
                  <iframe
                    src={pdfUrl}
                    className="w-full h-[600px]"
                    title="PDF Document"
                  />
                ) : (
                  <div className="flex items-center justify-center h-[600px] text-muted-foreground">
                    <div className="text-center">
                      <p className="text-lg mb-2">No document uploaded</p>
                      <p className="text-sm">Upload a PDF to see side-by-side comparison</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right column - Journal Entry (70% width) */}
            <div className="w-[70%] space-y-2">
              <h3 className="text-lg font-semibold">Extracted Journal Entry</h3>
              {journalEntries.length > 0 ? (
                <JournalEntryCard
                  entry={journalEntries[0]}
                  onSave={() => {}}
                  onDelete={() => {}}
                  showDelete={false}
                />
              ) : (
                <div className="border rounded-lg p-8 text-center text-muted-foreground">
                  <p className="text-lg mb-2">No journal entries extracted</p>
                  <p className="text-sm">The document processing did not extract any valid journal entries.</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Stacked layout */
          <div className="space-y-6">
            {/* PDF Viewer - Full width */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Original Document</h3>
              <div className="border rounded-lg overflow-hidden bg-gray-50">
                {pdfUrl ? (
                  <iframe
                    src={pdfUrl}
                    className="w-full h-[400px]"
                    title="PDF Document"
                  />
                ) : (
                  <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                    <div className="text-center">
                      <p className="text-lg mb-2">No document uploaded</p>
                      <p className="text-sm">Upload a PDF to see document preview</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Journal Entry - Full width */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Extracted Journal Entry</h3>
              {journalEntries.length > 0 ? (
                <JournalEntryCard
                  entry={journalEntries[0]}
                  onSave={() => {}}
                  onDelete={() => {}}
                  showDelete={false}
                />
              ) : (
                <div className="border rounded-lg p-8 text-center text-muted-foreground">
                  <p className="text-lg mb-2">No journal entries extracted</p>
                  <p className="text-sm">The document processing did not extract any valid journal entries.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="outline">
          Reject
        </Button>
        <Button>
          Accept & Save
        </Button>
      </CardFooter>
    </Card>
  );
}