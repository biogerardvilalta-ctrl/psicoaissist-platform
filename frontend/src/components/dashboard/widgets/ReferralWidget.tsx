import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Gift, Copy, Check } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function ReferralWidget() {
    const { user } = useAuth();
    const [copied, setCopied] = useState(false);

    const referralCode = user?.referralCode || 'GENERANDO...';
    const referralsCount = user?.referralsCount || 0;

    const handleCopy = () => {
        if (!referralCode) return;
        navigator.clipboard.writeText(referralCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Card className="h-full bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white border-0 shadow-lg relative overflow-hidden flex flex-col justify-between">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>

            <CardHeader className="pb-0 pt-4 px-4 relative z-10">
                <CardTitle className="text-base font-bold flex items-center gap-2 text-white">
                    <Gift className="w-4 h-4" />
                    Invita y Gana
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-3 relative z-10 p-4 pt-2">
                <p className="text-white/90 text-[11px] leading-tight">
                    Recibe <strong>5 casos de simulador</strong> por cada profesional que invites.
                </p>

                <div className="bg-white/20 backdrop-blur-md rounded-lg p-2 flex items-center justify-between border border-white/30 h-10">
                    <code className="font-mono text-sm font-bold tracking-wider">
                        {referralCode || '...'}
                    </code>
                    <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 hover:bg-white/20 text-white hover:text-white"
                        onClick={handleCopy}
                        disabled={!user?.referralCode}
                    >
                        {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    </Button>
                </div>

                <div className="pt-2 border-t border-white/20 flex justify-between items-center text-[10px] text-white/80 uppercase font-medium">
                    <span>Referidos</span>
                    <span className="font-bold text-base">{referralsCount}</span>
                </div>
            </CardContent>
        </Card>
    );
}
