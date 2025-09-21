"use client";

import { useRef, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, AlertTriangle, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";
import { TypographyP } from "../_components/typography";
import { prompt } from "@/api/chat";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { MessageBubble, Message } from "./_components/message-bubble";
import { ChatInput } from "./_components/chat-input";
import { useChat } from "./_components/use-chat";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Mock data for Revenue vs Expenses
const revenueExpenseData = [
  {
    month: "Jan",
    revenue: 85000,
    expenses: 62000,
    netProfit: 23000
  },
  {
    month: "Feb", 
    revenue: 92000,
    expenses: 68000,
    netProfit: 24000
  },
  {
    month: "Mar",
    revenue: 78000,
    expenses: 88000,
    netProfit: -10000
  },
  {
    month: "Apr",
    revenue: 105000,
    expenses: 75000,
    netProfit: 30000
  },
  {
    month: "May",
    revenue: 98000,
    expenses: 69000,
    netProfit: 29000
  },
  {
    month: "Jun",
    revenue: 112000,
    expenses: 78000,
    netProfit: 34000
  }
];

// Mock data for Financial Health Alerts
const financialAlerts = [
  {
    id: 1,
    title: "Cash Flow Negative in March",
    description: "March showed a significant loss with expenses exceeding revenue by RM 10,000",
    severity: "high" as const,
    icon: AlertTriangle,
    actionableSteps: [
      "Review major expense categories from March",
      "Implement cost reduction measures for recurring expenses",
      "Negotiate payment terms with major suppliers",
      "Consider temporary hiring freeze for non-essential positions"
    ]
  },
  {
    id: 2,
    title: "Revenue Growth Opportunity",
    description: "June revenue peaked at RM 112,000, indicating strong market demand",
    severity: "low" as const,
    icon: TrendingUp,
    actionableSteps: [
      "Analyze factors that contributed to June's success",
      "Implement successful June strategies in upcoming months",
      "Consider scaling marketing efforts that drove June results",
      "Explore similar market opportunities"
    ]
  },
  {
    id: 3,
    title: "Expense Volatility Warning",
    description: "Operating expenses fluctuated by 38% between lowest and highest months",
    severity: "medium" as const,
    icon: AlertCircle,
    actionableSteps: [
      "Establish monthly expense budgets with variance controls",
      "Implement expense approval workflows for large purchases",
      "Review and optimize vendor contracts for predictable pricing",
      "Create contingency plans for expense management"
    ]
  },
  {
    id: 4,
    title: "Healthy Profit Margins",
    description: "Average net profit margin of 23% indicates strong financial performance",
    severity: "low" as const,
    icon: CheckCircle,
    actionableSteps: [
      "Maintain current profit optimization strategies",
      "Document successful cost management processes",
      "Share best practices across all departments",
      "Set up monitoring systems to maintain performance"
    ]
  },
  {
    id: 5,
    title: "Q2 Recovery Strong",
    description: "Strong recovery in Q2 with consistent RM 30K+ profits in Apr-Jun",
    severity: "low" as const,
    icon: TrendingUp,
    actionableSteps: [
      "Document Q2 recovery strategies for future reference",
      "Analyze what drove the Apr-Jun consistency",
      "Prepare contingency plans based on Q2 learnings",
      "Consider replicating Q2 approach in Q4"
    ]
  }
];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-MY', {
    style: 'currency',
    currency: 'MYR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

const getSeverityConfig = (severity: 'high' | 'medium' | 'low') => {
  switch (severity) {
    case 'high':
      return {
        badgeVariant: 'destructive' as const,
        bgColor: 'bg-red-50 dark:bg-red-950/20',
        borderColor: 'border-red-200 dark:border-red-800'
      };
    case 'medium':
      return {
        badgeVariant: 'secondary' as const,
        bgColor: 'bg-yellow-50 dark:bg-yellow-950/20',
        borderColor: 'border-yellow-200 dark:border-yellow-800'
      };
    case 'low':
      return {
        badgeVariant: 'outline' as const,
        bgColor: 'bg-green-50 dark:bg-green-950/20',
        borderColor: 'border-green-200 dark:border-green-800'
      };
  }
};

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "#3b82f6", // Blue
  },
  expenses: {
    label: "Expenses", 
    color: "#D160FA",
  },
  netProfit: {
    label: "Net Profit",
    color: "#10b981", // Light Green (default for positive)
  },
} satisfies ChartConfig;

