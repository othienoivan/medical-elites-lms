import type { ReactNode } from "react";

export default function WidgetGrid({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`grid gap-5 md:grid-cols-2 xl:grid-cols-4 ${className}`}>{children}</div>;
}
