import { Head, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { ExploitationCard } from '@/components/exploitation-card';
import { NotificationBell } from '@/components/notification-bell';
import { SpeciesFilter } from '@/components/species-filter';
import { SubExploitationCard } from '@/components/sub-exploitation-card';
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
    animals_count: number;
};

type Exploitation = {
    id: number;
    rega_code: string;
    name: string;
    municipality: string | null;
    province: string | null;
    sub_exploitations: SubExploitation[];
};

type DashboardProps = {
    exploitation: Exploitation | null;
    unreadRegulationsCount: number;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Mi Explotación',
        href: dashboard(),
    },
];

export default function Dashboard() {
    const { exploitation, unreadRegulationsCount } = usePage<{ exploitation: Exploitation | null; unreadRegulationsCount: number }>().props;
    const [activeSpecies, setActiveSpecies] = useState<string | null>(null);

    const subExploitations = exploitation?.sub_exploitations ?? [];
    const availableSpecies = [...new Set(subExploitations.map((s) => s.species))];
    const filteredSubs = activeSpecies
        ? subExploitations.filter((s) => s.species === activeSpecies)
        : subExploitations;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Mi Explotación" />
            <div className="flex flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Mi Explotación</h1>
                        {exploitation?.province && (
                            <p className="text-sm font-medium text-muted-foreground">{exploitation.province}</p>
                        )}
                    </div>
                    <NotificationBell count={unreadRegulationsCount} />
                </div>

                {exploitation ? (
                    <>
                        {/* REGA Card */}
                        <ExploitationCard
                            regaCode={exploitation.rega_code}
                            municipality={exploitation.municipality}
                            province={exploitation.province}
                        />

                        {/* Species Filter */}
                        {availableSpecies.length > 1 && (
                            <div className="flex flex-col gap-2">
                                <span className="text-xs font-semibold tracking-widest text-neutral-500">
                                    FILTRAR POR ESPECIE
                                </span>
                                <SpeciesFilter
                                    species={availableSpecies}
                                    activeSpecies={activeSpecies}
                                    onSelect={setActiveSpecies}
                                />
                            </div>
                        )}

                        {/* Subexploitations */}
                        <div className="flex flex-col gap-4">
                            <span className="text-xs font-semibold tracking-widest text-neutral-500">
                                SUBEXPLOTACIONES
                            </span>
                            {filteredSubs.map((sub) => (
                                <SubExploitationCard
                                    key={sub.id}
                                    id={sub.id}
                                    species={sub.species}
                                    exploitationType={sub.exploitation_type}
                                    zootechnicalClassification={sub.zootechnical_classification}
                                    productiveSystem={sub.productive_system}
                                    currentCapacity={sub.current_capacity}
                                    maxCapacity={sub.max_capacity}
                                    sustainability={sub.sustainability}
                                    selfConsumption={sub.self_consumption}
                                    animalsCount={sub.animals_count}
                                />
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="rounded-lg border-2 border-dashed border-neutral-300 p-8 text-center">
                        <p className="text-sm text-muted-foreground">
                            No tienes ninguna explotación registrada.
                        </p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
