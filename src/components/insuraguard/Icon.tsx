import { cn } from "@/lib/utils";

export function Icon({
  name,
  className,
  fill = false,
}: {
  name: string;
  className?: string;
  fill?: boolean;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn("material-symbols-outlined", fill && "icon-fill", className)}
    >
      {name}
    </span>
  );
}
