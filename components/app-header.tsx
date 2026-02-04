import type { ReactNode } from "react";

export function AppHeader({ children }: { children: ReactNode }) {
  return (
    <header className="relative px-6 py-6">
      <img
        src="/rkh-logo.png"
        alt="RKH"
        className="absolute left-10 top-6 w-[9%] max-w-[120px] h-auto"
      />
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-2 text-center">
        {children}
      </div>
    </header>
  );
}
