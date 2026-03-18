import { Head, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem, SharedData } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
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
            <Head title="Dashboard" />
            <style>{`
                @keyframes gradient-shift {
                    0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0) rotate(0deg); }
                    50% { transform: translateY(-20px) rotate(5deg); }
                }
                .gradient-text {
                    background: linear-gradient(135deg, #667eea, #764ba2, #f093fb, #f5576c, #667eea);
                    background-size: 300% 300%;
                    animation: gradient-shift 4s ease infinite;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }
                .fade-in-1 { animation: fade-in-up 0.8s ease forwards; }
                .fade-in-2 { animation: fade-in-up 0.8s ease 0.2s forwards; opacity: 0; }
                .fade-in-3 { animation: fade-in-up 0.8s ease 0.4s forwards; opacity: 0; }
                .float-1 { animation: float 6s ease-in-out infinite; }
                .float-2 { animation: float 8s ease-in-out 1s infinite; }
                .float-3 { animation: float 7s ease-in-out 2s infinite; }
            `}</style>
            <div className="relative flex h-full flex-1 flex-col items-center justify-center overflow-hidden p-8">
                {/* Decorative floating shapes */}
                <div className="float-1 absolute top-16 left-16 h-20 w-20 rounded-full bg-purple-500/10 blur-xl" />
                <div className="float-2 absolute right-20 bottom-20 h-32 w-32 rounded-full bg-pink-500/10 blur-xl" />
                <div className="float-3 absolute top-1/3 right-1/4 h-16 w-16 rounded-full bg-indigo-500/10 blur-xl" />

                <div className="relative z-10 text-center">
                    <h1 className="gradient-text fade-in-1 text-6xl font-bold tracking-tight md:text-8xl">
                        Hola, {firstName}!
                    </h1>

                    <p className="fade-in-2 mt-6 text-xl text-neutral-500 dark:text-neutral-400 md:text-2xl">
                        Bienvenido a Nekarzaria
                    </p>

                    <p className="fade-in-3 mt-4 text-sm capitalize text-neutral-400 dark:text-neutral-500">
                        {dateString}
                    </p>
                </div>
            </div>
        </AppLayout>
    );
}
