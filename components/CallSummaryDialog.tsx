"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";

interface CallSummaryDialogProps {
  orderId: string;
  summary: string | null;
}

export function CallSummaryDialog({ orderId, summary }: CallSummaryDialogProps) {
  if (!summary) {
    return (
      <span className="text-sm text-muted-foreground">—</span>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs">
          <MessageSquare className="h-3 w-3" />
          View
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Call Summary — {orderId}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {summary}
        </p>
      </DialogContent>
    </Dialog>
  );
}
