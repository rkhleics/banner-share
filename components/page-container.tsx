import type { ReactNode } from "react";

export function PageContainer({
  children,
  header
}: {
  children: ReactNode;
  header?: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {header}
      <div className="mx-auto flex max-w-3xl flex-col gap-8 px-6 pb-12">
        {children}
      </div>
    </main>
  );
}
