"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type DropzoneStatus = "idle" | "uploading" | "success" | "error";

interface DropzoneProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
  status?: DropzoneStatus;
  helperText?: string;
  fileName?: string | null;
}

export function Dropzone({
  onFileSelect,
  disabled,
  status = "idle",
  helperText,
  fileName
}: DropzoneProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = React.useState(false);

  const stateClasses = {
    idle: "border-slate-300 bg-white",
    uploading: "border-slate-300 bg-slate-50",
    success: "border-emerald-300 bg-emerald-50",
    error: "border-rose-300 bg-rose-50"
  }[status];

  const dragClasses = dragActive
    ? "border-slate-900 bg-slate-50"
    : stateClasses;

  const handleFile = (file: File | null) => {
    if (!file || disabled) return;
    onFileSelect(file);
  };

  return (
    <div
      className={cn(
        "flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-colors",
        dragClasses,
        disabled && "cursor-not-allowed opacity-60"
      )}
      onDragEnter={(event) => {
        event.preventDefault();
        if (!disabled) setDragActive(true);
      }}
      onDragOver={(event) => {
        event.preventDefault();
        if (!disabled) setDragActive(true);
      }}
      onDragLeave={(event) => {
        event.preventDefault();
        setDragActive(false);
      }}
      onDrop={(event) => {
        event.preventDefault();
        setDragActive(false);
        const file = event.dataTransfer.files?.[0] ?? null;
        handleFile(file);
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".zip"
        className="sr-only"
        disabled={disabled}
        onChange={(event) => handleFile(event.target.files?.[0] ?? null)}
      />
      <div className="flex flex-col items-center gap-3">
        <div>
          <p className="text-base font-semibold text-slate-900">
            Drag and drop your ZIP
          </p>
          <p className="text-sm text-slate-500">or</p>
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={() => inputRef.current?.click()}
          disabled={disabled}
        >
          Choose file
        </Button>
        {helperText ? (
          <p className="max-w-md text-xs text-slate-500">{helperText}</p>
        ) : null}
        {fileName ? (
          <p className="text-xs text-slate-600">Selected: {fileName}</p>
        ) : null}
      </div>
    </div>
  );
}
