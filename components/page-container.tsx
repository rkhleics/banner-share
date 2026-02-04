import type { ReactNode } from "react";

export function PageContainer({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="mx-auto flex max-w-3xl flex-col gap-8 px-6 py-12">
        {children}
      </div>
    </main>
  );
}
