import { Head, Link } from '@inertiajs/react';
import { Baby, CheckCircle2, List, FileText, ScanLine, Syringe, Timer, TriangleAlert } from 'lucide-react';
import { show as subExploitationShow } from '@/actions/App/Http/Controllers/SubExploitationController';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

type SubExploitation = {
    id: number;
    species: string;
    exploitation_type: string;
    zootechnical_classification: string;
    productive_system: string;
    current_capacity: number;
    max_capacity: number;
    sustainability: string | null;
    self_consumption: boolean;
    census_date: string | null;
    status: string | null;
};

type Semaforo = {
    capacity: 'ok' | 'warning' | 'danger';
    alerts: number;
    pending: number;
};

type Props = {
    subExploitation: SubExploitation;
    animalsCount: number;
    semaforo: Semaforo;
};

const speciesLabels: Record<string, string> = {
    bovine: 'Bovino',
    ovine: 'Ovino',
    caprine: 'Caprino',
    porcine: 'Porcino',
    equine: 'Equino',
};

const speciesHeaderColors: Record<string, string> = {
    bovine: 'bg-[#E53935]',
    ovine: 'bg-black',
    caprine: 'bg-black',
    porcine: 'bg-neutral-700',
    equine: 'bg-amber-900',
};

function getCapacityGroup(maxCapacity: number): string {
    if (maxCapacity <= 10) return 'Grupo I (1-10 UGM)';
    if (maxCapacity <= 40) return 'Grupo II (11-40 UGM)';
    if (maxCapacity <= 100) return 'Grupo III (41-100 UGM)';
    return 'Grupo IV (>100 UGM)';
}

function SemaforoIndicator({ status, alerts, pending }: Semaforo) {
    const capacityConfig = {
        ok: { bg: 'bg-[#2E7D32]', text: 'text-white', icon: CheckCircle2, label: 'Capacidad' },
        warning: { bg: 'bg-[#F9A825]', text: 'text-black', icon: TriangleAlert, label: 'Capacidad' },
        danger: { bg: 'bg-[#E53935]', text: 'text-white', icon: Timer, label: 'Capacidad' },
    };

    const cap = capacityConfig[status];
    const CapIcon = cap.icon;

    return (
        <div className="flex gap-2">
            <div className={`flex flex-1 flex-col items-center gap-1 rounded-sm ${cap.bg} px-3 py-3`}>
                <CapIcon className={`size-5 ${cap.text}`} />
                <span className={`text-[11px] font-semibold ${cap.text}`}>{cap.label}</span>
            </div>
            <div className="flex flex-1 flex-col items-center gap-1 rounded-sm bg-[#F9A825] px-3 py-3">
                <TriangleAlert className="size-5 text-black" />
                <span className="text-[11px] font-semibold text-black">
                    {alerts} {alerts === 1 ? 'Alerta' : 'Alertas'}
                </span>
            </div>
            <div className="flex flex-1 flex-col items-center gap-1 rounded-sm bg-[#E53935] px-3 py-3">
                <Timer className="size-5 text-white" />
                <span className="text-[11px] font-semibold text-white">
                    {pending} {pending === 1 ? 'Pendiente' : 'Pendientes'}
                </span>
            </div>
        </div>
    );
}

