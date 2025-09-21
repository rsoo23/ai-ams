"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JournalEntryCard, NewEntryModal, EmptyState } from "./_components";

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

// Dummy data
const dummyJournalEntries: JournalEntry[] = [
  {
    id: 1,
    date: new Date('2024-01-15'),
    reference: 'JE-001',
    description: 'Office rent payment',
    created_at: new Date('2024-01-15T10:30:00'),
    lines: [
      {
        id: 1,
        account_id: 5001,
        account_name: 'Rent Expense',
        debit: 2500.00,
        credit: 0.00,
        description: 'Monthly office rent'
      },
      {
        id: 2,
        account_id: 1001,
        account_name: 'Cash',
        debit: 0.00,
        credit: 2500.00,
        description: 'Payment for rent'
      }
    ]
  },
  {
    id: 2,
    date: new Date('2024-01-16'),
    reference: 'JE-002',
    description: 'Equipment purchase',
    created_at: new Date('2024-01-16T14:45:00'),
    lines: [
      {
        id: 3,
        account_id: 1500,
        account_name: 'Equipment',
        debit: 5000.00,
        credit: 0.00,
        description: 'New laptop and printer'
      },
      {
        id: 4,
        account_id: 2001,
        account_name: 'Accounts Payable',
        debit: 0.00,
        credit: 5000.00,
        description: 'Amount owed to supplier'
      }
    ]
  },
  {
    id: 3,
    date: new Date('2024-01-17'),
    reference: 'JE-003',
    description: 'Sales revenue',
    created_at: new Date('2024-01-17T16:20:00'),
    lines: [
      {
        id: 5,
        account_id: 1001,
        account_name: 'Cash',
        debit: 7500.00,
        credit: 0.00,
        description: 'Cash received from sales'
      },
      {
        id: 6,
        account_id: 4001,
        account_name: 'Sales Revenue',
        debit: 0.00,
        credit: 7500.00,
        description: 'Revenue from product sales'
      }
    ]
  },
  {
    id: 4,
    date: new Date('2024-01-18'),
    reference: 'JE-004',
    description: 'Utility bill payment',
    created_at: new Date('2024-01-18T11:15:00'),
    lines: [
      {
        id: 7,
        account_id: 5002,
        account_name: 'Utilities Expense',
        debit: 450.00,
        credit: 0.00,
        description: 'Electricity and water bill'
      },
      {
        id: 8,
        account_id: 1001,
        account_name: 'Cash',
        debit: 0.00,
        credit: 450.00,
        description: 'Payment for utilities'
      }
    ]
  }
];

export default function JournalEntryPage() {
  const [entries, setEntries] = useState<JournalEntry[]>(dummyJournalEntries);
  const [isNewEntryModalOpen, setIsNewEntryModalOpen] = useState(false);

  const handleDeleteEntry = (entryId: number) => {
    setEntries(entries.filter(entry => entry.id !== entryId));
  };

  const handleSaveEntry = (entryId: number, updatedEntry: JournalEntry) => {
    setEntries(entries.map(entry => 
      entry.id === entryId ? updatedEntry : entry
    ));
  };

  const handleCreateNewEntry = (newEntry: JournalEntry) => {
    const newId = Math.max(...entries.map(e => e.id)) + 1;
    const entryWithId = {
      ...newEntry,
      id: newId,
      lines: newEntry.lines.map((line, index) => ({
        ...line,
        id: newId * 1000 + index
      }))
    };
    setEntries([entryWithId, ...entries]);
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
          {entries.length === 0 ? (
            <EmptyState onCreateManually={handleCreateManually} />
          ) : (
            entries.map((entry) => (
              <JournalEntryCard
                key={entry.id}
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
