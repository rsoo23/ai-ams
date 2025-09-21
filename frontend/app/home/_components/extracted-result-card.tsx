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
import { LayoutGrid, Columns, AlertTriangle, CheckCircle, XCircle, Info, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { JournalEntry } from "@/app/journal-entries/page";
import { JournalEntryCard } from "@/app/journal-entries/_components/journal-entry-card";
import { saveJournalEntry } from "@/api/journal-entries";

interface UploadResponse {
  s3_key: string;
  data: any; // Journal entry data
  validation?: any[]; // Validation/compliance issues
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

export default function ExtractedResultCard({ uploadResponse, pdfUrl }: ExtractedResultCardProps) {
  const [viewMode, setViewMode] = useState<'side-by-side' | 'stacked'>('stacked');
  
  // Mutation for saving journal entry
  const { mutate: saveEntry, isPending: isSaving } = useMutation({
    mutationFn: saveJournalEntry,
    onSuccess: () => {
      toast.success("Journal entry saved successfully!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to save journal entry");
    },
  });
  
  // Parse the journal entries from the upload response and transform to match JournalEntry interface
  let journalEntries: JournalEntry[] = [];
  
  if (uploadResponse) {
    try {
      // Check if data is a string that needs parsing or already an object
      let parsedData;
      if (typeof uploadResponse.data === 'string') {
        parsedData = JSON.parse(uploadResponse.data);
      } else {
        parsedData = uploadResponse.data;
      }
      
      // Handle single entry or array of entries
      const entriesArray = Array.isArray(parsedData) ? parsedData : [parsedData];
      
      journalEntries = entriesArray.map((entry: any, index: number) => ({
        id: index + 1,
        date: new Date(entry.date || new Date()),
        reference: entry.reference || `JE-${String(index + 1).padStart(3, '0')}`,
        description: entry.description || 'Extracted journal entry',
        created_at: new Date(),
        lines: (entry.lines || []).map((line: any, lineIndex: number) => ({
          id: lineIndex + 1,
          account_id: parseInt(line.account_code || line.account_id) || 0,
          account_name: line.account_name || `Account ${line.account_code || line.account_id || 'Unknown'}`,
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

  // Function to handle saving the journal entry
  const handleSaveJournalEntry = () => {
    if (journalEntries.length === 0) {
      toast.error("No journal entry to save");
      return;
    }

    const entry = journalEntries[0]; // Take the first entry
    
    // Validate that the entry has lines
    if (!entry.lines || entry.lines.length === 0) {
      toast.error("Journal entry must have at least one line item");
      return;
    }

    // Check if lines have proper debits/credits
    const hasValidAmounts = entry.lines.some(line => line.debit > 0 || line.credit > 0);
    if (!hasValidAmounts) {
      toast.error("Journal entry must have at least one line with debit or credit amount");
      return;
    }
    
    // Transform the data to match the API request format
    const requestBody = {
      date: entry.date.toISOString().split('T')[0], // Format as YYYY-MM-DD
      reference: entry.reference || `JE-${Date.now()}`, // Provide default if undefined
      description: entry.description || "Extracted journal entry", // Provide default if undefined
      lines: entry.lines.map(line => ({
        account_code: line.account_id, // Map account_id to account_code
        debit: line.debit,
        credit: line.credit,
        description: line.description || "" // Provide default if undefined
      }))
    };

    saveEntry(requestBody);
  };

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
              variant={viewMode === 'stacked' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('stacked')}
              className="gap-2"
            >
              <LayoutGrid className="h-4 w-4" />
              Stacked
            </Button>
            <Button
              variant={viewMode === 'side-by-side' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('side-by-side')}
              className="gap-2"
            >
              <Columns className="h-4 w-4" />
              Side by Side
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

        {/* Validation Issues Section */}
        {uploadResponse?.validation && uploadResponse.validation.length > 0 && (
          <div className="mt-6 space-y-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <h3 className="text-lg font-semibold">Validation Issues</h3>
              <Badge variant="secondary" className="text-xs">
                {uploadResponse.validation.length} issue{uploadResponse.validation.length > 1 ? 's' : ''}
              </Badge>
            </div>
            
            <Accordion type="single" collapsible className="w-full">
              {uploadResponse.validation.map((issue: any, index: number) => {
                const getIcon = (type: string) => {
                  switch (type) {
                    case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
                    case 'warning': return <AlertTriangle className="h-4 w-4 text-amber-500" />;
                    case 'info': return <Info className="h-4 w-4 text-blue-500" />;
                    default: return <AlertTriangle className="h-4 w-4 text-gray-500" />;
                  }
                };

                const getBadgeVariant = (type: string) => {
                  switch (type) {
                    case 'error': return 'destructive' as const;
                    case 'warning': return 'secondary' as const;
                    case 'info': return 'outline' as const;
                    default: return 'secondary' as const;
                  }
                };

                return (
                  <AccordionItem key={index} value={`issue-${index}`}>
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-3 text-left">
                        {getIcon(issue.type)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{issue.title}</span>
                            <Badge variant={getBadgeVariant(issue.type)} className="text-xs">
                              {issue.type.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {issue.description}
                          </p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-2">
                      <div className="space-y-4">
                        {/* Issue Details */}
                        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium text-muted-foreground">Category:</span>
                              <p>{issue.category}</p>
                            </div>
                            {issue.field && (
                              <div>
                                <span className="font-medium text-muted-foreground">Field:</span>
                                <p className="font-mono text-xs">{issue.field}</p>
                              </div>
                            )}
                            {issue.value && (
                              <div>
                                <span className="font-medium text-muted-foreground">Current Value:</span>
                                <p className="font-mono text-xs">{issue.value}</p>
                              </div>
                            )}
                            {issue.expected && (
                              <div>
                                <span className="font-medium text-muted-foreground">Expected Value:</span>
                                <p className="font-mono text-xs">{issue.expected}</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Actionable Steps */}
                        {issue.actionable_steps && issue.actionable_steps.length > 0 && (
                          <div>
                            <h5 className="font-medium mb-3">Recommended Actions:</h5>
                            <div className="space-y-3">
                              {issue.actionable_steps.map((step: any, stepIndex: number) => (
                                <div key={stepIndex} className="flex items-start gap-3 p-3 border rounded-lg">
                                  <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                                    {stepIndex + 1}
                                  </div>
                                  <div className="flex-1">
                                    <h6 className="font-medium text-sm mb-1">{step.title}</h6>
                                    <p className="text-sm text-muted-foreground mb-2">{step.description}</p>
                                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                      <span>
                                        <strong>Action:</strong> {step.action_type}
                                      </span>
                                      {step.estimated_time && (
                                        <span>
                                          <strong>Time:</strong> {step.estimated_time}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="outline" disabled={isSaving}>
          Reject
        </Button>
        <Button onClick={handleSaveJournalEntry} disabled={isSaving || journalEntries.length === 0}>
          {isSaving ? "Saving..." : "Accept & Save"}
        </Button>
      </CardFooter>
    </Card>
  );
}