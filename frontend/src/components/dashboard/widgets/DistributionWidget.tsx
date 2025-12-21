import { LucideIcon } from 'lucide-react';
import { ProgressChart } from '@/components/dashboard';

interface DistributionWidgetProps {
    title: string;
    subtitle: string;
    data: any[];
    totalValue: number;
    trend: { value: string; isPositive: boolean };
}

export function DistributionWidget({ title, subtitle, data, totalValue, trend }: DistributionWidgetProps) {
    return (
        <div className="bg-white rounded-xl border p-0 h-full overflow-hidden">
            {/* We use the existing ProgressChart component which has its own padding/styling */}
            <ProgressChart
                title={title}
                totalValue={totalValue}
                trend={trend}
                data={data || []}
            />
        </div>
    );
}
