import ServicesSection from '../components/ServicesSection';
import type { AppPage } from '../types';

interface ServicesPageProps {
  onNavigate: (page: AppPage) => void;
}

export default function ServicesPage({ onNavigate }: ServicesPageProps) {
  return (
    <div className="pt-28">
      <ServicesSection
        onNavigate={onNavigate}
        onBook={() => onNavigate('booking')}
        showAll
      />
    </div>
  );
}
