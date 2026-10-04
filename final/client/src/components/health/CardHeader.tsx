import { ReactNode } from "react";

interface CardHeaderProps {
  icon: ReactNode;
  title: string;
  subtitle: string;
  buttonText: string;
  onClick: () => void;
  iconBgClassName?: string;
  disabled?: boolean;
}

export default function CardHeader({
  icon,
  title,
  subtitle,
  buttonText,
  onClick,
  iconBgClassName = "bg-brand-50",
  disabled = false,
}: CardHeaderProps) {
  return (
    <div className="flex items-start justify-between p-6">

      <div className="flex gap-4">

        <div className={`w-14 h-14 rounded-2xl ${iconBgClassName} flex items-center justify-center shadow-sm`}>
          {icon}
        </div>

        <div>

          <h2 className="text-xl font-semibold text-gray-900">
            {title}
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            {subtitle}
          </p>

        </div>

      </div>

      <button
        onClick={onClick}
        disabled={disabled}
        className={`rounded-xl text-white px-4 py-2 text-sm font-medium shadow-lg transition-all duration-300 ${
          disabled
            ? 'bg-gray-300 shadow-none cursor-not-allowed'
            : 'bg-gradient-to-r from-brand-500 to-brand-500 hover:from-brand-600 hover:to-brand-600 shadow-brand-200 hover:scale-105'
        }`}
      >
        {buttonText}
      </button>

    </div>
  );
}