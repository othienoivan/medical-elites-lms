import type { ReactNode } from "react";

interface HeadingProps {
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  children?: ReactNode;
}

export default function Heading({
  title,
  subtitle,
  align = "left",
}: HeadingProps) {
  return (
    <div className={align === "center" ? "text-center" : ""}>
      {subtitle && (
        <p className="font-semibold uppercase tracking-wide text-blue-700">
          {subtitle}
        </p>
      )}

      <h2 className="mt-2 text-4xl font-bold text-slate-900">
        {title}
      </h2>
    </div>
  );
}