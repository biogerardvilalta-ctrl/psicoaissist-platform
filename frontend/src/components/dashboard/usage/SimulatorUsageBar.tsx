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
    const effectiveLimit = Math.max(0, limit);
    const baseLimit = Math.max(0, effectiveLimit - extra);
    const isUnlimited = limit === -1 || limit > 9000;

    const baseUsage = Math.min(usage, baseLimit);
    const extraUsage = Math.max(0, usage - baseLimit);

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
        <div className="bg-indigo-50/50 rounded-lg p-4 space-y-3 border border-indigo-100/50">
            <div className="flex justify-between items-center">
                <div>
                    <p className="text-sm font-medium text-slate-700">Casos Clínicos</p>
                    <div className="flex items-center gap-1">
                        <p className="text-xs text-muted-foreground">
                            {extra > 0
                                ? `${Math.max(0, baseLimit - baseUsage + Math.max(0, extra - extraUsage))} restantes de ${baseLimit} + ${extra} (Extra)`
                                : `${Math.max(0, baseLimit - baseUsage)} restantes de ${baseLimit}`
                            }
                        </p>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                    <HelpCircle className="w-3 h-3 text-slate-400 cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Incluye tu plan base + packs extra.</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </div>
                <Badge variant={(baseLimit + extra) - usage > 0 ? "default" : "destructive"}>
                    {usage} Usados
                </Badge>
            </div>

            {/* Base Plan Bar */}
            <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-slate-500 uppercase font-semibold">
                    <span>Plan Base</span>
                    <span>{baseUsage} / {baseLimit}</span>
                </div>
                <div className="relative h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-500 ${baseUsage >= baseLimit ? 'bg-red-500' : 'bg-blue-600'}`}
                        style={{ width: `${(baseUsage / Math.max(1, baseLimit)) * 100}%` }}
                    />
                </div>
            </div>

            {/* Extra Pack Bar */}
            {(extra > 0 || usage > baseLimit) && (
                <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-500 uppercase font-semibold">
                        <span>Pack Extra</span>
                        <span>
                            {extraUsage} / {extra + Math.max(0, extraUsage - extra)}
                        </span>
                    </div>
                    <div className="relative h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-500 ${extra === 0 ? 'bg-red-500' : 'bg-purple-500'}`}
                            style={{ width: `${(extraUsage / Math.max(1, extra + Math.max(0, extraUsage - extra))) * 100}%` }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
