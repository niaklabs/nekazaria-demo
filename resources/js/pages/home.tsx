import { Head, Link, usePage } from '@inertiajs/react';
import { BarChart3, ChevronRight, FileText, Search, TriangleAlert } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';

type HomeProps = {
    firstName: string;
};

const actionCards = [
    {
        label: 'Ver estado de mi explotación',
        icon: BarChart3,
        href: '/dashboard',
        disabled: false,
    },
    {
        label: 'Consultar censo actual',
        icon: Search,
        href: '#',
        disabled: true,
    },
    {
        label: 'Revisar alertas pendientes',
        icon: TriangleAlert,
        href: '/normativa',
        disabled: false,
    },
    {
        label: 'Iniciar un trámite',
        icon: FileText,
        href: '/nacimientos/crear',
        disabled: false,
    },
];

const quickActions = [
    {
        label: 'Ver estado de mi explotación',
        icon: BarChart3,
        href: '/dashboard',
        disabled: false,
    },
    {
        label: 'Consultar censo actual',
        icon: Search,
        href: '#',
        disabled: true,
    },
    {
        label: 'Revisar alertas pendientes',
        icon: TriangleAlert,
        href: '/normativa',
        disabled: false,
    },
];

export default function Home() {
    const { firstName } = usePage<{ firstName: string }>().props;

    return (
        <AppLayout>
            <Head title="Inicio" />
            <div className="flex flex-col gap-6 p-6">
                {/* Header Section */}
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-2xl font-bold tracking-tight">Hola {firstName} !</h1>
                        <p className="text-sm text-neutral-500">¿En qué puedo ayudarte hoy?</p>
                    </div>
                    <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-red-50">
                        <span className="text-3xl">🐂</span>
                    </div>
                </div>

                {/* Action Cards Grid */}
                <div className="grid grid-cols-2 gap-4">
                    {actionCards.map((card) => {
                        const Icon = card.icon;
                        const content = (
                            <div
                                className={`flex flex-col gap-4 rounded-none border-2 border-black p-5 transition-colors ${
                                    card.disabled
                                        ? 'cursor-not-allowed border-neutral-300 bg-neutral-50 opacity-50'
                                        : 'bg-white hover:bg-neutral-50'
                                }`}
                            >
                                <div className="flex h-12 w-12 items-center justify-center bg-[#E53935]">
                                    <Icon className="h-6 w-6 text-white" />
                                </div>
                                <span className="text-sm font-bold leading-tight">{card.label}</span>
                            </div>
                        );

                        if (card.disabled) {
                            return <div key={card.label}>{content}</div>;
                        }

                        return (
                            <Link key={card.label} href={card.href} className="block">
                                {content}
                            </Link>
                        );
                    })}
                </div>

                {/* Divider */}
                <div className="h-0.5 bg-black" />

                {/* Quick Action List */}
                <div className="flex flex-col">
                    {quickActions.map((action, index) => {
                        const Icon = action.icon;
                        const isLast = index === quickActions.length - 1;

                        const rowContent = (
                            <div
                                className={`flex items-center gap-3.5 py-4 ${
                                    !isLast ? 'border-b-2 border-black' : ''
                                } ${action.disabled ? 'cursor-not-allowed opacity-50' : ''}`}
                            >
                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E53935]">
                                    <Icon className="h-5 w-5 text-white" />
                                </div>
                                <span className="flex-1 text-sm font-semibold">{action.label}</span>
                                <ChevronRight className="h-5 w-5 text-neutral-400" />
                            </div>
                        );

                        if (action.disabled) {
                            return <div key={action.label}>{rowContent}</div>;
                        }

                        return (
                            <Link key={action.label} href={action.href} className="block">
                                {rowContent}
                            </Link>
                        );
                    })}
                </div>
            </div>
        </AppLayout>
    );
}
