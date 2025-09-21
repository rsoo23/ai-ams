"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JournalEntryCard, NewEntryModal, EmptyState } from "./_components";
import { getJournalEntries } from "@/api/journal-entries";

export interface JournalEntryLine {
  id: number;
  account_id: number;
  account_name: string;
  debit: number;
  credit: number;
  description?: string;
}

export interface JournalEntry {
  id: number;
  date: Date;
  reference?: string;
  description?: string;
  created_at: Date;
  lines: JournalEntryLine[];
}

export default function JournalEntryPage() {
  const [isNewEntryModalOpen, setIsNewEntryModalOpen] = useState(false);

  // Fetch journal entries from API
  const { data: apiEntries, isLoading, error, refetch } = useQuery({
    queryKey: ['journal-entries'],
    queryFn: getJournalEntries,
  });

  // Transform API data to match our interface and convert entries state to local state for manipulation
  const [entries, setEntries] = useState<JournalEntry[]>([]);

  // Update local state when API data changes
  React.useEffect(() => {
    if (apiEntries) {
      // Transform the API response to match our JournalEntry interface
      const transformedEntries: JournalEntry[] = apiEntries.map((entry: any) => ({
        id: entry.id,
        date: new Date(entry.date),
        reference: entry.reference,
        description: entry.description,
        created_at: new Date(entry.created_at || entry.date),
        lines: entry.lines.map((line: any, index: number) => ({
          id: line.id || index + 1,
          account_id: line.account_code || line.account_id,
          account_name: line.account_name || `Account ${line.account_code || line.account_id}`,
          debit: parseFloat(line.debit) || 0,
          credit: parseFloat(line.credit) || 0,
          description: line.description || ''
        }))
      }));
      setEntries(transformedEntries);
    }
  }, [apiEntries]);

  const handleDeleteEntry = (entryId: number) => {
    setEntries(entries.filter(entry => entry.id !== entryId));
    // TODO: Add API call to delete entry from backend
  };

  const handleSaveEntry = (entryId: number, updatedEntry: JournalEntry) => {
    setEntries(entries.map(entry => 
      entry.id === entryId ? updatedEntry : entry
    ));
    // TODO: Add API call to update entry in backend
  };

  const handleCreateNewEntry = (newEntry: JournalEntry) => {
    const newId = Math.max(...entries.map(e => e.id), 0) + 1;
    const entryWithId = {
      ...newEntry,
      id: newId,
      lines: newEntry.lines.map((line, index) => ({
        ...line,
        id: newId * 1000 + index
      }))
    };
    setEntries([entryWithId, ...entries]);
    // TODO: Add API call to save new entry to backend
    // After successful save, refetch data: refetch();
  };

  const handleCreateManually = () => {
    setIsNewEntryModalOpen(true);
  };

  return (
    <div className="flex flex-col h-full w-full min-w-calc(100vw)">
      {/* Sticky Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10 border-b pb-4 mb-6">
        <div className="flex justify-between items-center p-2 pt-4">
          <p className="text-muted-foreground">View and manage your accounting journal entries</p>
          <Button onClick={() => setIsNewEntryModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Entry
          </Button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-auto">
        <div className="grid gap-6 pb-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading journal entries...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <p className="text-destructive mb-4">Failed to load journal entries</p>
                <Button onClick={() => refetch()} variant="outline">
                  Try Again
                </Button>
              </div>
            </div>
          ) : entries.length === 0 ? (
            <EmptyState onCreateManually={handleCreateManually} />
          ) : (
            entries.map((entry, index) => (
              <JournalEntryCard
                key={`entry-${entry.id}-${index}`}
                entry={entry}
                onSave={handleSaveEntry}
                onDelete={handleDeleteEntry}
              />
            ))
          )}
        </div>
      </div>

      {/* New Entry Modal */}
      <NewEntryModal
        isOpen={isNewEntryModalOpen}
        onClose={() => setIsNewEntryModalOpen(false)}
        onCreate={handleCreateNewEntry}
      />
    </div>
  );
}
