"use client";

import { useRouter } from "next/navigation";
import { FileText } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  onCreateManually: () => void;
}

export function EmptyState({ onCreateManually }: EmptyStateProps) {
  const router = useRouter();

  return (
    <Card className="w-full">
      <CardContent className="flex items-center justify-center py-6">
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
            <FileText className="w-8 h-8 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-medium">No Journal Entries Found</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Start by extracting data from your documents or create a journal entry manually.
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-center gap-2 w-full">
        <Button
          onClick={() => router.push('/home')}
          className="w-fit"
        >
          Extract from Documents
        </Button>
        <Button
          variant="outline"
          onClick={onCreateManually}
          className="w-fit"
        >
          Create Entry Manually
        </Button>
      </CardFooter>
    </Card>
  );
}