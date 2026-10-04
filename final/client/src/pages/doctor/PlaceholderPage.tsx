import type { LucideIcon } from 'lucide-react';
import { Video, Settings } from 'lucide-react';
import Layout from '@/components/doctor/Layout';

interface PlaceholderProps {
  title: string;
  icon: string;
  description: string;
}

const iconMap: Record<string, LucideIcon> = {
  video: Video,
};

export default function PlaceholderPage({ title, icon, description }: PlaceholderProps) {
  const Icon = iconMap[icon] ?? Settings;

  return (
    <Layout title={title}>
      <div className="card mx-auto max-w-lg p-10 text-center">
        <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-brand-50 text-brand-600">
          <Icon className="h-8 w-8" />
        </div>
        <h2 className="font-display text-lg font-bold text-slate-900">{title}</h2>
        <p className="mt-2 text-sm text-slate-500">{description}</p>
      </div>
    </Layout>
  );
}
