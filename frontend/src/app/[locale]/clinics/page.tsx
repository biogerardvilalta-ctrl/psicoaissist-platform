import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Building2, ShieldCheck, GraduationCap, Network, Users, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function ClinicsPage() {
    const t = useTranslations('Clinics');
    return (
        <div className="bg-white">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-slate-900 pt-24 pb-32">
                <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10"></div>
                <div className="relative mx-auto max-w-7xl px-6 lg:px-8 text-center">
                    <div className="inline-flex items-center rounded-full bg-blue-500/10 px-3 py-1 text-sm font-medium text-blue-400 ring-1 ring-inset ring-blue-500/20 mb-8">
                        <span className="flex h-2 w-2 rounded-full bg-blue-400 mr-2"></span>
                        {t('Hero.badge')}
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl mb-6">
                        {t.rich('Hero.title', {
                            highlight: (chunks) => <span className="text-blue-500">{chunks}</span>
                        })}
                    </h1>
                    <p className="mt-6 text-lg leading-8 text-slate-300 max-w-2xl mx-auto">
                        {t('Hero.description')}
                    </p>
                    <div className="mt-10 flex items-center justify-center gap-x-6">
                        <Link href="/contact">
                            <Button size="lg" className="bg-blue-600 hover:bg-blue-500 text-white h-12 px-8 text-base">
                                {t('Hero.cta')}
                            </Button>
                        </Link>
                        <Link href="#features" className="text-sm font-semibold leading-6 text-white hover:text-blue-400 transition-colors">
                            {t('Hero.more')} <ArrowRight className="inline-block w-4 h-4 ml-1" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Trust Badges (Placeholders) - HIDDEN to avoid misleading advertising
            <section className="py-10 bg-slate-50 border-b border-gray-200">
                <div className="mx-auto max-w-7xl px-6 text-center">
                    <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-6">
                        Potenciando equipos clínicos en
                    </p>
                    <div className="flex justify-center gap-12 opacity-50 grayscale">
                        <div className="text-xl font-bold text-slate-700">HealthCorp</div>
                        <div className="text-xl font-bold text-slate-700">UniClinic</div>
                        <div className="text-xl font-bold text-slate-700">MentalCare Grp</div>
                        <div className="text-xl font-bold text-slate-700">Sanitas (Demo)</div>
                    </div>
                </div>
            </section>
            */}

            {/* Main Value Props */}
            <section id="features" className="py-24 sm:py-32">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl lg:text-center">
                        <h2 className="text-base font-semibold leading-7 text-blue-600">Enterprise Grade</h2>
                        <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                            {t('Features.mainTitle')}
                        </p>
                        <p className="mt-6 text-lg leading-8 text-gray-600">
                            {t('Features.mainDescription')}
                        </p>
                    </div>

                    <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
                        <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
                            {/* Feature 1 */}
                            <div className="flex flex-col">
                                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                                    <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-blue-600">
                                        <GraduationCap className="h-6 w-6 text-white" aria-hidden="true" />
                                    </div>
                                    {t('Features.trainingTitle')}
                                </dt>
                                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                                    <p className="flex-auto">
                                        {t.rich('Features.trainingDesc', {
                                            strong: (chunks) => <strong>{chunks}</strong>
                                        })}
                                    </p>
                                </dd>
                            </div>

                            {/* Feature 2 */}
                            <div className="flex flex-col">
                                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                                    <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-blue-600">
                                        <ShieldCheck className="h-6 w-6 text-white" aria-hidden="true" />
                                    </div>
                                    {t('Features.complianceTitle')}
                                </dt>
                                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                                    <p className="flex-auto">
                                        {t('Features.complianceDesc')}
                                    </p>
                                </dd>
                            </div>

                            {/* Feature 3 */}
                            <div className="flex flex-col">
                                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                                    <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-blue-600">
                                        <Network className="h-6 w-6 text-white" aria-hidden="true" />
                                    </div>
                                    {t('Features.apiTitle')}
                                </dt>
                                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                                    <p className="flex-auto">
                                        {t('Features.apiDesc')}
                                    </p>
                                </dd>
                            </div>
                        </dl>
                    </div>
                </div>
            </section>

            {/* Agenda Manager & Groups Section */}
            <section className="py-24 bg-slate-50">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
                        {/* Text Content */}
                        <div>
                            <div className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-600 ring-1 ring-inset ring-indigo-500/20 mb-6">
                                <Users className="w-4 h-4 mr-2" />
                                {t('Agenda.badge')}
                            </div>
                            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-6">
                                {t('Agenda.title')} <br />
                                {t('Agenda.subtitle')}
                            </h2>
                            <p className="text-lg text-gray-600 mb-8">
                                {t('Agenda.description')}
                            </p>

                            <div className="space-y-8">
                                <div className="flex gap-4">
                                    <div className="flex-none p-3 bg-white rounded-xl shadow-sm border border-gray-100 h-fit">
                                        <CheckCircle2 className="w-6 h-6 text-indigo-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 text-lg">{t('Agenda.accessTitle')}</h3>
                                        <p className="text-gray-600 mt-2">
                                            {t.rich('Agenda.accessDesc', {
                                                strong: (chunks) => <strong>{chunks}</strong>
                                            })}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex-none p-3 bg-white rounded-xl shadow-sm border border-gray-100 h-fit">
                                        <Users className="w-6 h-6 text-indigo-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 text-lg">{t('Agenda.groupsTitle')}</h3>
                                        <p className="text-gray-600 mt-2">
                                            {t('Agenda.groupsDesc')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Minimal Visual: Agenda Manager UI */}
                        <div className="mt-12 lg:mt-0 relative">
                            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-3xl -z-10" />
                            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                                <div className="bg-gray-50 border-b border-gray-200 p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-red-400" />
                                        <div className="w-3 h-3 rounded-full bg-yellow-400" />
                                        <div className="w-3 h-3 rounded-full bg-green-400" />
                                    </div>
                                    <div className="text-xs font-mono text-gray-400">dashboard/agenda-manager</div>
                                </div>
                                <div className="p-6 space-y-6">
                                    {/* Mock Filter Bar */}
                                    <div className="flex gap-3 pb-4 border-b border-gray-100">
                                        <div className="px-3 py-1 bg-indigo-50 text-indigo-700 text-sm font-medium rounded-md">
                                            Grupo: Unidad Infantil
                                        </div>
                                        <div className="px-3 py-1 bg-white border border-gray-200 text-gray-500 text-sm rounded-md">
                                            Vista: Semanal
                                        </div>
                                    </div>

                                    {/* Mock Calendar Grid */}
                                    <div className="grid grid-cols-2 gap-4">
                                        {/* Col 1 */}
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">DR</div>
                                                <span className="text-sm font-medium">Dr. Ramirez</span>
                                            </div>
                                            <div className="p-2 bg-blue-50 border-l-2 border-blue-500 rounded text-xs">
                                                <span className="font-bold block">10:00 - Paciente J.M.</span>
                                                <span className="text-blue-600/70">Confirmado</span>
                                            </div>
                                            <div className="p-2 bg-gray-50 border-l-2 border-gray-300 rounded text-xs text-gray-400">
                                                <span className="font-bold block">11:00 - Bloqueado</span>
                                                <span>Reunión Clínica</span>
                                            </div>
                                        </div>
                                        {/* Col 2 */}
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-bold">PS</div>
                                                <span className="text-sm font-medium">Psic. Sarah M.</span>
                                            </div>
                                            <div className="p-2 bg-purple-50 border-l-2 border-purple-500 rounded text-xs">
                                                <span className="font-bold block">10:00 - Primera Visita</span>
                                                <span className="text-purple-600/70">Pendiente Pago</span>
                                            </div>
                                            <div className="p-2 bg-purple-50 border-l-2 border-purple-500 rounded text-xs">
                                                <span className="font-bold block">11:00 - Terapia Grupo</span>
                                                <span className="text-purple-600/70">Sala 2</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <section className="relative bg-slate-900 py-24 isolate overflow-hidden">
                <div className="mx-auto max-w-7xl px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-16">
                    <div className="flex-1">
                        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl mb-6">
                            {t('Simulator.title')}
                        </h2>
                        <p className="text-lg text-slate-300 mb-8">
                            {t('Simulator.description')}
                        </p>
                        <ul className="space-y-4 mb-10">
                            {[
                                t('Simulator.feature1'),
                                t('Simulator.feature2'),
                                t('Simulator.feature3')
                            ].map((item, i) => (
                                <li key={i} className="flex items-center text-slate-200">
                                    <CheckCircle2 className="w-5 h-5 text-green-400 mr-3" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                        <Link href="/contact">
                            <Button className="bg-white text-slate-900 hover:bg-slate-100">
                                {t('Simulator.cta')}
                            </Button>
                        </Link>
                    </div>
                    {/* Visual Abstracto del Simulador */}
                    <div className="flex-1 relative">
                        <div className="absolute inset-0 bg-blue-500 blur-[100px] opacity-20"></div>
                        <div className="relative bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-2xl">
                            <div className="space-y-4">
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-full bg-slate-600"></div>
                                    <div className="flex-1 bg-slate-700 h-16 rounded-lg rounded-tl-none p-3 text-slate-300 text-sm">
                                        "No sé si quiero volver la semana que viene. Siento que esto no avanza..." <span className="text-xs text-red-400 block mt-1">(Resistencia detectada)</span>
                                    </div>
                                </div>
                                <div className="flex gap-4 flex-row-reverse">
                                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs">PSI</div>
                                    <div className="flex-1 bg-blue-900/50 border border-blue-500/30 h-16 rounded-lg rounded-tr-none p-3 text-blue-100 text-sm">
                                        "Entiendo tu frustración. ¿Podrías decirme qué expectativas tenías para hoy que sientes que no hemos cumplido?"
                                    </div>
                                </div>
                                <div className="mt-4 p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
                                    <div className="text-xs font-bold text-green-400 uppercase mb-1">Feedback del Supervisor IA</div>
                                    <p className="text-xs text-green-200">Excelente validación emocional. Has utilizado una pregunta abierta para explorar la resistencia. Empatía: 9/10.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Final */}
            <section className="bg-white py-24">
                <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                        {t('CTA.title')}
                    </h2>
                    <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-600">
                        {t('CTA.description')}
                    </p>
                    <div className="mt-10 flex items-center justify-center gap-x-6">
                        <Link href="/contact">
                            <Button size="lg" className="bg-blue-600 hover:bg-blue-500 h-14 px-8 text-lg">
                                {t('CTA.button')}
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
