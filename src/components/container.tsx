import { clsx } from "@/lib/clsx";

export function Container({
  children,
  className,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "section" | "header" | "footer" | "article";
}) {
  return (
    <Tag className={clsx("mx-auto w-full max-w-shell px-6 md:px-10", className)}>
      {children}
    </Tag>
  );
}
