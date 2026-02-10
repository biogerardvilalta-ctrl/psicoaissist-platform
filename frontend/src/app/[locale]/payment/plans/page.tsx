'use client';

import { Check, X, Star, Loader2, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from '@/navigation';
import { usePayments } from '@/hooks/usePayments';
import { useAuth } from '@/contexts/auth-context';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';

const plansConfig = [
    {
        id: 'basic',
        price: 29,
        popular: false,
        color: 'border-slate-200',
        buttonColor: 'bg-white hover:bg-slate-50 text-slate-900 border border-slate-200',
    },
    {
        id: 'pro',
        price: 59,
        popular: true,
        color: 'border-blue-500 ring-2 ring-blue-500 relative',
        buttonColor: 'bg-blue-600 hover:bg-blue-700 text-white',
    },
    {
        id: 'premium',
        price: 99,
        popular: false,
        color: 'border-purple-500',
        buttonColor: 'bg-purple-600 hover:bg-purple-700 text-white',
    },
];

export default function PlansPage() {
    const t = useTranslations('Landing.Pricing');
    const tAuth = useTranslations('Dashboard.Header'); // Reuse logout text
    const [billingInterval, setBillingInterval] = useState<'month' | 'year'>('month');
    const [isClient, setIsClient] = useState(false);
    const { createCheckoutSession, loading } = usePayments();
    const { user, logout } = useAuth();
    const router = useRouter();

    useEffect(() => {
        setIsClient(true);
    }, []);

    const handleSelectPlan = async (planId: string) => {
        if (!user) return;
        try {
            await createCheckoutSession({
                plan: planId as any,
                interval: billingInterval,
                customerId: user.id // Pass user ID just in case, though backend uses auth user
            });
        } catch (error) {
            console.error('Checkout error:', error);
        }
    };

    const handleLogout = async () => {
        await logout();
        router.push('/auth/login');
    };

    if (!isClient) return null;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">

            <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">

                {/* Header with Logout */}
                <div className="absolute top-4 right-4">
                    <Button variant="ghost" onClick={handleLogout} className="text-gray-500">
                        <LogOut className="w-4 h-4 mr-2" />
                        {tAuth('logout')}
                    </Button>
                </div>

                <div className="text-center mb-12 mt-8">
                    <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">
                        {/* Hardcoded title for now to avoid missing keys, or reuse */}
                        Completa tu Suscripción
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Para activar tu cuenta y acceder al panel, por favor selecciona uno de nuestros planes.
                    </p>
                </div>

                {/* Billing toggle */}
                <div className="mb-12 flex justify-center">
                    <div className="relative bg-white p-1 rounded-lg border border-gray-200 flex">
                        <button
                            onClick={() => setBillingInterval('month')}
                            className={`relative px-4 py-2 text-sm font-medium rounded-md transition-colors ${billingInterval === 'month'
                                ? 'bg-gray-100 text-gray-900 border border-gray-200 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            {t('billing.monthly')}
                        </button>
                        <button
                            onClick={() => setBillingInterval('year')}
                            className={`relative px-4 py-2 text-sm font-medium rounded-md transition-colors ${billingInterval === 'year'
                                ? 'bg-gray-100 text-gray-900 border border-gray-200 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            {t('billing.yearly')} <span className="text-green-600 font-bold text-xs ml-1">{t('billing.save')}</span>
                        </button>
                    </div>
                </div>

                {/* Plans Grid */}
                <div className="grid grid-cols-1 gap-8 md:grid-cols-3 max-w-5xl mx-auto">
                    {plansConfig.map((plan) => {
                        const isAnnual = billingInterval === 'year';
                        const price = typeof plan.price === 'number'
                            ? (isAnnual ? Math.round(plan.price * 10 / 12) : plan.price)
                            : plan.price;

                        const features = t.raw(`plans.${plan.id}.features`) as string[];
                        const limitations = (t.raw(`plans.${plan.id}`) as any).limitations as string[] || [];

                        return (
                            <div
                                key={plan.id}
                                className={`relative bg-white rounded-2xl shadow-sm ${plan.color} border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 flex flex-col`}
                            >
                                {/* Popular badge */}
                                {plan.popular && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-full text-center">
                                        <div className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                                            <Star className="h-4 w-4 mr-1" />
                                            Más popular
                                        </div>
                                    </div>
                                )}

                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="text-center mb-6">
                                        <h3 className="text-xl font-bold text-gray-900">{t(`plans.${plan.id}.name`)}</h3>
                                        <p className="mt-2 text-xs text-gray-600 h-10">{t(`plans.${plan.id}.description`)}</p>
                                        <div className="mt-4 flex flex-col items-center justify-center h-16">
                                            <div className="flex items-baseline">
                                                <span className="text-3xl font-bold text-gray-900">€{price}</span>
                                                <span className="text-gray-600 text-sm">/mes</span>
                                            </div>
                                            {isAnnual && (
                                                <span className="text-xs text-green-600 font-medium mt-1">
                                                    Facturado €{plan.price * 10}/año
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex-1">
                                        <ul className="space-y-3 mb-6">
                                            {features.map((feature, featureIndex) => (
                                                <li key={featureIndex} className="flex items-start">
                                                    <Check className="flex-shrink-0 h-4 w-4 text-green-500 mt-0.5" />
                                                    <span className="ml-3 text-xs text-gray-600">{feature}</span>
                                                </li>
                                            ))}
                                            {limitations.map((limitation, limitationIndex) => (
                                                <li key={`limitation-${limitationIndex}`} className="flex items-start">
                                                    <X className="flex-shrink-0 h-4 w-4 text-gray-400 mt-0.5" />
                                                    <span className="ml-3 text-xs text-gray-400">{limitation}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="mt-auto">
                                        <button
                                            onClick={() => handleSelectPlan(plan.id)}
                                            disabled={loading}
                                            className={`w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${plan.buttonColor}`}
                                        >
                                            {loading ? (
                                                <>
                                                    <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                                                    ...
                                                </>
                                            ) : (
                                                "Seleccionar Plan" // Hardcoded for now
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
