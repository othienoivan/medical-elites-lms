import type { ReactNode } from "react";

interface HeadingProps {
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  dark?: boolean;
  children?: ReactNode;
}

export default function Heading({
  title,
  subtitle,
  align = "left",
  dark = false,
}: HeadingProps) {
  return (
    <div className={align === "center" ? "text-center" : ""}>
      {subtitle && (
        <p
          className={`font-semibold uppercase tracking-wide ${
            dark ? "text-blue-300" : "text-blue-700"
          }`}
        >
          {subtitle}
        </p>
      )}

      <h2
        className={`mt-2 text-4xl font-bold ${
          dark ? "text-white" : "text-slate-900"
        }`}
      >
        {title}
      </h2>
    </div>
  );
}
