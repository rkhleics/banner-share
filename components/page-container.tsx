import type { ReactNode } from "react";

export function PageContainer({
  children,
  headerContent
}: {
  children: ReactNode;
  headerContent?: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <header className="relative px-6 py-6">
        <img
          src="/rkh-logo.png"
          alt="RKH"
          className="absolute left-10 top-6 w-[9%] max-w-[120px] h-auto"
        />
        {headerContent ? (
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-2 text-center">
            {headerContent}
          </div>
        ) : null}
      </header>
      <div className="mx-auto flex max-w-3xl flex-col gap-8 px-6 pb-12">
        {children}
      </div>
    </main>
  );
}
