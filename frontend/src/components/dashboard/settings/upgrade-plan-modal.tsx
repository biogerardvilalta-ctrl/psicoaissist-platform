
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Crown, ArrowRight, Zap } from 'lucide-react';
import { useState, useEffect } from 'react';
import { usePayments } from '@/hooks/usePayments';
import { useAuth } from '@/contexts/auth-context';
import { useTranslations } from 'next-intl';

const upgradePlansBase = [
    {
        id: 'pro',
        planType: 'PRO',
        priceMonthly: 59,
        priceAnnual: 590,
        isPack: false
    },
    {
        id: 'premium',
        planType: 'PREMIUM',
        priceMonthly: 99,
        priceAnnual: 990,
        isPack: false,
        popular: false
    },
    {
        id: 'minutes_pack',
        priceMonthly: 15,
        priceAnnual: 15,
        isPack: true,
        popular: false,
        planType: 'ADD_ON'
    },
    {
        id: 'simulator_pack',
        priceMonthly: 15,
        priceAnnual: 15,
        isPack: true,
        popular: false,
        planType: 'ADD_ON'
    },
    {
        id: 'agenda_manager_pack',
        priceMonthly: 15,
        priceAnnual: 15,
        isPack: true,
        popular: false,
        planType: 'ADD_ON'
    },
    {
        id: 'on_boarding_pack',
        priceMonthly: 50,
        priceAnnual: 50,
        isPack: true,
        popular: false,
        planType: 'ADD_ON'
    }
];

interface UpgradePlanModalProps {
    isOpen: boolean;
    onClose: () => void;
    limitType?: 'transcription' | 'simulator';
    initialViewPlans?: boolean;
}

