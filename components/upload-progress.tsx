import { Progress } from "@/components/ui/progress";

interface UploadProgressProps {
  label: string;
  percent: number;
  detail?: string;
}

export function UploadProgress({ label, percent, detail }: UploadProgressProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between text-sm text-slate-600">
        <span>{label}</span>
        <span>{percent}%</span>
      </div>
      <Progress value={percent} />
      {detail ? <p className="text-xs text-slate-500">{detail}</p> : null}
    </div>
  );
}
