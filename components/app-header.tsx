import type { ReactNode } from "react";

export function AppHeader({ children }: { children: ReactNode }) {
  return (
    <header className="px-6 py-6">
      <div className="grid grid-cols-[200px_1fr_200px] items-center">
        <img
          src="/rkh-logo.png"
          alt="RKH"
          className="ml-10 w-[160px] h-auto justify-self-start"
        />
        <div className="flex max-w-3xl flex-col items-center gap-2 text-center justify-self-center">
          {children}
        </div>
        <div aria-hidden="true" />
      </div>
    </header>
  );
}