export function UpgradePlanModal({ isOpen, onClose, limitType = 'transcription', initialViewPlans = false }: UpgradePlanModalProps) {
    const t = useTranslations('Dashboard.Settings.UpgradeModal');
    const router = useRouter();
    const { createCheckoutSession, changePlan, loading } = usePayments();
    const { user } = useAuth();
    const [showPlans, setShowPlans] = useState(initialViewPlans);
    const [billingInterval, setBillingInterval] = useState<'month' | 'year'>('month');
    const [confirmingPlanId, setConfirmingPlanId] = useState<string | null>(null);

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setShowPlans(initialViewPlans);
            setConfirmingPlanId(null);
        }
    }, [isOpen, initialViewPlans]);

    // Map plans to include translations
    const upgradePlans = upgradePlansBase.map(plan => ({
        ...plan,
        name: t(`plans.${plan.id}.name`),
        description: t(`plans.${plan.id}.description`),
        // Optional: features if needed, but UI shown didn't use them directly in the list?
        // Ah, looking at code below, Features are NOT rendered in the card list! Just description.
        // So we are good with just name/desc. 
    }));

    const isSimulator = limitType === 'simulator';
    const title = isSimulator ? t('title.simulator') : t('title.transcription');
    const description = isSimulator
        ? t('description.simulator')
        : t('description.transcription');

    const triggerUpgradeConfirmation = (planId: string) => {
        setConfirmingPlanId(planId);
    };

    const confirmUpgrade = async () => {
        if (!confirmingPlanId) return;
        const planId = confirmingPlanId;

        try {
            const isPack = ['minutes_pack', 'simulator_pack', 'agenda_manager_pack', 'on_boarding_pack'].includes(planId);
            const hasActiveSubscription = user?.subscription?.status === 'active';

            // If it's a pack OR the user has no subscription, use Checkout Session
            if (isPack || !hasActiveSubscription) {
                await createCheckoutSession({
                    // @ts-ignore
                    plan: planId,
                    interval: isPack ? undefined : billingInterval
                });
            } else {
                // If it's a plan upgrade (Pro/Premium) AND user has subscription, use Update
                if (user?.subscription?.id) {
                    await changePlan(planId.toLowerCase(), user.subscription.id, billingInterval);
                }
            }
        } catch (err) {
            console.error('Upgrade error', err);
        } finally {
            setConfirmingPlanId(null);
        }
    };

    // Filter plans based on current user plan
    const getVisiblePlans = () => {
        const isCanceled = user?.subscription?.status === 'canceled';
        const currentPlan = (user?.subscription?.planType || 'BASIC').toUpperCase();

        // Check if user is on annual plan
        const isUserAnnual = user?.subscription?.currentPeriodStart && user?.subscription?.currentPeriodEnd
            ? (new Date(user.subscription.currentPeriodEnd).getTime() - new Date(user.subscription.currentPeriodStart).getTime() > 32 * 24 * 60 * 60 * 1000)
            : false;

        // If intervals differ (e.g., user is Annual but selected Monthly), show current plan to allow switch
        const showCurrentPlan = isUserAnnual !== (billingInterval === 'year');

        switch (currentPlan) {
            case 'PREMIUM':
                return upgradePlans.filter(p => ['minutes_pack', 'simulator_pack', 'agenda_manager_pack', 'on_boarding_pack'].includes(p.id) || ((showCurrentPlan || isCanceled) && p.id === 'premium'));
            case 'PRO':
                return upgradePlans.filter(p => ['premium', 'minutes_pack', 'simulator_pack', 'agenda_manager_pack', 'on_boarding_pack'].includes(p.id) || ((showCurrentPlan || isCanceled) && p.id === 'pro'));
            case 'BASIC':
            default:
                // Hide Minutes Pack and Simulator Pack for Basic users? Strategy: Maybe allow onboarding for everyone.
                // Assuming onboarding is allowed for basic too logic above says "Hide ... for Basic".
                // I will allow onboarding for everyone as it's a server setup.
                return upgradePlans.filter(p => !['minutes_pack', 'simulator_pack'].includes(p.id));
        }
    };

    const visiblePlans = getVisiblePlans();

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-full max-w-[600px] p-8 flex flex-col items-center text-center gap-6">
                {confirmingPlanId ? (
                    <>
                        <div className="h-16 w-16 bg-amber-100 rounded-full flex items-center justify-center mb-2">
                            <Zap className="h-8 w-8 text-amber-500" />
                        </div>
                        <DialogHeader className="space-y-4">
                            <DialogTitle className="text-2xl font-extrabold text-slate-900 leading-tight">
                                {t('confirmation.title')}
                            </DialogTitle>
                            <div className="text-slate-600 text-sm leading-relaxed max-w-full max-w-[400px] mx-auto bg-slate-50 p-4 rounded-lg border border-slate-200">
                                <p className="font-semibold text-slate-800 mb-2">
                                    {t('confirmation.message', { planName: upgradePlans.find(p => p.id === confirmingPlanId)?.name || '' })}
                                </p>
                                <p>
                                    {t('confirmation.warningPart1')}<strong>{t('confirmation.warningStrong')}</strong>{t('confirmation.warningPart2')}
                                </p>
                                <p className="mt-2 text-xs text-slate-500">
                                    {t('confirmation.note')}
                                </p>
                            </div>
                        </DialogHeader>

                        <div className="w-full space-y-3 mt-4">
                            <Button
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-12 rounded-xl shadow-lg shadow-indigo-200 transition-all hover:scale-[1.02]"
                                onClick={confirmUpgrade}
                                disabled={loading}
                            >
                                {loading ? t('selection.buttons.processing') : t('confirmation.confirmButton')}
                            </Button>
                            <Button
                                variant="ghost"
                                className="w-full text-slate-400 hover:text-slate-600 font-medium"
                                onClick={() => setConfirmingPlanId(null)}
                                disabled={loading}
                            >
                                {t('buttons.cancel')}
                            </Button>
                        </div>
                    </>
                ) : !showPlans ? (
                    <>
                        <div className="h-16 w-16 bg-orange-100 rounded-full flex items-center justify-center mb-2">
                            <Crown className="h-8 w-8 text-orange-500" />
                        </div>

                        <DialogHeader className="space-y-4">
                            <DialogTitle className="text-2xl font-extrabold text-slate-900 leading-tight">
                                {title}
                            </DialogTitle>
                            <div className="text-slate-500 text-sm leading-relaxed max-w-full max-w-[350px] mx-auto">
                                <p>{description}</p>
                                <p className="mt-2 font-medium text-slate-700">
                                    {(isSimulator && visiblePlans.some(p => p.id === 'simulator_pack')) ? t('callToAction.simulator') :
                                        (visiblePlans.some(p => p.id === 'minutes_pack') ?
                                            t('callToAction.transcription') :
                                            t('callToAction.general'))}
                                </p>
                            </div>
                        </DialogHeader>

                        <div className="w-full space-y-3 mt-4">
                            <Button
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-12 rounded-xl shadow-lg shadow-indigo-200 transition-all hover:scale-[1.02]"
                                onClick={() => setShowPlans(true)}
                            >
                                {t('buttons.viewOptions')} <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                className="w-full text-slate-400 hover:text-slate-600 font-medium"
                                onClick={onClose}
                            >
                                {t('buttons.notNow')}
                            </Button>
                        </div>
                    </>
                ) : (
                    <>
                        <DialogHeader className="text-left w-full mb-4">
                            <DialogTitle className="text-xl font-bold">{t('selection.title')}</DialogTitle>
                            <DialogDescription>
                                {t('selection.subtitle')}
                            </DialogDescription>


                            <div className="flex justify-center mt-6 mb-2">
                                <div className="bg-slate-100 p-1 rounded-xl flex items-center relative">
                                    <button
                                        onClick={() => setBillingInterval('month')}
                                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${billingInterval === 'month' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        {t('selection.monthly')}
                                    </button>
                                    <button
                                        onClick={() => setBillingInterval('year')}
                                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${billingInterval === 'year' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        {t('selection.annual')} <span className="bg-green-100 text-green-700 text-[10px] px-1.5 py-0.5 rounded-full font-extrabold">{t('selection.savePercent')}</span>
                                    </button>
                                </div>
                            </div>
                        </DialogHeader>
                        <div className="w-full text-left space-y-6">
                            {visiblePlans.filter(p => !p.isPack).length > 0 && (
                                <div>
                                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 ml-1">{t('selection.titles.plans')}</h3>
                                    <div className="grid grid-cols-1 gap-4">
                                        {visiblePlans.filter(p => !p.isPack).map((plan) => (
                                            <div
                                                key={plan.id}
                                                className={`border rounded-xl p-4 flex flex-col ${plan.popular ? 'border-indigo-500 bg-indigo-50/30' : 'border-slate-200'} relative hover:shadow-md transition-shadow cursor-pointer`}
                                                onClick={() => triggerUpgradeConfirmation(plan.id)}
                                            >
                                                {plan.popular && (
                                                    <div className="absolute -top-3 right-4 bg-indigo-600 text-white px-3 py-0.5 rounded-full text-[10px] font-bold shadow-sm uppercase tracking-wide">
                                                        {t('selection.recommended')}
                                                    </div>
                                                )}
                                                <div className="flex justify-between items-center mb-1">
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-bold text-base text-slate-900">{plan.name}</h3>
                                                    </div>
                                                    <span className="font-bold text-lg text-slate-900">
                                                        {/* @ts-ignore */}
                                                        {billingInterval === 'year' && !plan.isPack ? `${plan.priceAnnual}€` : `${plan.priceMonthly}€`}
                                                        <span className="text-xs font-normal text-slate-500">
                                                            {/* @ts-ignore */}
                                                            {plan.id.includes('pack') ? t('selection.oneTime') : (billingInterval === 'year' ? t('selection.perYear') : t('selection.perMonth'))}
                                                        </span>
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-500 mb-3">{plan.description}</p>
                                                <Button
                                                    size="sm"
                                                    className={`w-full ${plan.popular ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-slate-900 hover:bg-slate-800'}`}
                                                    onClick={(e) => { e.stopPropagation(); triggerUpgradeConfirmation(plan.id); }}
                                                    disabled={loading}
                                                >
                                                    {loading ? t('selection.buttons.processing') : t('selection.buttons.upgradeTo', { name: plan.name })}
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {visiblePlans.filter(p => p.isPack).length > 0 && (
                                <div>
                                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 ml-1">{t('selection.titles.packs')}</h3>
                                    <div className="grid grid-cols-1 gap-4">
                                        {visiblePlans.filter(p => p.isPack).map((plan) => (
                                            <div
                                                key={plan.id}
                                                className="border border-slate-200 rounded-xl p-4 flex flex-col relative hover:shadow-md transition-shadow cursor-pointer bg-white"
                                                onClick={() => triggerUpgradeConfirmation(plan.id)}
                                            >
                                                <div className="flex justify-between items-center mb-1">
                                                    <div className="flex items-center gap-2">
                                                        {plan.id === 'minutes_pack' && <Zap className="h-4 w-4 text-amber-500 fill-amber-500" />}
                                                        {plan.id === 'simulator_pack' && <Crown className="h-4 w-4 text-blue-500 fill-blue-500" />}
                                                        {plan.id === 'agenda_manager_pack' && <Crown className="h-4 w-4 text-emerald-500 fill-emerald-500" />}
                                                        {plan.id === 'on_boarding_pack' && <Crown className="h-4 w-4 text-purple-600 fill-purple-600" />}
                                                        <h3 className="font-bold text-base text-slate-900">{plan.name}</h3>
                                                    </div>
                                                    <span className="font-bold text-lg text-slate-900">
                                                        {plan.priceMonthly}€
                                                        <span className="text-xs font-normal text-slate-500">{t('selection.oneTime')}</span>
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-500 mb-3">{plan.description}</p>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="w-full hover:bg-slate-50"
                                                    onClick={(e) => { e.stopPropagation(); triggerUpgradeConfirmation(plan.id); }}
                                                    disabled={loading}
                                                >
                                                    {loading ? t('selection.buttons.processing') : t('selection.buttons.buyPack')}
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <Button variant="ghost" className="w-full" onClick={() => initialViewPlans ? onClose() : setShowPlans(false)}>
                                {initialViewPlans ? t('buttons.cancel') : t('buttons.back')}
                            </Button>
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
