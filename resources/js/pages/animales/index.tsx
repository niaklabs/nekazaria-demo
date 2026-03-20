import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, ChevronRight, ScanLine, Search } from 'lucide-react';
import { useState, useMemo } from 'react';
import { index as animalesIndex } from '@/actions/App/Http/Controllers/AnimalController';
import { show as subExploitationShow } from '@/actions/App/Http/Controllers/SubExploitationController';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type Animal = {
    id: number;
    crotal_code: string;
    status: 'ok' | 'warning' | 'danger';
    has_alert: boolean;
    is_immobilized: boolean;
    subtitle: string;
    subtitle_color: 'danger' | 'muted';
};

type SubExploitation = {
    id: number;
    species: string;
    zootechnical_classification: string;
};

type Props = {
    subExploitation: SubExploitation;
    animals: Animal[];
    speciesLabel: string;
};

const speciesLabels: Record<string, string> = {
    bovine: 'Bovino',
    ovine: 'Ovino',
    caprine: 'Caprino',
    porcine: 'Porcino',
    equine: 'Equino',
};

type Filter = 'todos' | 'alertas' | 'inmovilizados';

const statusColors: Record<string, string> = {
    ok: 'bg-[#2E7D32]',
    warning: 'bg-[#F9A825]',
    danger: 'bg-[#E53935]',
};

export default function AnimalesIndex({ subExploitation, animals, speciesLabel }: Props) {
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<Filter>('todos');

    const filteredAnimals = useMemo(() => {
        let result = animals;

        if (search.trim()) {
            const query = search.trim().toUpperCase();
            result = result.filter((a) => a.crotal_code.includes(query));
        }

        if (filter === 'alertas') {
            result = result.filter((a) => a.has_alert);
        } else if (filter === 'inmovilizados') {
            result = result.filter((a) => a.is_immobilized);
        }

        return result;
    }, [animals, search, filter]);

    const alertCount = animals.filter((a) => a.has_alert).length;
    const immobilizedCount = animals.filter((a) => a.is_immobilized).length;

    const label = speciesLabels[subExploitation.species] ?? subExploitation.species;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Mi Explotación', href: '/dashboard' },
        {
            title: `${label} · ${subExploitation.zootechnical_classification}`,
            href: subExploitationShow.url(subExploitation.id),
        },
        { title: 'Animales', href: animalesIndex.url(subExploitation.id) },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Animales" />
            <div className="flex flex-col gap-4 p-6">
                {/* Header */}
                <div className="flex items-center gap-2">
                    <Link href={subExploitationShow.url(subExploitation.id)}>
                        <ArrowLeft className="size-6 text-black" />
                    </Link>
                    <h1 className="text-lg font-bold text-black">Animales</h1>
                </div>

                {/* Search Bar */}
                <div className="flex items-center gap-3.5 bg-[#F5F5F5] px-4 py-3.5">
                    <Search className="size-5 text-[#757575]" />
                    <input
                        type="text"
                        placeholder="Buscar por nº de crotal..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="flex-1 bg-transparent text-[15px] text-black placeholder-[#BDBDBD] outline-none"
                    />
                </div>

                {/* Filter Chips */}
                <div className="flex gap-2">
                    <FilterChip
                        label={`Todos (${animals.length})`}
                        active={filter === 'todos'}
                        onClick={() => setFilter('todos')}
                    />
                    <FilterChip
                        label="Con alertas"
                        active={filter === 'alertas'}
                        onClick={() => setFilter('alertas')}
                    />
                    <FilterChip
                        label="Inmovilizados"
                        active={filter === 'inmovilizados'}
                        onClick={() => setFilter('inmovilizados')}
                    />
                </div>

                {/* Count Row */}
                <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-black">{filteredAnimals.length} animales</span>
                    <span className="text-sm font-medium text-[#757575]">{speciesLabel}</span>
                </div>

                {/* Animal List */}
                <div className="overflow-hidden border-2 border-black">
                    {filteredAnimals.map((animal, idx) => (
                        <div key={animal.id}>
                            {idx > 0 && <div className="h-[2px] bg-black" />}
                            <div className="flex items-center gap-3 p-4">
                                <div className={`size-3 shrink-0 rounded-full ${statusColors[animal.status]}`} />
                                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                                    <span className="text-[15px] font-bold text-black">{animal.crotal_code}</span>
                                    <span
                                        className={`text-xs font-medium ${
                                            animal.subtitle_color === 'danger' ? 'text-[#E53935]' : 'text-[#757575]'
                                        }`}
                                    >
                                        {animal.subtitle}
                                    </span>
                                </div>
                                {animal.has_alert && (
                                    <span className="shrink-0 bg-[#F9A825] px-2 py-1 text-[10px] font-bold text-black">
                                        Alerta
                                    </span>
                                )}
                                <ChevronRight className="size-5 shrink-0 text-[#757575]" />
                            </div>
                        </div>
                    ))}
                    {filteredAnimals.length === 0 && (
                        <div className="px-4 py-8 text-center text-sm text-[#757575]">
                            No se encontraron animales
                        </div>
                    )}
                </div>

                {/* Escanear crotal button */}
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

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`px-3.5 py-2 text-xs font-semibold ${
                active ? 'bg-black text-white' : 'border-2 border-black bg-white text-black'
            }`}
        >
            {label}
        </button>
    );
}
