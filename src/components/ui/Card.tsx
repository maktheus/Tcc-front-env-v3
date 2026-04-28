import { clsx } from "clsx";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className, hover }: CardProps) {
  return (
    <div
      className={clsx(
        "rounded-xl border border-zinc-800 bg-zinc-900 p-5",
        hover && "transition-colors hover:border-zinc-700 hover:bg-zinc-800/80",
        className
      )}
    >
      {children}
    </div>
  );
}
