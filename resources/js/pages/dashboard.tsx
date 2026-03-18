import { Head, Link, usePage } from '@inertiajs/react';
import { Baby, Bell, Camera, MessageCircle } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem, SharedData } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Mi Explotación',
        href: dashboard(),
    },
];

const quickActions = [
    {
        title: 'Comunicar Nacimiento',
        description: 'Registrar el nacimiento de un nuevo animal',
        href: '/nacimientos/crear',
        icon: Baby,
    },
    {
        title: 'Escanear Crotal',
        description: 'Identificar un animal con la cámara',
        href: '/scanner',
        icon: Camera,
    },
    {
        title: 'Normativa',
        description: 'Alertas y plazos pendientes',
        href: '/normativa',
        icon: Bell,
    },
    {
        title: 'NekazarIA Chat',
        description: 'Pregunta lo que necesites',
        href: '/chat',
        icon: MessageCircle,
    },
];

export default function Dashboard() {
    const { auth } = usePage<SharedData>().props;
    const firstName = auth.user.name.split(' ')[0];

    const now = new Date();
    const dateString = now.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Mi Explotación" />
            <div className="flex flex-col gap-6 p-6">
                <div>
                    <h1 className="text-2xl font-bold">Hola, {firstName}!</h1>
                    <p className="text-sm font-medium text-muted-foreground capitalize">{dateString}</p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {quickActions.map((action) => (
                        <Link
                            key={action.href}
                            href={action.href}
                            className="flex items-start gap-4 border-2 border-black p-4 transition-colors hover:bg-secondary"
                        >
                            <div className="flex size-10 shrink-0 items-center justify-center bg-primary text-primary-foreground">
                                <action.icon className="size-5" />
                            </div>
                            <div>
                                <p className="text-sm font-bold">{action.title}</p>
                                <p className="text-xs text-muted-foreground">{action.description}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
