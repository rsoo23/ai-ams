"use client";

import { useState } from "react";
import { Search, Filter, Download, Calendar, ChevronRight, Eye, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Types based on accounting standards
interface GLTransaction {
  id: number;
  date: Date;
  reference: string;
  description: string;
  journalEntryId: number;
  debit: number;
  credit: number;
  runningBalance: number;
  postedBy: string;
  postedAt: Date;
}

interface GLAccount {
  id: number;
  code: string;
  name: string;
  type: 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense';
  category: string;
  isActive: boolean;
  currentBalance: number;
  transactions: GLTransaction[];
}

// Mock data representing a typical chart of accounts
const mockGLAccounts: GLAccount[] = [
  {
    id: 1001,
    code: '1001',
    name: 'Cash - Operating Account',
    type: 'Asset',
    category: 'Current Assets',
    isActive: true,
    currentBalance: 125000.00,
    transactions: [
      {
        id: 1,
        date: new Date('2025-09-01'),
        reference: 'JE-001',
        description: 'Opening balance',
        journalEntryId: 1,
        debit: 130000.00,
        credit: 0,
        runningBalance: 130000.00,
        postedBy: 'system',
        postedAt: new Date('2025-09-01T08:00:00')
      },
      {
        id: 2,
        date: new Date('2025-09-10'),
        reference: 'RENT-001',
        description: 'Office rent payment',
        journalEntryId: 2,
        debit: 0,
        credit: 5000.00,
        runningBalance: 125000.00,
        postedBy: 'john.doe',
        postedAt: new Date('2025-09-10T14:30:00')
      }
    ]
  },
  {
    id: 5001,
    code: '5001',
    name: 'Rent Expense',
    type: 'Expense',
    category: 'Operating Expenses',
    isActive: true,
    currentBalance: 5000.00,
    transactions: [
      {
        id: 3,
        date: new Date('2025-09-10'),
        reference: 'RENT-001',
        description: 'Monthly office rent',
        journalEntryId: 2,
        debit: 5000.00,
        credit: 0,
        runningBalance: 5000.00,
        postedBy: 'john.doe',
        postedAt: new Date('2025-09-10T14:30:00')
      }
    ]
  },
  {
    id: 4001,
    code: '4001',
    name: 'Sales Revenue',
    type: 'Revenue',
    category: 'Operating Revenue',
    isActive: true,
    currentBalance: -75000.00, // Credit balance
    transactions: [
      {
        id: 4,
        date: new Date('2025-09-15'),
        reference: 'RCPT-001',
        description: 'Customer payment received',
        journalEntryId: 3,
        debit: 0,
        credit: 75000.00,
        runningBalance: -75000.00,
        postedBy: 'jane.smith',
        postedAt: new Date('2025-09-15T16:45:00')
      }
    ]
  }
];

export default function GeneralLedgerPage() {
  const [selectedAccount, setSelectedAccount] = useState<GLAccount | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('current-month');
  const [accountTypeFilter, setAccountTypeFilter] = useState('all');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-MY', {
      style: 'currency',
      currency: 'MYR',
      minimumFractionDigits: 2
    }).format(Math.abs(amount));
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    }).format(date);
  };

  const getBalanceDisplay = (balance: number, accountType: string) => {
    const isCredit = balance < 0;
    const absBalance = Math.abs(balance);
    
    // For revenue and liability accounts, negative means credit (normal)
    if (accountType === 'Revenue' || accountType === 'Liability') {
      return {
        amount: formatCurrency(absBalance),
        type: isCredit ? 'credit' : 'debit',
        isNormal: isCredit
      };
    }
    
    // For asset and expense accounts, positive means debit (normal)
    return {
      amount: formatCurrency(absBalance),
      type: isCredit ? 'credit' : 'debit',
      isNormal: !isCredit
    };
  };

  const filteredAccounts = mockGLAccounts.filter(account => {
    const matchesSearch = account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         account.code.includes(searchTerm);
    const matchesType = accountTypeFilter === 'all' || account.type === accountTypeFilter;
    return matchesSearch && matchesType;
  });

  const handleViewTransactions = (account: GLAccount) => {
    setSelectedAccount(account);
  };

  const handleBackToAccounts = () => {
    setSelectedAccount(null);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header with controls */}
      <div className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10 mb-4">
        <div className="flex flex-col gap-4">
          <p className="text-muted-foreground">
            {selectedAccount ? 
            `${selectedAccount.code} - ${selectedAccount.name}` :
            'View account balances and transaction details'
            }
          </p>

          <Separator />

          {/* Controls in one row */}
          <div className="flex gap-4 items-center justify-between">
            <div className="flex gap-4 items-center">
              {/* Back Button */}
              {selectedAccount && (
                <Button onClick={handleBackToAccounts} size="icon">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}

              {/* Search */}
              <div className="w-64">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search accounts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              {/* Period Selection */}
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger className="w-48 pl-10">
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="current-month">Current Month</SelectItem>
                    <SelectItem value="last-month">Last Month</SelectItem>
                    <SelectItem value="current-quarter">Current Quarter</SelectItem>
                    <SelectItem value="current-year">Current Year</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Account Type Filter */}
              <Select value={accountTypeFilter} onValueChange={setAccountTypeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Account Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Asset">Assets</SelectItem>
                  <SelectItem value="Liability">Liabilities</SelectItem>
                  <SelectItem value="Equity">Equity</SelectItem>
                  <SelectItem value="Revenue">Revenue</SelectItem>
                  <SelectItem value="Expense">Expenses</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Export buttons on the right */}
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        {!selectedAccount ? (
          /* Account List View */
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Chart of Accounts
                <Badge variant="secondary">{filteredAccounts.length} accounts</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">Code</TableHead>
                    <TableHead>Account Name</TableHead>
                    <TableHead className="w-32">Type</TableHead>
                    <TableHead className="text-right w-40">Current Balance</TableHead>
                    <TableHead className="text-right w-32">Transactions</TableHead>
                    <TableHead className="w-20"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAccounts.map((account) => {
                    const balance = getBalanceDisplay(account.currentBalance, account.type);
                    return (
                      <TableRow 
                        key={account.id}
                        className="hover:bg-muted/50 cursor-pointer"
                        onClick={() => handleViewTransactions(account)}
                      >
                        <TableCell className="font-mono font-medium">
                          {account.code}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{account.name}</div>
                            <div className="text-sm text-muted-foreground">{account.category}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            account.type === 'Asset' ? 'default' :
                            account.type === 'Liability' ? 'destructive' :
                            account.type === 'Equity' ? 'secondary' :
                            account.type === 'Revenue' ? 'default' : 'outline'
                          }>
                            {account.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          <div className={`${balance.isNormal ? 'text-foreground' : 'text-orange-600'}`}>
                            {balance.amount}
                            <span className="text-xs ml-1 text-muted-foreground">
                              {balance.type === 'credit' ? 'CR' : 'DR'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {account.transactions.length}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : (
          /* Transaction Detail View */
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {selectedAccount.code} - {selectedAccount.name}
                    <Badge variant="secondary">{selectedAccount.type}</Badge>
                  </CardTitle>
                  <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                    <span>Category: {selectedAccount.category}</span>
                    <span>Current Balance: {formatCurrency(Math.abs(selectedAccount.currentBalance))}</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-28">Date</TableHead>
                    <TableHead className="w-32">Reference</TableHead>
                    <TableHead className="w-64">Description</TableHead>
                    <TableHead className="text-right w-32">Debit</TableHead>
                    <TableHead className="text-right w-32">Credit</TableHead>
                    <TableHead className="text-right w-40">Running Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedAccount.transactions.map((transaction) => {
                    const balanceDisplay = getBalanceDisplay(transaction.runningBalance, selectedAccount.type);
                    return (
                      <TableRow key={transaction.id} className="hover:bg-muted/50">
                        <TableCell className="font-mono">
                          <div className="text-xs text-muted-foreground">
                            {formatDate(transaction.postedAt)}
                          </div>
                        </TableCell>
                        <TableCell className="font-mono font-medium">
                          {transaction.reference}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div>{transaction.description}</div>
                            <div className="text-xs text-muted-foreground">
                              JE #{transaction.journalEntryId} • {transaction.postedBy}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {transaction.debit > 0 ? formatCurrency(transaction.debit) : '-'}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {transaction.credit > 0 ? formatCurrency(transaction.credit) : '-'}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          <div className={`${balanceDisplay.isNormal ? 'text-foreground' : 'text-orange-600'}`}>
                            {balanceDisplay.amount}
                            <span className="text-xs ml-1 text-muted-foreground">
                              {balanceDisplay.type === 'credit' ? 'CR' : 'DR'}
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              <Separator className="my-6" />

              {/* Account Summary */}
              <div className="p-4 bg-muted/30 rounded-lg">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Total Debits</div>
                    <div className="font-mono font-semibold">
                      {formatCurrency(selectedAccount.transactions.reduce((sum, t) => sum + t.debit, 0))}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Total Credits</div>
                    <div className="font-mono font-semibold">
                      {formatCurrency(selectedAccount.transactions.reduce((sum, t) => sum + t.credit, 0))}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Transaction Count</div>
                    <div className="font-semibold">{selectedAccount.transactions.length}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Account Balance</div>
                    <div className="font-mono font-semibold">
                      {getBalanceDisplay(selectedAccount.currentBalance, selectedAccount.type).amount}
                      <span className="text-xs ml-1">
                        {getBalanceDisplay(selectedAccount.currentBalance, selectedAccount.type).type === 'credit' ? 'CR' : 'DR'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
