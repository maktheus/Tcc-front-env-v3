import { clsx } from "clsx";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "green" | "blue" | "yellow" | "red" | "purple" | "gray" | "violet";
  className?: string;
}

export function Badge({ children, variant = "gray", className }: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold",
        {
          "bg-green-900/60 text-green-300 ring-1 ring-green-700/50": variant === "green",
          "bg-blue-900/60 text-blue-300 ring-1 ring-blue-700/50": variant === "blue",
          "bg-yellow-900/60 text-yellow-300 ring-1 ring-yellow-700/50": variant === "yellow",
          "bg-red-900/60 text-red-300 ring-1 ring-red-700/50": variant === "red",
          "bg-purple-900/60 text-purple-300 ring-1 ring-purple-700/50": variant === "purple",
          "bg-zinc-800 text-zinc-400 ring-1 ring-zinc-700": variant === "gray",
          "bg-violet-900/60 text-violet-300 ring-1 ring-violet-700/50": variant === "violet",
        },
        className
      )}
    >
      {children}
    </span>
  );
}
