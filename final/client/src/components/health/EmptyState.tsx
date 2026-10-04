import { ReactNode } from "react";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  bgClassName?: string;
}

export default function EmptyState({
  icon,
  title,
  description,
  bgClassName = "bg-gray-50",
}: EmptyStateProps) {
  return (
    <div className={`rounded-3xl ${bgClassName} py-14 px-8 flex flex-col items-center text-center`}>

      <div className="flex items-center justify-center">
        {icon}
      </div>

      <p className="mt-5 text-gray-600 leading-relaxed max-w-sm">
        {title}
        <br />
        {description}
      </p>

    </div>
  );
}