// Custom tooltip content with better spacing
const CustomTooltipContent = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border rounded-lg shadow-lg p-3 min-w-[200px]">
        <p className="text-sm font-medium mb-2">{`Month: ${label}`}</p>
        <div className="space-y-2">
          {payload.map((entry: any, index: number) => {
            // Get the actual data item to check netProfit value for color
            const dataItem = revenueExpenseData.find(item => item.month === label);
            let color = entry.color;
            
            // Override color for netProfit based on positive/negative value
            if (entry.dataKey === 'netProfit' && dataItem) {
              color = dataItem.netProfit >= 0 ? "#10b981" : "#f87171";
            }
            // Override color for expenses to match the chart
            if (entry.dataKey === 'expenses') {
              color = "#D160FA";
            }
            // Override color for revenue to match the chart
            if (entry.dataKey === 'revenue') {
              color = "#3b82f6";
            }
            
            return (
              <div key={index} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-sm" 
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-sm text-muted-foreground">{entry.name}</span>
                </div>
                <span className="text-sm font-semibold tabular-nums">
                  {formatCurrency(entry.value)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  return null;
};

export default function ChatPage() {
  const { messages, addMessage, completeStreaming } = useChat();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<typeof financialAlerts[0] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { mutate, isPending } = useMutation({
    mutationFn: prompt,
    onSuccess: (data: any) => {
      addMessage(
        data.response || "I apologize, but I couldn't generate a proper response.",
        "assistant",
        { isStreaming: true }
      );
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to send message");
      addMessage(
        "I'm sorry, I encountered an error while processing your message. Please try again.",
        "assistant",
        { isError: true }
      );
    },
  });

  // Set mounted state and initialize messages after component mounts to avoid hydration mismatch
  useEffect(() => {
    setIsMounted(true);
    if (!isInitialized) {
      addMessage(
        "Hello! I'm your AI assistant. How can I help you today?",
        "assistant",
        { isStreaming: true }
      );
      setIsInitialized(true);
    }
  }, [isInitialized]);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Keep input focused
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [messages, isPending]);

  const handleSendMessage = (messageContent: string) => {
    // Add user message
    addMessage(messageContent, "user");
    
    // Call the actual API
    mutate(messageContent);
  };

  return (
    <div className="flex flex-col gap-4 min-w-full">
      {/* Revenue vs Expenses Chart */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Revenue vs Expenses Analysis
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Monthly comparison showing profitability trends and sustainability metrics
          </p>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-80 w-full">
            <BarChart data={revenueExpenseData} margin={{ top: 20, right: 30, left: 30, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="month" 
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <YAxis 
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={formatCurrency}
              />
              <ChartTooltip 
                cursor={false}
                content={<CustomTooltipContent />}
              />
              <Bar 
                dataKey="revenue" 
                fill="#3b82f6"
                name="Revenue"
                radius={[8, 8, 0, 0]}
              />
              <Bar 
                dataKey="expenses" 
                fill="#D160FA"
                name="Expenses"
                radius={[8, 8, 0, 0]}
              />
              <Bar 
                dataKey="netProfit" 
                name="Net Profit"
                radius={[8, 8, 0, 0]}
              >
                {revenueExpenseData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.netProfit >= 0 ? "#10b981" : "#f87171"} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
          
          {/* Key Insights */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground">Average Monthly Revenue</p>
              <p className="text-2xl font-bold" style={{ color: "#3b82f6" }}>
                {formatCurrency(revenueExpenseData.reduce((sum, item) => sum + item.revenue, 0) / revenueExpenseData.length)}
              </p>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground">Average Monthly Expenses</p>
              <p className="text-2xl font-bold" style={{ color: "#D160FA" }}>
                {formatCurrency(revenueExpenseData.reduce((sum, item) => sum + item.expenses, 0) / revenueExpenseData.length)}
              </p>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground">Average Net Profit</p>
              <p className="text-2xl font-bold" style={{ 
                color: (revenueExpenseData.reduce((sum, item) => sum + item.netProfit, 0) / revenueExpenseData.length) >= 0 
                  ? "#10b981" 
                  : "#f87171" 
              }}>
                {formatCurrency(revenueExpenseData.reduce((sum, item) => sum + item.netProfit, 0) / revenueExpenseData.length)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Health Alerts */}
      <Card className="w-full h-[600px] flex flex-col">
        <CardHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">Financial Health Alerts</CardTitle>
            <p className="text-sm text-muted-foreground">
              {financialAlerts.filter(alert => alert.severity === 'high').length} High Priority • {' '}
              {financialAlerts.filter(alert => alert.severity === 'medium').length} Medium • {' '}
              {financialAlerts.filter(alert => alert.severity === 'low').length} Low Priority
            </p>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 pr-4">
              {financialAlerts.map((alert) => {
                const severityConfig = getSeverityConfig(alert.severity);
                const IconComponent = alert.icon;
                
                return (
                  <Card 
                    key={alert.id} 
                    className={`${severityConfig.bgColor} ${severityConfig.borderColor} border-2`}
                  >
                    <CardContent className="px-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <IconComponent className="h-5 w-5" />
                          <Badge variant={severityConfig.badgeVariant} className="text-xs">
                            {alert.severity.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                      
                      <h4 className="font-semibold text-sm mb-2 leading-tight">
                        {alert.title}
                      </h4>
                      
                      <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                        {alert.description}
                      </p>
                      
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full text-xs"
                        onClick={() => {
                          setSelectedAlert(alert);
                          setIsModalOpen(true);
                        }}
                      >
                        View Action Plan
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Virtual CFO Chat */}
      <Card className="w-full h-[calc(100vh-24rem)] min-h-[500px] flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            <TypographyP>Virtual CFO Chat</TypographyP>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col p-0 min-h-0">
          <ScrollArea ref={scrollAreaRef} className="flex-1 p-4 min-h-0">
            <div className="space-y-4">
              {isMounted && messages.map((message) => (
                <MessageBubble 
                  key={message.id}
                  message={message} 
                  onStreamingComplete={completeStreaming}
                />
              ))}
              
              {isPending && (
                <div className="flex gap-3 justify-start">
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="bg-muted rounded-lg px-3 py-2 mr-12 flex items-center justify-center">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="border-t p-4 shrink-0 pb-0">
            <ChatInput onSendMessage={handleSendMessage} isLoading={isPending} />
          </div>
        </CardContent>
      </Card>

      {/* Actionable Steps Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="min-w-5xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedAlert && (
                <>
                  <selectedAlert.icon className="h-5 w-5" />
                  Action Plan: {selectedAlert.title}
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {selectedAlert?.description}
            </DialogDescription>
          </DialogHeader>
          
          {selectedAlert && (
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-4">
                <Badge variant={getSeverityConfig(selectedAlert.severity).badgeVariant}>
                  {selectedAlert.severity.toUpperCase()} PRIORITY
                </Badge>
              </div>
              
              <h4 className="font-semibold mb-3">Recommended Actions:</h4>
              <div className="space-y-3">
                {selectedAlert.actionableSteps.map((step, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <p className="text-sm leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 flex gap-2">
                <Button 
                  onClick={() => setIsModalOpen(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Close
                </Button>
                <Button 
                  onClick={() => {
                    toast.success("Action plan noted! Consider implementing these steps.");
                    setIsModalOpen(false);
                  }}
                  className="flex-1"
                >
                  Mark as Reviewed
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
