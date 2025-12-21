import { LucideIcon } from 'lucide-react';
import { StatsCard } from '@/components/dashboard';

interface StatsWidgetProps {
    id: string;
    data: {
        title: string;
        value: string;
        icon: LucideIcon;
        iconBgColor: string;
        iconColor: string;
        subtitle: string;
        trend: { value: string; isPositive: boolean };
        onClick?: () => void;
    };
}

export function StatsWidget({ data }: StatsWidgetProps) {
    return (
        <div className="h-full">
            <StatsCard
                title={data.title}
                value={data.value}
                icon={data.icon}
                iconBgColor={data.iconBgColor}
                iconColor={data.iconColor}
                subtitle={data.subtitle}
                trend={data.trend}
                onClick={data.onClick}
            />
        </div>
    );
}
