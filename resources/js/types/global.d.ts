import type { Auth } from '@/types/auth';

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            auth: Auth;
            sidebarOpen: boolean;
            locale: string;
            translations: Record<string, string>;
            flash: {
                success?: {
                    message: string;
                    reference_code: string;
                    calves: Array<{ name: string | null; sex: string; crotal: string }>;
                    new_capacity: number;
                } | null;
            };
            [key: string]: unknown;
        };
    }
}
