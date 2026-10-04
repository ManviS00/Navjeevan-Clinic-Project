import { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export default function HealthCard({ children }: Props) {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
      {children}
    </div>
  );
}