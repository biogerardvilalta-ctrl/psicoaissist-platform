import { notFound } from 'next/navigation';
// Force reload messages
import { getRequestConfig } from 'next-intl/server';
import { routing } from './navigation';

export default getRequestConfig(async ({ requestLocale }) => {
    // This typically corresponds to the `[locale]` segment
    let locale = await requestLocale;

    // Validate that the incoming `locale` parameter is valid
    if (!locale || !routing.locales.includes(locale as any)) {
        notFound();
    }

    return {
        locale,
        messages: (await import(`../messages/${locale}.json`)).default
    };
});
