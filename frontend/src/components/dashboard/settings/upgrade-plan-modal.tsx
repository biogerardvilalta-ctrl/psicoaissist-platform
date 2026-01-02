
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Crown, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { usePayments } from '@/hooks/usePayments';

const upgradePlans = [
    {
        id: 'pro',
        name: 'Pro',
        price: '59€',
        description: 'Ideal para profesionales activos',
        features: ['Pacientes ilimitados', '15h Transcripción + IA', 'Simulador (5 casos)'],
        popular: true,
    },
    {
        id: 'premium',
        name: 'Premium',
        price: '99€',
        description: 'Para especialistas con alto volumen',
        features: ['Todo lo de Pro', '50h Transcripción + IA', 'Simulador Ilimitado'],
        popular: false,
    }
];

interface UpgradePlanModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function UpgradePlanModal({ isOpen, onClose }: UpgradePlanModalProps) {
    const router = useRouter();
    const { createCheckoutSession, loading } = usePayments();
    const [showPlans, setShowPlans] = useState(false);

    const handleUpgrade = async (planId: string) => {
        try {
            await createCheckoutSession({
                // @ts-ignore
                plan: planId,
                interval: 'month'
            });
        } catch (err) {
            console.error('Upgrade error', err);
            router.push('/dashboard/settings/billing');
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] p-8 flex flex-col items-center text-center gap-6">
                {!showPlans ? (
                    <>
                        <div className="h-16 w-16 bg-orange-100 rounded-full flex items-center justify-center mb-2">
                            <Crown className="h-8 w-8 text-orange-500" />
                        </div>

                        <DialogHeader className="space-y-4">
                            <DialogTitle className="text-2xl font-extrabold text-slate-900 leading-tight">
                                Límite de Transcripción Alcanzado
                            </DialogTitle>
                            <div className="text-slate-500 text-sm leading-relaxed max-w-[350px] mx-auto">
                                <p>Has consumido los minutos de IA/Transcripción disponibles en tu ciclo actual.</p>
                                <p className="mt-2 font-medium text-slate-700">Actualiza a <span className="text-slate-900 font-bold">Pro</span> o <span className="text-slate-900 font-bold">Premium</span> para eliminar límites.</p>
                            </div>
                        </DialogHeader>

                        <div className="w-full space-y-3 mt-4">
                            <Button
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-12 rounded-xl shadow-lg shadow-indigo-200 transition-all hover:scale-[1.02]"
                                onClick={() => setShowPlans(true)}
                            >
                                Ver Planes y Precios <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                className="w-full text-slate-400 hover:text-slate-600 font-medium"
                                onClick={onClose}
                            >
                                Ahora no
                            </Button>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="w-full text-left">
                            <h3 className="text-xl font-bold mb-4">Elige tu plan</h3>
                            <div className="grid grid-cols-1 gap-4">
                                {upgradePlans.map((plan) => (
                                    <div
                                        key={plan.id}
                                        className={`border rounded-xl p-4 flex flex-col ${plan.popular ? 'border-indigo-500 bg-indigo-50/30' : 'border-slate-200'} relative hover:shadow-md transition-shadow cursor-pointer`}
                                        onClick={() => handleUpgrade(plan.id)}
                                    >
                                        {plan.popular && (
                                            <div className="absolute -top-3 right-4 bg-indigo-600 text-white px-3 py-0.5 rounded-full text-[10px] font-bold shadow-sm uppercase tracking-wide">
                                                Recomendado
                                            </div>
                                        )}
                                        <div className="flex justify-between items-center mb-1">
                                            <h3 className="font-bold text-base text-slate-900">{plan.name}</h3>
                                            <span className="font-bold text-lg text-slate-900">{plan.price}<span className="text-xs font-normal text-slate-500">/mes</span></span>
                                        </div>
                                        <p className="text-xs text-slate-500 mb-3">{plan.description}</p>
                                        <Button
                                            size="sm"
                                            className={`w-full ${plan.popular ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-slate-900 hover:bg-slate-800'}`}
                                            onClick={(e) => { e.stopPropagation(); handleUpgrade(plan.id); }}
                                            disabled={loading}
                                        >
                                            {loading ? 'Procesando...' : `Mejorar a ${plan.name}`}
                                        </Button>
                                    </div>
                                ))}
                            </div>
                            <Button variant="ghost" className="mt-4 w-full" onClick={() => setShowPlans(false)}>Volver</Button>
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
