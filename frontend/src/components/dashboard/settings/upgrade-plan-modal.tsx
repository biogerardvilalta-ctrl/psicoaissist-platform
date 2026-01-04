
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Crown, ArrowRight, Zap } from 'lucide-react';
import { useState } from 'react';
import { usePayments } from '@/hooks/usePayments';
import { useAuth } from '@/contexts/auth-context';

const upgradePlans = [
    {
        id: 'pro',
        name: 'Pro',
        price: '59€',
        description: 'Ideal para profesionales activos',
        features: ['Pacientes ilimitados', '15h Transcripción + IA', 'Simulador (5 casos)'],
        popular: true,
        planType: 'PRO'
    },
    {
        id: 'premium',
        name: 'Premium',
        price: '99€',
        description: 'Para especialistas con alto volumen',
        features: ['Todo lo de Pro', '50h Transcripción + IA', 'Simulador Ilimitado'],
        popular: false,
        planType: 'PREMIUM'
    },
    {
        id: 'minutes_pack',
        name: 'Pack Minutos',
        price: '15€',
        description: '500 minutos extra de IA/Transcripción',
        features: ['Añade 500 minutos', 'Acumulable', 'Un solo pago'],
        popular: false,
        planType: 'ADD_ON'
    },
    {
        id: 'simulator_pack',
        name: 'Pack 10 Casos',
        price: '15€',
        description: '10 casos clínicos extra para el simulador',
        features: ['10 casos extra', 'Sin caducidad', 'Acumulable'],
        popular: false,
        planType: 'ADD_ON'
    }
];

interface UpgradePlanModalProps {
    isOpen: boolean;
    onClose: () => void;
    limitType?: 'transcription' | 'simulator';
}

export function UpgradePlanModal({ isOpen, onClose, limitType = 'transcription' }: UpgradePlanModalProps) {
    const router = useRouter();
    const { createCheckoutSession, loading } = usePayments();
    const { user } = useAuth();
    const [showPlans, setShowPlans] = useState(false);

    const isSimulator = limitType === 'simulator';
    const title = isSimulator ? "Límite de Casos Alcanzado" : "Límite de Transcripción Alcanzado";
    const description = isSimulator
        ? "Has agotado los casos clínicos disponibles en tu ciclo actual o pack."
        : "Has consumido los minutos de IA/Transcripción disponibles en tu ciclo actual.";

    const handleUpgrade = async (planId: string) => {
        try {
            await createCheckoutSession({
                // @ts-ignore
                plan: planId,
                interval: (planId === 'minutes_pack' || planId === 'simulator_pack') ? undefined : 'month' // Packs are one-time
            });
        } catch (err) {
            console.error('Upgrade error', err);
            router.push('/dashboard/settings/billing');
        }
    };

    // Filter plans based on current user plan
    const getVisiblePlans = () => {
        const currentPlan = (user?.subscription?.planType || 'BASIC').toUpperCase();

        switch (currentPlan) {
            case 'PREMIUM':
                return upgradePlans.filter(p => ['minutes_pack', 'simulator_pack'].includes(p.id));
            case 'PRO':
                return upgradePlans.filter(p => ['premium', 'minutes_pack', 'simulator_pack'].includes(p.id));
            case 'BASIC':
            default:
                // Show everything including Pro, Premium and Packs
                return upgradePlans;
        }
    };

    const visiblePlans = getVisiblePlans();

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] p-8 flex flex-col items-center text-center gap-6">
                {!showPlans ? (
                    <>
                        <div className="h-16 w-16 bg-orange-100 rounded-full flex items-center justify-center mb-2">
                            <Crown className="h-8 w-8 text-orange-500" />
                        </div>

                        <DialogHeader className="space-y-4">
                            <DialogTitle className="text-2xl font-extrabold text-slate-900 leading-tight">
                                {title}
                            </DialogTitle>
                            <div className="text-slate-500 text-sm leading-relaxed max-w-[350px] mx-auto">
                                <p>{description}</p>
                                <p className="mt-2 font-medium text-slate-700">
                                    {(isSimulator && visiblePlans.some(p => p.id === 'simulator_pack')) ? "Compra un pack de casos para continuar." :
                                        (visiblePlans.some(p => p.id === 'minutes_pack') ?
                                            "Actualiza tu plan o compra un pack de minutos." :
                                            "Actualiza a un plan superior para eliminar límites.")}
                                </p>
                            </div>
                        </DialogHeader>

                        <div className="w-full space-y-3 mt-4">
                            <Button
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-12 rounded-xl shadow-lg shadow-indigo-200 transition-all hover:scale-[1.02]"
                                onClick={() => setShowPlans(true)}
                            >
                                Ver Opciones Disponibles <ArrowRight className="ml-2 h-4 w-4" />
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
                            <h3 className="text-xl font-bold mb-4">Opciones Disponibles para Ti</h3>
                            <div className="grid grid-cols-1 gap-4">
                                {visiblePlans.map((plan) => (
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
                                            <div className="flex items-center gap-2">
                                                {plan.id === 'minutes_pack' && <Zap className="h-4 w-4 text-amber-500 fill-amber-500" />}
                                                {plan.id === 'simulator_pack' && <Crown className="h-4 w-4 text-blue-500 fill-blue-500" />}
                                                <h3 className="font-bold text-base text-slate-900">{plan.name}</h3>
                                            </div>
                                            <span className="font-bold text-lg text-slate-900">
                                                {plan.price}
                                                <span className="text-xs font-normal text-slate-500">
                                                    {plan.id === 'minutes_pack' ? '/pago único' : '/mes'}
                                                </span>
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500 mb-3">{plan.description}</p>
                                        <Button
                                            size="sm"
                                            className={`w-full ${plan.popular ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-slate-900 hover:bg-slate-800'}`}
                                            onClick={(e) => { e.stopPropagation(); handleUpgrade(plan.id); }}
                                            disabled={loading}
                                        >
                                            {loading ? 'Procesando...' : (plan.id === 'minutes_pack' ? 'Comprar Pack' : `Mejorar a ${plan.name}`)}
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
