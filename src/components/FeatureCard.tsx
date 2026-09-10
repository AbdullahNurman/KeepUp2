import { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  label: string;
  description: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  onClick: () => void;
}

export function FeatureCard({ label, description, icon: Icon, iconBg, iconColor, onClick }: FeatureCardProps) {
  return (
    <button
      onClick={onClick}
      className="flex flex-1 flex-col items-start gap-3 rounded-2xl bg-white p-4 text-left shadow-sm ring-1 ring-gray-100 transition-all hover:-translate-y-0.5 hover:shadow-md dark:bg-gray-900 dark:ring-gray-800"
    >
      <span className={`flex h-12 w-12 items-center justify-center rounded-full ${iconBg}`}>
        <Icon className={`h-6 w-6 ${iconColor}`} />
      </span>
      <div>
        <p className="font-bold text-gray-900 dark:text-gray-100">{label}</p>
        <p className="text-xs leading-relaxed text-gray-500 dark:text-gray-400">{description}</p>
      </div>
    </button>
  );
}
