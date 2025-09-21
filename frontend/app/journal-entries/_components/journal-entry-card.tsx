"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
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

interface JournalEntryCardProps {
  entry: JournalEntry;
  onSave: (entryId: number, updatedEntry: JournalEntry) => void;
  onDelete: (entryId: number) => void;
  showDelete?: boolean;
}

export function JournalEntryCard({
  entry,
  onSave,
  onDelete,
  showDelete = true,
}: JournalEntryCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingEntryData, setEditingEntryData] = useState<{
    reference?: string;
    description?: string;
    lines: JournalEntryLine[];
  }>({ lines: [] });

  const handleEditEntry = () => {
    setIsEditing(true);
    setEditingEntryData({
      reference: entry.reference,
      description: entry.description,
      lines: [...entry.lines]
    });
  };

  const handleSaveEntry = () => {
    const updatedEntry: JournalEntry = {
      ...entry,
      reference: editingEntryData.reference || entry.reference,
      description: editingEntryData.description || entry.description,
      lines: editingEntryData.lines
    };
    
    onSave(entry.id, updatedEntry);
    setIsEditing(false);
    setEditingEntryData({ lines: [] });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingEntryData({ lines: [] });
  };

  const handleUpdateLine = (lineIndex: number, field: keyof JournalEntryLine, value: any) => {
    const updatedLines = [...editingEntryData.lines];
    updatedLines[lineIndex] = {
      ...updatedLines[lineIndex],
      [field]: value
    };
    setEditingEntryData({
      ...editingEntryData,
      lines: updatedLines
    });
  };

  const handleDeleteLine = (lineIndex: number) => {
    const updatedLines = editingEntryData.lines.filter((_, index) => index !== lineIndex);
    setEditingEntryData({
      ...editingEntryData,
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
    setEditingEntryData({
      ...editingEntryData,
      lines: [...editingEntryData.lines, newLine]
    });
  };

  const handleUpdateEntry = (field: 'reference' | 'description', value: string) => {
    setEditingEntryData({
      ...editingEntryData,
      [field]: value
    });
  };
  const lines = isEditing ? editingEntryData.lines : entry.lines;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-MY', {
      style: 'currency',
      currency: 'MYR'
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1 mr-4">
            {isEditing ? (
              <div className="space-y-2">
                <Input
                  value={editingEntryData.reference || ''}
                  onChange={(e) => handleUpdateEntry('reference', e.target.value)}
                  placeholder="Reference (e.g., JE-001)"
                  className="font-semibold"
                />
                <Input
                  value={editingEntryData.description || ''}
                  onChange={(e) => handleUpdateEntry('description', e.target.value)}
                  placeholder="Description"
                  className="text-sm"
                />
              </div>
            ) : (
              <div 
                className="cursor-pointer hover:bg-muted/50 p-2 rounded"
                onClick={handleEditEntry}
              >
                <CardTitle className="flex items-center gap-2">
                  {entry.reference}
                  <span className="text-sm font-normal text-muted-foreground">
                    #{entry.id}
                  </span>
                </CardTitle>
                <CardDescription>{entry.description}</CardDescription>
              </div>
            )}
          </div>
          <div className="text-right text-sm text-muted-foreground">
            <div>Date: {formatDate(entry.date)}</div>
            <div>Created: {formatDate(entry.created_at)}</div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Account</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Debit</TableHead>
              <TableHead className="text-right">Credit</TableHead>
              <TableHead className="text-right">Balance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lines.map((line, lineIndex) => (
              <TableRow key={line.id}>
                <TableCell className="font-medium">
                  {isEditing ? (
                    <div className="space-y-1">
                      <Input
                        value={line.account_name || ''}
                        onChange={(e) => handleUpdateLine(lineIndex, 'account_name', e.target.value)}
                        placeholder="Account name"
                        className="text-sm"
                      />
                      <Input
                        type="number"
                        value={line.account_id || ''}
                        onChange={(e) => handleUpdateLine(lineIndex, 'account_id', parseInt(e.target.value) || 0)}
                        placeholder="Account ID"
                        className="text-xs"
                      />
                    </div>
                  ) : (
                    <div>
                      <div>{line.account_name}</div>
                      <div className="text-xs text-muted-foreground">#{line.account_id}</div>
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {isEditing ? (
                    <Input
                      value={line.description || ''}
                      onChange={(e) => handleUpdateLine(lineIndex, 'description', e.target.value)}
                      placeholder="Description"
                      className="text-sm"
                    />
                  ) : (
                    <div>{line.description}</div>
                  )}
                </TableCell>
                <TableCell className="text-right font-mono">
                  {isEditing ? (
                    <Input
                      type="number"
                      step="0.01"
                      value={line.debit !== undefined ? line.debit : ''}
                      onChange={(e) => handleUpdateLine(lineIndex, 'debit', parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      className="text-sm text-right"
                    />
                  ) : (
                    <div>
                      {line.debit > 0 ? formatCurrency(line.debit) : '-'}
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-right font-mono">
                  {isEditing ? (
                    <Input
                      type="number"
                      step="0.01"
                      value={line.credit !== undefined ? line.credit : ''}
                      onChange={(e) => handleUpdateLine(lineIndex, 'credit', parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      className="text-sm text-right"
                    />
                  ) : (
                    <div>
                      {line.credit > 0 ? formatCurrency(line.credit) : '-'}
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-right font-mono">
                  {isEditing ? (
                    <div className="flex gap-1 justify-end">
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handleDeleteLine(lineIndex)}
                      >
                        Delete
                      </Button>
                    </div>
                  ) : (
                    <div>
                      {formatCurrency(line.debit - line.credit)}
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
            
            {isEditing && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
                  <Button 
                    onClick={handleAddLine}
                    className="w-full"
                  >
                    Add New Line
                  </Button>
                </TableCell>
              </TableRow>
            )}
            
            <TableRow className="border-t-2 font-bold">
              <TableCell className="font-bold" colSpan={2}>Total</TableCell>
              <TableCell className="text-right font-mono font-bold">
                {formatCurrency(lines.reduce((sum, line) => sum + line.debit, 0))}
              </TableCell>
              <TableCell className="text-right font-mono font-bold">
                {formatCurrency(lines.reduce((sum, line) => sum + line.credit, 0))}
              </TableCell>
              <TableCell className="text-right font-mono font-bold">
                {formatCurrency(
                  lines.reduce((sum, line) => sum + line.debit, 0) -
                  lines.reduce((sum, line) => sum + line.credit, 0)
                )}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        {isEditing ? (
          <>
            <Button 
              size="sm"
              onClick={handleSaveEntry}
            >
              Save Changes
            </Button>
            <Button 
              size="sm"
              variant="outline"
              onClick={handleCancelEdit}
            >
              Cancel
            </Button>
          </>
        ) : (
          <>
            <Button 
              size="sm"
              onClick={handleEditEntry}
            >
              Edit
            </Button>
            {showDelete && (
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => onDelete(entry.id)}
              >
                Delete
              </Button>
            )}
          </>
        )}
      </CardFooter>
    </Card>
  );
}