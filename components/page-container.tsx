import type { ReactNode } from "react";

export function PageContainer({
  children,
  header
}: {
  children: ReactNode;
  header?: ReactNode;
}) {
  return (
    <main className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {header}
      <div className="flex flex-1 items-center">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 pb-12">
          {children}
        </div>
      </div>
    </main>
  );
}
