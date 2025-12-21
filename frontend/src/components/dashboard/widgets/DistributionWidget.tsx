import { LucideIcon } from 'lucide-react';
import { ProgressChart } from '@/components/dashboard';
import { useRouter } from 'next/navigation';

interface DistributionWidgetProps {
    title: string;
    subtitle: string;
    data: any[];
    totalValue: number;
    trend: { value: string; isPositive: boolean };
}

export function DistributionWidget({ title, subtitle, data, totalValue, trend }: DistributionWidgetProps) {
    const router = useRouter();

    return (
        <div
            onClick={() => router.push('/dashboard/statistics?tab=clinical')}
            className="bg-white rounded-xl border p-0 h-full overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
        >
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
