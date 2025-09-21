"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";

interface JournalEntryLine {
  id: number;
  account_id: number;
  account_name: string;
  debit: number;
  credit: number;
  description?: string;
}

interface JournalEntry {
  id: number;
  date: Date;
  reference?: string;
  description?: string;
  created_at: Date;
  lines: JournalEntryLine[];
}

interface NewEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (newEntry: JournalEntry) => void;
}

export function NewEntryModal({
  isOpen,
  onClose,
  onCreate,
}: NewEntryModalProps) {
  const [newEntryData, setNewEntryData] = useState<{
    reference: string;
    description: string;
    date: string;
    lines: JournalEntryLine[];
  }>({
    reference: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    lines: [
      {
        id: 1,
        account_id: 0,
        account_name: '',
        debit: 0,
        credit: 0,
        description: ''
      },
      {
        id: 2,
        account_id: 0,
        account_name: '',
        debit: 0,
        credit: 0,
        description: ''
      }
    ]
  });

  const handleUpdateEntry = (field: 'reference' | 'description' | 'date', value: string) => {
    setNewEntryData({
      ...newEntryData,
      [field]: value
    });
  };

  const handleUpdateLine = (lineIndex: number, field: keyof JournalEntryLine, value: any) => {
    const updatedLines = [...newEntryData.lines];
    updatedLines[lineIndex] = {
      ...updatedLines[lineIndex],
      [field]: value
    };
    setNewEntryData({
      ...newEntryData,
      lines: updatedLines
    });
  };

  const handleAddLine = () => {
    const newLine: JournalEntryLine = {
      id: Date.now(),
      account_id: 0,
      account_name: '',
      debit: 0,
      credit: 0,
      description: ''
    };
    setNewEntryData({
      ...newEntryData,
      lines: [...newEntryData.lines, newLine]
    });
  };

  const handleDeleteLine = (lineIndex: number) => {
    if (newEntryData.lines.length > 2) {
      const updatedLines = newEntryData.lines.filter((_, index) => index !== lineIndex);
      setNewEntryData({
        ...newEntryData,
        lines: updatedLines
      });
    }
  };

  const handleCreateEntry = () => {
    const totalDebits = newEntryData.lines.reduce((sum, line) => sum + line.debit, 0);
    const totalCredits = newEntryData.lines.reduce((sum, line) => sum + line.credit, 0);
    
    if (Math.abs(totalDebits - totalCredits) > 0.01) {
      alert('Journal entry must balance! Total debits must equal total credits.');
      return;
    }

    if (!newEntryData.reference.trim() || !newEntryData.description.trim()) {
      alert('Please fill in the reference and description fields.');
      return;
    }

    const newId = Date.now(); // Will be replaced with proper ID in parent
    const newEntry: JournalEntry = {
      id: newId,
      date: new Date(newEntryData.date),
      reference: newEntryData.reference,
      description: newEntryData.description,
      created_at: new Date(),
      lines: newEntryData.lines.map((line, index) => ({
        ...line,
        id: newId * 1000 + index
      }))
    };

    onCreate(newEntry);
    
    // Reset modal
    setNewEntryData({
      reference: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      lines: [
        { id: 1, account_id: 0, account_name: '', debit: 0, credit: 0, description: '' },
        { id: 2, account_id: 0, account_name: '', debit: 0, credit: 0, description: '' }
      ]
    });
    onClose();
  };
  const totalDebits = newEntryData.lines.reduce((sum, line) => sum + line.debit, 0);
  const totalCredits = newEntryData.lines.reduce((sum, line) => sum + line.credit, 0);
  const difference = Math.abs(totalDebits - totalCredits);
  const isBalanced = difference < 0.01;
  const canCreate = isBalanced && newEntryData.reference.trim() && newEntryData.description.trim();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl min-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Journal Entry</DialogTitle>
          <DialogDescription>
            Add a new journal entry with balanced debits and credits
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Entry Header Fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reference">Reference</Label>
              <Input
                id="reference"
                value={newEntryData.reference}
                onChange={(e) => handleUpdateEntry('reference', e.target.value)}
                placeholder="e.g., REF001"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={newEntryData.description}
                onChange={(e) => handleUpdateEntry('description', e.target.value)}
                placeholder="Entry description"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={newEntryData.date}
                onChange={(e) => handleUpdateEntry('date', e.target.value)}
              />
            </div>
          </div>

          {/* Journal Lines */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Journal Lines</h3>
              <Button
                type="button"
                size="sm"
                onClick={handleAddLine}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Line
              </Button>
            </div>

            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Account</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right w-[120px]">Debit (MYR)</TableHead>
                    <TableHead className="text-right w-[120px]">Credit (MYR)</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {newEntryData.lines.map((line, lineIndex) => (
                    <TableRow key={lineIndex}>
                      <TableCell className="p-2">
                        <Input
                          value={line.account_name}
                          onChange={(e) => handleUpdateLine(lineIndex, 'account_name', e.target.value)}
                          placeholder="Account name"
                          className="border-0 shadow-none focus-visible:ring-1 focus-visible:ring-ring"
                        />
                      </TableCell>
                      <TableCell className="p-2">
                        <Input
                          value={line.description}
                          onChange={(e) => handleUpdateLine(lineIndex, 'description', e.target.value)}
                          placeholder="Line description"
                          className="border-0 shadow-none focus-visible:ring-1 focus-visible:ring-ring"
                        />
                      </TableCell>
                      <TableCell className="p-2">
                        <Input
                          type="number"
                          step="0.01"
                          value={line.debit}
                          onChange={(e) => handleUpdateLine(lineIndex, 'debit', parseFloat(e.target.value) || 0)}
                          placeholder="0.00"
                          className="text-right border-0 shadow-none focus-visible:ring-1 focus-visible:ring-ring"
                        />
                      </TableCell>
                      <TableCell className="p-2">
                        <Input
                          type="number"
                          step="0.01"
                          value={line.credit}
                          onChange={(e) => handleUpdateLine(lineIndex, 'credit', parseFloat(e.target.value) || 0)}
                          placeholder="0.00"
                          className="text-right border-0 shadow-none focus-visible:ring-1 focus-visible:ring-ring"
                        />
                      </TableCell>
                      <TableCell className="p-2">
                        <Button
                          type="button"
                          variant="ghost"
                          disabled={newEntryData.lines.length <= 2}
                          size="sm"
                          onClick={() => handleDeleteLine(lineIndex)}
                          className="h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground disabled:opacity-30"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={2} className="font-semibold">Total</TableCell>
                    <TableCell className="text-right font-semibold">
                      MYR {totalDebits.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      MYR {totalCredits.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </div>

            {/* Balance Check */}
            <div className={`p-3 rounded-lg text-sm ${isBalanced ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {isBalanced ? (
                <span className="flex items-center">
                  ✓ Journal entry is balanced
                </span>
              ) : (
                <span className="flex items-center">
                  ⚠ Out of balance by MYR {difference.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleCreateEntry}
            disabled={!canCreate}
          >
            Create Entry
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}