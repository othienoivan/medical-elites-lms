import type { HTMLAttributes, ReactNode } from "react";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

export default function Card({ children, className = "", ...props }: CardProps) {
  return (
    <div
      className={`rounded-2xl bg-white p-6 shadow-sm transition ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}