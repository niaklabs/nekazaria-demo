import { usePage } from '@inertiajs/react';

export function useTranslation() {
    const { translations, locale } = usePage().props;

    function t(key: string, replacements?: Record<string, string>): string {
        let text = translations[key] ?? key;

        if (replacements) {
            Object.entries(replacements).forEach(([k, v]) => {
                text = text.replace(`:${k}`, v);
            });
        }

        return text;
    }

    return { t, locale };
}
