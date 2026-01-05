'use client';

import { useState, useEffect } from 'react';
import { AdminAPI, AdminStats, AdminPlan } from '@/lib/admin-api';
import { DollarSign, CreditCard, TrendingUp, CheckCircle, Package } from 'lucide-react';
import { useAdminStats } from '@/hooks/useAdmin';

export default function AdminBillingPage() {
    const { stats, loading: statsLoading } = useAdminStats();
    const [plans, setPlans] = useState<AdminPlan[]>([]);
    const [plansLoading, setPlansLoading] = useState(true);

    useEffect(() => {
        loadPlans();
    }, []);

    const loadPlans = async () => {
        try {
            const data = await AdminAPI.getPlans();
            setPlans(data.plans);
        } catch (error) {
            console.error('Error loading plans:', error);
        } finally {
            setPlansLoading(false);
        }
    };

    const getPlanUserCount = (planType: string) => {
        if (!stats?.subscriptionStats) return 0;
        const planStats = stats.subscriptionStats[planType];
        if (!planStats) return 0;
        // Sum active and others if needed, here just ACTIVE
        return planStats['ACTIVE'] || 0;
    };

    const calculatePlanRevenue = (planId: string) => {
        const plan = plans.find(p => p.id.toLowerCase() === planId.toLowerCase());
        const count = getPlanUserCount(planId.toUpperCase());
        return (plan?.price || 0) * count;
    };

    if (statsLoading && plansLoading) return <div className="p-8 text-center text-gray-500">Cargando facturación...</div>;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Facturación y Planes</h1>
                    <p className="mt-1 text-sm text-gray-600">Gestión de ingresos estimados y configuración de planes</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <div className="flex items-center">
                            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                                <DollarSign className="w-6 h-6" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">MRR Estimado</p>
                                <p className="text-2xl font-bold text-gray-900">€{stats?.totalRevenue || 0}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <div className="flex items-center">
                            <div className="p-3 rounded-full bg-green-100 text-green-600">
                                <CreditCard className="w-6 h-6" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Suscripciones Activas</p>
                                <p className="text-2xl font-bold text-gray-900">{stats?.activeSubscriptions || 0}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <div className="flex items-center">
                            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                                <TrendingUp className="w-6 h-6" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Nuevos (Mes)</p>
                                <p className="text-2xl font-bold text-gray-900">{stats?.recentSignups || 0}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <h2 className="text-lg font-semibold text-gray-900 mb-4">Desglose por Plan</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {plans.map((plan) => (
                        <div key={plan.id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                                        <p className="text-2xl font-bold text-gray-900 mt-2">
                                            €{plan.price} <span className="text-sm text-gray-500 font-normal">/ {plan.interval}</span>
                                        </p>
                                    </div>
                                    <div className="p-2 bg-gray-100 rounded-lg">
                                        <Package className="w-5 h-5 text-gray-600" />
                                    </div>
                                </div>

                                <div className="border-t border-gray-100 py-4 my-2">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm text-gray-600">Usuarios Activos:</span>
                                        <span className="font-semibold text-gray-900">{getPlanUserCount(plan.id.toUpperCase())}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Ingresos Estimados:</span>
                                        <span className="font-semibold text-green-600">€{calculatePlanRevenue(plan.id)}</span>
                                    </div>
                                </div>

                                <div className="space-y-2 mt-4">
                                    {plan.features.slice(0, 3).map((feature, idx) => (
                                        <div key={idx} className="flex items-center text-sm text-gray-500">
                                            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                                            {feature}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-gray-50 px-6 py-3 border-t text-right">
                                <button className="text-sm font-medium text-blue-600 hover:text-blue-800">
                                    Ver usuarios {plan.name} →
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
