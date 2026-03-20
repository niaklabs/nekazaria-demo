import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { index as animalesIndex, show as animalShow } from '@/actions/App/Http/Controllers/AnimalController';
import { show as subExploitationShow } from '@/actions/App/Http/Controllers/SubExploitationController';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type Movement = {
    type: string;
    label: string;
    date: string;
    color: 'green' | 'red';
};

type SanitaryState = {
    status: 'ok' | 'warning' | 'danger';
    title: string;
    description: string;
};

type AnimalData = {
    id: number;
    crotal_code: string;
    species_label: string;
    sex_label: string;
    age_label: string | null;
    breed: string | null;
};

type SubExploitation = {
    id: number;
    species: string;
    zootechnical_classification: string;
};

type Props = {
    subExploitation: SubExploitation;
    animal: AnimalData;
    sanitaryState: SanitaryState;
    movements: Movement[];
};

const speciesLabels: Record<string, string> = {
    bovine: 'Bovino',
    ovine: 'Ovino',
    caprine: 'Caprino',
    porcine: 'Porcino',
    equine: 'Equino',
};

const sanitaryStyles: Record<string, { bg: string; border: string; dot: string }> = {
    ok: { bg: 'bg-[#E8F5E9]', border: 'border-[#2E7D32]', dot: 'bg-[#2E7D32]' },
    warning: { bg: 'bg-[#FFF3E0]', border: 'border-[#F9A825]', dot: 'bg-[#F9A825]' },
    danger: { bg: 'bg-[#FFEBEE]', border: 'border-[#E53935]', dot: 'bg-[#E53935]' },
};

const movementBarColors: Record<string, string> = {
    green: 'bg-[#2E7D32]',
    red: 'bg-[#E53935]',
};

export default function AnimalShow({ subExploitation, animal, sanitaryState, movements }: Props) {
    const label = speciesLabels[subExploitation.species] ?? subExploitation.species;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Mi Explotación', href: '/dashboard' },
        {
            title: `${label} · ${subExploitation.zootechnical_classification}`,
            href: subExploitationShow.url(subExploitation.id),
        },
        { title: 'Animales', href: animalesIndex.url(subExploitation.id) },
        { title: 'Ficha Animal', href: animalShow.url({ subExploitation: subExploitation.id, animal: animal.id }) },
    ];

    const metaText = [animal.sex_label, animal.age_label].filter(Boolean).join(' · ');
    const style = sanitaryStyles[sanitaryState.status];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Ficha Animal" />
            <div className="flex flex-col gap-4 px-6 pt-3 pb-6">
                {/* Header Navigation */}
                <div className="flex items-center gap-2">
                    <Link href={animalesIndex.url(subExploitation.id)}>
                        <ArrowLeft className="size-6 text-black" />
                    </Link>
                    <h1 className="text-lg font-bold text-black">Ficha Animal</h1>
                </div>

                {/* Animal Header Card - Black background */}
                <div className="flex flex-col gap-2 bg-black p-5">
                    <span className="text-[28px] font-bold tracking-tight text-white" style={{ letterSpacing: '-0.3px' }}>
                        {animal.crotal_code}
                    </span>
                    <div className="flex items-center gap-3">
                        <span className="bg-[#E53935] px-2 py-1 text-xs font-bold text-white">
                            {animal.species_label}
                        </span>
                        {metaText && (
                            <span className="text-[13px] font-medium text-[#BDBDBD]">{metaText}</span>
                        )}
                    </div>
                </div>

                {/* Sanitary Status Section */}
                <div className="flex flex-col gap-3">
                    <span className="text-xs font-semibold tracking-[2px] text-[#757575]">
                        ESTADO SANITARIO
                    </span>
                    <div className={`flex flex-col gap-3 border-2 ${style.border} ${style.bg} p-4`}>
                        <div className="flex items-center gap-2">
                            <div className={`size-4 shrink-0 rounded-full ${style.dot}`} />
                            <span className="text-[15px] font-bold text-black">{sanitaryState.title}</span>
                        </div>
                        <p className="text-[13px] font-medium leading-[1.4] text-[#757575]">
                            {sanitaryState.description}
                        </p>
                    </div>
                </div>

                {/* Movement History Section */}
                <div className="flex flex-col gap-3">
                    <span className="text-xs font-semibold tracking-[2px] text-[#757575]">
                        HISTORIAL DE MOVIMIENTOS
                    </span>
                    <div className="overflow-hidden border-2 border-black">
                        {movements.map((movement, idx) => (
                            <div key={idx}>
                                {idx > 0 && <div className="h-[2px] bg-black" />}
                                <div className="flex items-center gap-3 px-4 py-3">
                                    <div className={`h-8 w-1 shrink-0 ${movementBarColors[movement.color]}`} />
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-[13px] font-bold text-black">{movement.label}</span>
                                        <span className="text-[12px] font-medium text-[#757575]">{movement.date}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Actions Section */}
                <div className="flex flex-col gap-3">
                    <span className="text-xs font-semibold tracking-[2px] text-[#757575]">ACCIONES</span>
                    <div className="flex gap-3">
                        <button className="flex-1 bg-[#E53935] px-4 py-3.5 text-center text-xs font-bold text-white">
                            Comunicar movimiento
                        </button>
                        <button className="flex-1 border-2 border-black bg-white px-4 py-3.5 text-center text-xs font-bold text-black">
                            Solicitar guía
                        </button>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
