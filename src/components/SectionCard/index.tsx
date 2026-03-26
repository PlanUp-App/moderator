import { cn } from "@/lib/utils";

export default function SectionCard({
  title,
  icon: Icon,
  children,
  className,
}: {
  title: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>; // Better typing
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        className,
        "rounded-2xl border border-neutral-100 bg-white shadow-sm overflow-hidden",
      )}
    >
      <div className="flex items-center gap-2.5 border-b border-neutral-100 px-6 py-4">
        {Icon && <Icon size={16} className="text-neutral-400" />}
        <h3 className="pup-body-md-500 text-neutral-black">{title}</h3>
      </div>
      <div className="px-6 py-4">{children}</div>
    </div>
  );
}
