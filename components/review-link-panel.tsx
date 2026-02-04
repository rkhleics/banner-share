"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";

interface ReviewLinkPanelProps {
  reviewUrl: string;
}

export function ReviewLinkPanel({ reviewUrl }: ReviewLinkPanelProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(reviewUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <Input value={reviewUrl} readOnly />
      <div className="flex flex-wrap gap-3">
        <TooltipProvider>
          <Tooltip open={copied}>
            <TooltipTrigger asChild>
              <Button type="button" onClick={handleCopy}>
                Copy link
              </Button>
            </TooltipTrigger>
            <TooltipContent>Copied</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <Button
          type="button"
          variant="secondary"
          onClick={() => window.open(reviewUrl, "_blank", "noopener")}
        >
          Open review
        </Button>
      </div>
    </div>
  );
}
