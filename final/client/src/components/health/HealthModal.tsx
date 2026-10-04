import { ReactNode } from "react";
import { X } from "lucide-react";

interface HealthModalProps {
  open: boolean;
  title: string;
  subtitle?: string;
  icon: ReactNode;
  children: ReactNode;
  onClose: () => void;
}

export default function HealthModal({
  open,
  title,
  subtitle,
  icon,
  children,
  onClose,
}: HealthModalProps) {

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-5">

      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-300">

        <div className="flex items-center justify-between border-b p-6">

          <div className="flex items-center gap-4">

            <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center">
              {icon}
            </div>

            <div>

              <h2 className="text-xl font-bold">
                {title}
              </h2>

              {subtitle && (
                <p className="text-gray-500 text-sm mt-1">
                  {subtitle}
                </p>
              )}

            </div>

          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 hover:bg-gray-100 transition"
          >
            <X className="w-5 h-5"/>
          </button>

        </div>

        <div className="p-6">
          {children}
        </div>

      </div>

    </div>
  );
}