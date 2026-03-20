import { Head, Link } from '@inertiajs/react';
import { ArrowRight, CheckCircle, Lock } from 'lucide-react';
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

function formatDate(dateString: string): string {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${day}/${month}`;
}

function formatDateWithYear(dateString: string): string {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

function CampaignCard({ campaign }: { campaign: Campaign }) {
    const progress = campaign.total_animals > 0 ? (campaign.sampled_animals / campaign.total_animals) * 100 : 0;
    const pendingCount = campaign.total_animals - campaign.sampled_animals;
    const isCompleted = campaign.status === 'completed';

    return (
        <Link
            href={`/normativa/campanas/${campaign.id}`}
            className="block overflow-hidden border-2 border-black active:opacity-90"
        >
            {/* Header */}
            <div className={`flex items-center justify-between p-4 ${isCompleted ? 'bg-black' : 'bg-[#E53935]'}`}>
                <div className="flex flex-col gap-0.5">
                    <h3 className="text-[15px] font-bold text-white">{campaign.name}</h3>
                    <p className={`text-xs font-medium ${isCompleted ? 'text-[#BDBDBD]' : 'text-white/85'}`}>
                        {speciesLabels[campaign.species] ?? campaign.species} · {formatDate(campaign.start_date)} — {formatDateWithYear(campaign.end_date)}
                    </p>
                </div>
                <span className={`px-2 py-1 text-[11px] font-bold ${isCompleted ? 'bg-[#2E7D32] text-white' : 'bg-white text-[#E53935]'}`}>
                    {isCompleted ? 'Completa' : 'En proceso'}
                </span>
            </div>

            {/* Body */}
            {isCompleted ? (
                <div className="flex items-center gap-2 p-4">
                    <CheckCircle className="size-5 text-[#2E7D32]" />
                    <p className="text-[13px] font-medium text-[#2E7D32]">
                        Todos los animales muestreados. Sin restricciones.
                    </p>
                </div>
            ) : (
                <div className="flex flex-col gap-3 p-4">
                    <div className="flex items-center justify-between">
                        <span className="text-[13px] font-medium text-[#757575]">Progreso</span>
                        <span className="text-[13px] font-bold">
                            {campaign.sampled_animals}/{campaign.total_animals} animales
                        </span>
                    </div>
                    <div className="h-2 w-full bg-[#F5F5F5]">
                        <div
                            className="h-2 bg-[#E53935] transition-all"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <p className="text-[13px] font-medium text-[#757575]">
                        {pendingCount} animales pendientes de muestreo
                    </p>
                </div>
            )}
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

            {blockedCount > 0 && blockedGroups.map(([key, animals]) => {
                const species = key.split('|')[0];
                const firstAnimal = animals[0];
                return (
                    <div key={key} className="flex flex-col gap-2.5 rounded-lg border-2 border-[#E53935] bg-[#FFEBEE] p-4">
                        <div className="flex items-center gap-2">
                            <Lock className="size-5 text-[#E53935]" />
                            <span className="text-[15px] font-bold text-[#C62828]">
                                {animals.length} {speciesLabels[species]?.toLowerCase() ?? species}{animals.length > 1 ? 's' : ''} bloqueados
                            </span>
                        </div>
                        <p className="text-[13px] font-medium leading-[1.4] text-[#757575]">
                            {firstAnimal.immobilization_reason}
                        </p>
                        {firstAnimal.campaign_id && (
                            <Link
                                href={`/normativa/campanas/${firstAnimal.campaign_id}`}
                                className="inline-flex items-center gap-1 text-[13px] font-semibold text-[#E53935]"
                            >
                                Resolver bloqueo <ArrowRight className="size-4" />
                            </Link>
                        )}
                    </div>
                );
            })}

            {restrictedCount > 0 && restrictedGroups.map(([key, animals]) => {
                const species = key.split('|')[0];
                const firstAnimal = animals[0];
                return (
                    <div key={key} className="flex flex-col gap-2.5 rounded-lg border-2 border-[#F9A825] bg-[#FFF8E1] p-4">
                        <div className="flex items-center gap-2">
                            <Lock className="size-5 text-[#F9A825]" />
                            <span className="text-[15px] font-bold text-[#F57F17]">
                                {animals.length} {speciesLabels[species]?.toLowerCase() ?? species}{animals.length > 1 ? 's' : ''} con restricción
                            </span>
                        </div>
                        <p className="text-[13px] font-medium leading-[1.4] text-[#757575]">
                            {firstAnimal.immobilization_reason}
                        </p>
                        {firstAnimal.campaign_id && (
                            <Link
                                href={`/normativa/campanas/${firstAnimal.campaign_id}`}
                                className="inline-flex items-center gap-1 text-[13px] font-semibold text-[#F9A825]"
                            >
                                Ver restricción <ArrowRight className="size-4" />
                            </Link>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

export default function CampanasIndex({ campaigns, immobilizedAnimals }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Campañas Sanitarias" />
            <div className="flex flex-col gap-4 p-6">
                <div className="flex flex-col gap-4">
                    {campaigns.map((campaign) => (
                        <CampaignCard key={campaign.id} campaign={campaign} />
                    ))}
                </div>

                <ImmobilizedSection immobilizedAnimals={immobilizedAnimals} />
            </div>
        </AppLayout>
    );
}
