import { Head, Link } from '@inertiajs/react';
import { AlertTriangle, ArrowRight, ChevronRight, ShieldAlert } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface Animal {
    id: number;
    crotal_code: string;
    species: string;
    breed: string;
    sex: string;
}

interface CampaignAnimal {
    id: number;
    status: 'pending' | 'sampled' | 'immobilized';
    immobilization_reason: string | null;
    restriction_type: 'blocked' | 'restricted' | null;
    animal: Animal;
    campaign_name?: string;
    campaign_id?: number;
}

interface Campaign {
    id: number;
    name: string;
    species: string;
    status: string;
    start_date: string;
    end_date: string;
    total_animals: number;
    sampled_animals: number;
    campaign_animals: CampaignAnimal[];
}

interface Props {
    campaigns: Campaign[];
    immobilizedAnimals: Record<string, CampaignAnimal[]>;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Mi Explotación', href: '/dashboard' },
    { title: 'Normativa', href: '/normativa' },
    { title: 'Campañas Sanitarias', href: '/normativa/campanas' },
];

const speciesLabels: Record<string, string> = {
    bovine: 'Bovino',
    ovine: 'Ovino',
    caprine: 'Caprino',
    porcine: 'Porcino',
};

function CampaignCard({ campaign }: { campaign: Campaign }) {
    const progress = campaign.total_animals > 0 ? (campaign.sampled_animals / campaign.total_animals) * 100 : 0;
    const pendingCount = campaign.total_animals - campaign.sampled_animals;
    const isCompleted = campaign.status === 'completed';

    return (
        <Link
            href={`/normativa/campanas/${campaign.id}`}
            className="block border-2 border-black bg-white active:bg-[#F5F5F5]"
        >
            <div className="flex flex-col gap-3 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold">{campaign.name}</h3>
                        <span className="bg-[#F5F5F5] px-1.5 py-0.5 text-[10px] font-semibold text-[#757575]">
                            {speciesLabels[campaign.species] ?? campaign.species}
                        </span>
                    </div>
                    <ChevronRight className="size-4 text-[#757575]" />
                </div>

                <p className="text-xs text-[#757575]">
                    {new Date(campaign.start_date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                    {' — '}
                    {new Date(campaign.end_date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>

                <div className="flex items-center justify-between">
                    <span
                        className={`px-2 py-0.5 text-xs font-bold ${isCompleted ? 'bg-[#E8F5E9] text-[#2E7D32]' : 'bg-[#FFEBEE] text-[#E53935]'}`}
                    >
                        {isCompleted ? 'Completa' : 'En proceso'}
                    </span>
                    {!isCompleted && pendingCount > 0 && (
                        <span className="text-xs font-semibold text-[#757575]">{pendingCount} pendientes</span>
                    )}
                </div>

                <div>
                    <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-[#757575]">Progreso</span>
                        <span className="font-bold">
                            {campaign.sampled_animals}/{campaign.total_animals}
                        </span>
                    </div>
                    <div className="mt-1 h-2 w-full bg-[#F5F5F5]">
                        <div
                            className={`h-2 transition-all ${isCompleted ? 'bg-[#2E7D32]' : 'bg-[#E53935]'}`}
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            </div>
        </Link>
    );
}

function ImmobilizedSection({ immobilizedAnimals }: { immobilizedAnimals: Record<string, CampaignAnimal[]> }) {
    const groups = Object.entries(immobilizedAnimals);

    if (groups.length === 0) return null;

    const blockedGroups = groups.filter(([key]) => key.endsWith('|blocked'));
    const restrictedGroups = groups.filter(([key]) => key.endsWith('|restricted'));

    const blockedCount = blockedGroups.reduce((sum, [, animals]) => sum + animals.length, 0);
    const restrictedCount = restrictedGroups.reduce((sum, [, animals]) => sum + animals.length, 0);

    return (
        <div className="flex flex-col gap-3">
            <h2 className="text-xs font-semibold uppercase tracking-[2px] text-[#757575]">Animales inmovilizados</h2>

            {blockedCount > 0 && (
                <div className="border-2 border-[#E53935] bg-[#FFEBEE]">
                    <div className="flex flex-col gap-3 p-4">
                        <div className="flex items-center gap-2">
                            <ShieldAlert className="size-5 text-[#E53935]" />
                            <span className="text-sm font-bold text-[#E53935]">
                                {blockedCount} bloqueado{blockedCount > 1 ? 's' : ''}
                            </span>
                        </div>
                        {blockedGroups.map(([key, animals]) => {
                            const species = key.split('|')[0];
                            const firstAnimal = animals[0];
                            return (
                                <div key={key} className="flex flex-col gap-1">
                                    <p className="text-xs font-semibold">
                                        {speciesLabels[species] ?? species} · {animals.length} animal{animals.length > 1 ? 'es' : ''}
                                    </p>
                                    <p className="text-xs text-[#B71C1C]">{firstAnimal.immobilization_reason}</p>
                                    {firstAnimal.campaign_id && (
                                        <Link
                                            href={`/normativa/campanas/${firstAnimal.campaign_id}`}
                                            className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-[#E53935]"
                                        >
                                            Resolver bloqueo <ArrowRight className="size-3" />
                                        </Link>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {restrictedCount > 0 && (
                <div className="border-2 border-[#E65100] bg-[#FFF3E0]">
                    <div className="flex flex-col gap-3 p-4">
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="size-5 text-[#E65100]" />
                            <span className="text-sm font-bold text-[#E65100]">
                                {restrictedCount} con restricción
                            </span>
                        </div>
                        {restrictedGroups.map(([key, animals]) => {
                            const species = key.split('|')[0];
                            const firstAnimal = animals[0];
                            return (
                                <div key={key} className="flex flex-col gap-1">
                                    <p className="text-xs font-semibold">
                                        {speciesLabels[species] ?? species} · {animals.length} animal{animals.length > 1 ? 'es' : ''}
                                    </p>
                                    <p className="text-xs text-[#BF360C]">{firstAnimal.immobilization_reason}</p>
                                    {firstAnimal.campaign_id && (
                                        <Link
                                            href={`/normativa/campanas/${firstAnimal.campaign_id}`}
                                            className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-[#E65100]"
                                        >
                                            Ver restricción <ArrowRight className="size-3" />
                                        </Link>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function CampanasIndex({ campaigns, immobilizedAnimals }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Campañas Sanitarias" />
            <div className="flex flex-col gap-5 p-6">
                <h1 className="text-2xl font-bold">Campañas Sanitarias</h1>

                <div className="flex flex-col gap-3">
                    {campaigns.map((campaign) => (
                        <CampaignCard key={campaign.id} campaign={campaign} />
                    ))}
                </div>

                <ImmobilizedSection immobilizedAnimals={immobilizedAnimals} />
            </div>
        </AppLayout>
    );
}
