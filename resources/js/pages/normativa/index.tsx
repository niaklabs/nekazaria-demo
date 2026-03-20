import { Head, Link, router } from '@inertiajs/react';
import { AlertTriangle, Bell, CheckCircle2, ChevronRight, Info, ShieldAlert, Syringe } from 'lucide-react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface Regulation {
    id: number;
    type: string;
    severity: 'urgent' | 'warning' | 'info';
    title: string;
    description: string;
    action_label: string | null;
    action_url: string | null;
    due_date: string | null;
    is_read: boolean;
    is_resolved: boolean;
    created_at: string;
}

interface Props {
    regulations: Regulation[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Mi Explotación', href: '/dashboard' },
    { title: 'Normativa', href: '/normativa' },
];

const severityConfig = {
    urgent: {
        icon: ShieldAlert,
        label: 'Urgente',
        badgeBg: 'bg-[#E53935]',
        badgeText: 'text-white',
        borderColor: 'border-l-[#E53935]',
        countBg: 'bg-[#E53935]',
    },
    warning: {
        icon: AlertTriangle,
        label: 'Atención',
        badgeBg: 'bg-[#FFF3E0]',
        badgeText: 'text-[#E65100]',
        borderColor: 'border-l-[#E65100]',
        countBg: 'bg-[#E65100]',
    },
    info: {
        icon: Info,
        label: 'Información',
        badgeBg: 'bg-[#E3F2FD]',
        badgeText: 'text-[#1565C0]',
        borderColor: 'border-l-[#1565C0]',
        countBg: 'bg-[#1565C0]',
    },
};

function timeAgo(dateString: string): string {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'hace un momento';
    if (diffHours < 24) return `hace ${diffHours}h`;
    if (diffDays === 1) return 'ayer';
    return `hace ${diffDays} días`;
}

function daysUntil(dateString: string): string | null {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = date.getTime() - now.getTime();
    const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (days < 0) return 'Vencido';
    if (days === 0) return 'Hoy';
    if (days === 1) return 'Mañana';
    return `Quedan ${days} días`;
}

function AlertCard({ regulation }: { regulation: Regulation }) {
    const config = severityConfig[regulation.severity];
    const Icon = config.icon;

    const markResolved = () => {
        router.post(`/api/regulations/${regulation.id}/resolve`, {}, { preserveScroll: true });
    };

    return (
        <div
            className={`border-2 border-black border-l-4 ${config.borderColor} ${!regulation.is_read ? 'bg-[#FAFAFA]' : 'bg-white'} w-full`}
        >
            <div className="flex flex-col gap-3 p-4">
                <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-bold ${config.badgeBg} ${config.badgeText}`}>
                        <Icon className="size-3" />
                        {config.label}
                    </span>
                    <span className="text-xs text-[#757575]">{timeAgo(regulation.created_at)}</span>
                </div>

                <h3 className="text-sm font-bold">{regulation.title}</h3>
                <p className="text-sm leading-[1.4] text-[#757575]">{regulation.description}</p>

                {regulation.due_date && (
                    <p className="text-xs font-semibold text-[#757575]">
                        Vence: {new Date(regulation.due_date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                        {' · '}
                        <span className={regulation.severity === 'urgent' ? 'text-[#E53935]' : ''}>{daysUntil(regulation.due_date)}</span>
                    </p>
                )}

                <div className="flex items-center gap-2">
                    {regulation.action_url && regulation.action_label && (
                        <Link
                            href={regulation.action_url}
                            className="inline-flex items-center gap-1 bg-[#E53935] px-3 min-h-[44px] text-xs font-bold text-white md:min-h-0 md:py-2"
                        >
                            {regulation.action_label}
                        </Link>
                    )}
                    {!regulation.is_resolved && (
                        <button
                            onClick={markResolved}
                            className="inline-flex items-center gap-1 border-2 border-black px-3 min-h-[44px] text-xs font-semibold md:min-h-0 md:py-2"
                        >
                            <CheckCircle2 className="size-3" />
                            Resolver
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

type Filter = 'all' | 'pending' | 'resolved';

export default function NormativaIndex({ regulations }: Props) {
    const [filter, setFilter] = useState<Filter>('all');

    const filtered = regulations.filter((r) => {
        if (filter === 'pending') return !r.is_resolved;
        if (filter === 'resolved') return r.is_resolved;
        return true;
    });

    const urgentCount = regulations.filter((r) => r.severity === 'urgent' && !r.is_resolved).length;
    const warningCount = regulations.filter((r) => r.severity === 'warning' && !r.is_resolved).length;
    const infoCount = regulations.filter((r) => r.severity === 'info' && !r.is_resolved).length;

    const filters: { key: Filter; label: string }[] = [
        { key: 'all', label: 'Todas' },
        { key: 'pending', label: 'Pendientes' },
        { key: 'resolved', label: 'Resueltas' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Normativa" />
            <div className="flex flex-col gap-5 p-6">
                <h1 className="text-2xl font-bold">Mis Alertas y Normativa</h1>

                <Link
                    href="/normativa/campanas"
                    className="flex items-center justify-between border-2 border-black bg-white p-4 active:bg-[#F5F5F5]"
                >
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center bg-[#FFEBEE]">
                            <Syringe className="size-5 text-[#E53935]" />
                        </div>
                        <div>
                            <p className="text-sm font-bold">Campañas Sanitarias</p>
                            <p className="text-xs text-[#757575]">Ver estado de campañas y animales inmovilizados</p>
                        </div>
                    </div>
                    <ChevronRight className="size-5 text-[#757575]" />
                </Link>

                <div className="flex items-center gap-3">
                    {urgentCount > 0 && (
                        <span className="inline-flex items-center gap-1 bg-[#E53935] px-2 py-1 text-xs font-bold text-white">
                            {urgentCount} urgente{urgentCount > 1 ? 's' : ''}
                        </span>
                    )}
                    {warningCount > 0 && (
                        <span className="inline-flex items-center gap-1 bg-[#FFF3E0] px-2 py-1 text-xs font-bold text-[#E65100]">
                            {warningCount} atención
                        </span>
                    )}
                    {infoCount > 0 && (
                        <span className="inline-flex items-center gap-1 bg-[#E3F2FD] px-2 py-1 text-xs font-bold text-[#1565C0]">
                            {infoCount} info
                        </span>
                    )}
                </div>

                <div className="flex gap-0 border-2 border-black">
                    {filters.map((f) => (
                        <button
                            key={f.key}
                            onClick={() => setFilter(f.key)}
                            className={`flex-1 min-h-[44px] text-xs font-bold md:min-h-0 md:py-2 ${filter === f.key ? 'bg-black text-white' : 'bg-white text-black'}`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>

                {filtered.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 py-16 text-center">
                        <CheckCircle2 className="size-12 text-[#2E7D32]" />
                        <p className="text-lg font-bold">Todo al día</p>
                        <p className="text-sm text-[#757575]">No tienes alertas pendientes. Te avisaremos cuando haya algo nuevo.</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {filtered.map((regulation) => (
                            <AlertCard key={regulation.id} regulation={regulation} />
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
