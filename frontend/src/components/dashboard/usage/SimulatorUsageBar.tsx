import React from 'react';
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Zap, HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface SimulatorUsageBarProps {
    usage: number; // Total used
    limit: number; // Base Plan Limit (can be -1 for unlimited)
    extra: number; // Extra credits available
    planName: string;
}

export function SimulatorUsageBar({ usage, limit, extra, planName }: SimulatorUsageBarProps) {
    const isUnlimited = limit === -1 || limit > 9000;

    // effectiveLimit for progress bar calculation
    // If unlimited, we show usage relative to a "Soft Cap" or just show a small bar
    // Let's assume for unlimited we don't show a progress bar or show it full/empty.

    // For limited plans:
    // Total Capacity = Limit + Extra
    // Usage fills the bar. 
    // If Usage > Limit, it means we are dipping into Extra.

    const totalCapacity = isUnlimited ? 100 : limit + extra;
    const progressPercent = isUnlimited ? 0 : Math.min(100, (usage / totalCapacity) * 100);

    // Calculate segments for visualization
    // We want to differentiate Base Limit usage vs Extra usage if possible, 
    // but a single bar is simpler.
    // Let's try to show: 
    // [ =========== | ----- ]
    // Used | Remaining

    const remainingBase = isUnlimited ? 999 : Math.max(0, limit - usage);
    const usedFromExtra = isUnlimited ? 0 : Math.max(0, usage - limit);
    const remainingExtra = Math.max(0, extra - usedFromExtra);

    const totalRemaining = isUnlimited ? '∞' : (remainingBase + remainingExtra);

    if (isUnlimited) {
        return (
            <div className="flex items-center gap-2 p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                <div className="p-2 bg-blue-100 rounded-full text-blue-600">
                    <Zap className="w-4 h-4" />
                </div>
                <div>
                    <div className="text-sm font-semibold text-blue-900">Plan {planName}</div>
                    <div className="text-xs text-blue-700">Casos Ilimitados ({usage} utilizados)</div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full space-y-2 p-4 bg-white rounded-lg border shadow-sm">
            <div className="flex justify-between items-end mb-1">
                <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                        Créditos de Simulación
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                    <HelpCircle className="w-3 h-3 text-gray-400 cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Incluye tu plan base + packs extra.</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </span>
                    <span className="text-xs text-gray-500">
                        {usage} / {totalCapacity} casos utilizados
                    </span>
                </div>
                <div className="text-right">
                    <Badge variant={totalRemaining === 0 ? "destructive" : "secondary"} className="mb-0.5">
                        Restan: {totalRemaining}
                    </Badge>
                </div>
            </div>

            {/* Progress Bar Container */}
            <div className="relative h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                {/* Main Usage Bar */}
                <div
                    className={`h-full transition-all duration-500 rounded-full ${usedFromExtra > 0 ? 'bg-orange-500' : 'bg-blue-600'}`}
                    style={{ width: `${progressPercent}%` }}
                />
            </div>

            {/* Extra Pack Indicator */}
            {extra > 0 && (
                <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                    <span>Plan Base: {limit}</span>
                    <span className="flex items-center text-orange-600 font-medium">
                        <Zap className="w-3 h-3 mr-0.5" />
                        Pack Extra: {remainingExtra} disponibles
                    </span>
                </div>
            )}
        </div>
    );
}
