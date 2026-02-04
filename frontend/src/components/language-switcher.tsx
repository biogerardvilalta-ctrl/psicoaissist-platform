'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/navigation';
import { useTransition } from 'react';
import { Globe, Check } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

import { useAuth } from '@/contexts/auth-context';
import { AuthAPI } from '@/lib/auth-api';

export default function LanguageSwitcher() {
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();
    const [isPending, startTransition] = useTransition();
    const { user, updateUser } = useAuth();

    const onSelectChange = async (nextLocale: string) => {
        // Optimistic sync: Update AI language if sync is enabled
        // Default to TRUE if undefined
        const isSyncEnabled = user?.brandingConfig?.syncAiLanguage !== false;

        if (user && isSyncEnabled && user.preferredLanguage !== nextLocale) {
            // Non-blocking update
            AuthAPI.updateProfile({ preferredLanguage: nextLocale })
                .then(updatedUser => updateUser(updatedUser))
                .catch(err => console.error('Failed to sync AI language', err));
        }

        startTransition(() => {
            router.replace(pathname, { locale: nextLocale });
        });
    };

    // Actually, using small accurate SVGs is better.
    const Flags = {
        es: (
            <svg className="w-5 h-3.5 object-cover rounded-sm shadow-sm" viewBox="0 0 640 480">
                <path fill="#c60b1e" d="M0 0h640v480H0z" />
                <path fill="#ffc400" d="M0 120h640v240H0z" />
            </svg>
        ),
        ca: (
            <svg className="w-5 h-3.5 object-cover rounded-sm shadow-sm" viewBox="0 0 640 480">
                <path fill="#ffc400" d="M0 0h640v480H0z" />
                <path fill="#c60b1e" d="M0 53.3h640v53.4H0zm0 106.6h640v53.4H0zm0 106.7h640v53.3H0zm0 106.7h640v53.3H0z" />
            </svg>
        ),
        en: (
            <svg className="w-5 h-3.5 object-cover rounded-sm shadow-sm" viewBox="0 0 640 480">
                <path fill="#bd3d44" d="M0 0h640v480H0z" />
                <path fill="#fff" d="M0 36.9h640v36.9H0zm0 73.9h640v36.9H0zm0 73.8h640v36.9H0zm0 73.9h640v36.9H0zm0 73.8h640v36.9H0zm0 73.9h640v36.9H0z" />
                <path fill="#192f5d" d="M0 0h256v258.5H0z" />
                <g fill="#fff">
                    {/* Just a few dots to represent stars for this small size */}
                    <circle cx="30" cy="30" r="12" />
                    <circle cx="90" cy="30" r="12" />
                    <circle cx="150" cy="30" r="12" />
                    <circle cx="210" cy="30" r="12" />
                    <circle cx="60" cy="80" r="12" />
                    <circle cx="120" cy="80" r="12" />
                    <circle cx="180" cy="80" r="12" />
                    <circle cx="180" cy="80" r="12" />
                    <circle cx="180" cy="80" r="12" />
                </g>
            </svg>
        )
    }

    const languages = {
        es: { label: 'Español', flag: Flags.es },
        ca: { label: 'Català', flag: Flags.ca },
        en: { label: 'English', flag: Flags.en },
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="w-9 px-0">
                    <Globe className="h-4 w-4" />
                    <span className="sr-only">Cambiar idioma</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {Object.entries(languages).map(([key, { label, flag }]) => (
                    <DropdownMenuItem
                        key={key}
                        onClick={() => onSelectChange(key)}
                        className="flex items-center justify-between gap-4 cursor-pointer"
                    >
                        <span className="flex items-center gap-2">
                            <span className="flex h-4 w-6 items-center overflow-hidden rounded-[2px]">
                                {flag}
                            </span>
                            <span>{label}</span>
                        </span>
                        {locale === key && <Check className="h-4 w-4" />}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