function DetailRow({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
    return (
        <div className="flex items-center justify-between px-4 py-3.5">
            <span className="text-[13px] font-medium text-[#757575]">{label}</span>
            <span className={`text-[13px] font-bold ${valueColor ?? 'text-black'}`}>{value}</span>
        </div>
    );
}

function DetailRowWithSub({ label, value, sub }: { label: string; value: string; sub: string }) {
    return (
        <div className="flex items-center justify-between px-4 py-3.5">
            <span className="text-[13px] font-medium text-[#757575]">{label}</span>
            <div className="flex flex-col items-end gap-0.5">
                <span className="text-[13px] font-bold text-black">{value}</span>
                <span className="text-[11px] font-medium text-[#BDBDBD]">{sub}</span>
            </div>
        </div>
    );
}

function ActionButton({ icon: Icon, label, href }: { icon: React.ComponentType<{ className?: string }>; label: string; href?: string }) {
    const content = (
        <div className="flex flex-1 flex-col items-center gap-2 border-2 border-black p-4">
            <Icon className="size-6 text-[#E53935]" />
            <span className="text-center text-[13px] font-semibold">{label}</span>
        </div>
    );

    if (href) {
        return <Link href={href} className="flex flex-1">{content}</Link>;
    }

    return <button className="flex flex-1 cursor-default opacity-50">{content}</button>;
}

export default function SubExploitationShow({ subExploitation, animalsCount, semaforo }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Mi Explotación', href: dashboard() },
        {
            title: `${speciesLabels[subExploitation.species] ?? subExploitation.species} · ${subExploitation.zootechnical_classification}`,
            href: subExploitationShow.url(subExploitation.id),
        },
    ];

    const label = speciesLabels[subExploitation.species] ?? subExploitation.species;
    const headerColor = speciesHeaderColors[subExploitation.species] ?? 'bg-black';
    const sustainabilityColor = subExploitation.sustainability?.toLowerCase() === 'ecológico' ? 'text-[#2E7D32]' : undefined;
    const censusDate = subExploitation.census_date
        ? new Date(subExploitation.census_date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
        : null;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${label} · ${subExploitation.zootechnical_classification}`} />
            <div className="flex flex-col gap-5 p-6">
                {/* Species Header Card */}
                <div className={`${headerColor} rounded-lg px-4 py-4 text-white`}>
                    <p className="text-lg font-bold">
                        {label} · {subExploitation.exploitation_type}
                    </p>
                    <p className="text-[13px] font-medium opacity-85">
                        {subExploitation.zootechnical_classification} · {subExploitation.productive_system}
                    </p>
                </div>

                {/* Semáforo */}
                <SemaforoIndicator
                    status={semaforo.capacity}
                    alerts={semaforo.alerts}
                    pending={semaforo.pending}
                />

                {/* Datos Zootécnicos */}
                <div className="overflow-hidden border-2 border-black">
                    <DetailRow
                        label="Clasificación zootécnica"
                        value={subExploitation.zootechnical_classification}
                    />
                    <div className="h-[2px] bg-black" />
                    <DetailRow
                        label="Capacidad productiva"
                        value={getCapacityGroup(subExploitation.max_capacity)}
                    />
                    <div className="h-[2px] bg-black" />
                    <DetailRow
                        label="Forma de cría"
                        value={subExploitation.sustainability ?? 'Convencional'}
                        valueColor={sustainabilityColor}
                    />
                    <div className="h-[2px] bg-black" />
                    <DetailRowWithSub
                        label="Censo actual"
                        value={`${animalsCount} animales`}
                        sub={censusDate ? `Actualizado: ${censusDate}` : ''}
                    />
                </div>

                {/* Acciones Rápidas */}
                <div className="flex flex-col gap-3">
                    <span className="text-xs font-semibold tracking-[2px] text-[#757575]">
                        ACCIONES RÁPIDAS
                    </span>
                    <div className="flex gap-3">
                        <ActionButton icon={List} label="Ver animales" />
                        <ActionButton icon={FileText} label="Trámites" href="/normativa" />
                        <ActionButton icon={Syringe} label="Campañas" href="/normativa" />
                    </div>
                </div>

                {/* CTA Buttons */}
                <Link
                    href="/nacimientos/crear"
                    className="flex items-center justify-center gap-2 bg-[#2E7D32] px-4 py-4 text-white"
                >
                    <Baby className="size-5" />
                    <span className="text-[15px] font-bold">Informar nacimiento</span>
                </Link>

                <Link
                    href="/scanner"
                    className="flex items-center justify-center gap-2 bg-black px-4 py-4 text-white"
                >
                    <ScanLine className="size-5" />
                    <span className="text-[15px] font-bold">Escanear crotal (OCR)</span>
                </Link>
            </div>
        </AppLayout>
    );
}
