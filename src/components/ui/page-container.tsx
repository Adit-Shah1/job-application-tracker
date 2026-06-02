import { cn } from "@/lib/utils";

export function PageContainer({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("animate-fade-up space-y-6", className)}>
      {children}
    </div>
  );
}
