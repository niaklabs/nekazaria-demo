import { Head } from '@inertiajs/react';
import { CheckCircle2, Clock, ShieldAlert } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface Animal {
    id: number;
    crotal_code: string;
    breed: string;
    sex: string;
    birth_date: string;
}

interface CampaignAnimal {
    id: number;
    status: 'pending' | 'sampled' | 'immobilized';
    immobilization_reason: string | null;
    animal: Animal;
}

interface Campaign {
    id: number;
    name: string;
    status: string;
    start_date: string;
    end_date: string;
    total_animals: number;
    sampled_animals: number;
    campaign_animals: CampaignAnimal[];
}

interface Props {
    campaign: Campaign;
}

const statusConfig = {
    pending: { label: 'Pendiente', icon: Clock, color: 'text-[#E65100]', bg: 'bg-[#FFF3E0]' },
    sampled: { label: 'Muestreado', icon: CheckCircle2, color: 'text-[#2E7D32]', bg: 'bg-[#E8F5E9]' },
    immobilized: { label: 'Inmovilizado', icon: ShieldAlert, color: 'text-[#E53935]', bg: 'bg-[#FFEBEE]' },
};

function AnimalCard({ item }: { item: CampaignAnimal }) {
    const config = statusConfig[item.status];
    const Icon = config.icon;
    const age = Math.floor((Date.now() - new Date(item.animal.birth_date).getTime()) / (365.25 * 24 * 60 * 60 * 1000));

    return (
        <div className="flex items-center gap-3 border-2 border-black p-3">
            <div className={`flex size-8 items-center justify-center ${config.bg}`}>
                <Icon className={`size-4 ${config.color}`} />
            </div>
            <div className="flex-1">
                <p className="text-sm font-bold">{item.animal.crotal_code}</p>
                <p className="text-xs text-[#757575]">{item.animal.breed} · {item.animal.sex === 'female' ? 'Hembra' : 'Macho'} · {age} años</p>
                {item.immobilization_reason && (
                    <p className="mt-1 text-xs font-medium text-[#E53935]">{item.immobilization_reason}</p>
                )}
            </div>
            <span className={`px-2 py-0.5 text-xs font-bold ${config.bg} ${config.color}`}>{config.label}</span>
        </div>
    );
}

export default function CampaignShow({ campaign }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Mi Explotación', href: '/dashboard' },
        { title: 'Normativa', href: '/normativa' },
        { title: campaign.name, href: `/normativa/campanas/${campaign.id}` },
    ];

    const pending = campaign.campaign_animals.filter((ca) => ca.status === 'pending');
    const sampled = campaign.campaign_animals.filter((ca) => ca.status === 'sampled');
    const immobilized = campaign.campaign_animals.filter((ca) => ca.status === 'immobilized');
    const progress = campaign.total_animals > 0 ? (campaign.sampled_animals / campaign.total_animals) * 100 : 0;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={campaign.name} />
            <div className="flex flex-col gap-5 p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">{campaign.name}</h1>
                    <span className={`px-2 py-1 text-xs font-bold ${campaign.status === 'completed' ? 'bg-[#E8F5E9] text-[#2E7D32]' : 'bg-[#FFF3E0] text-[#E65100]'}`}>
                        {campaign.status === 'completed' ? 'Completa' : 'En proceso'}
                    </span>
                </div>

                <div className="border-2 border-black p-4">
                    <div className="flex items-center justify-between text-sm">
                        <span className="font-semibold">Progreso de muestreo</span>
                        <span className="font-bold">{campaign.sampled_animals}/{campaign.total_animals}</span>
                    </div>
                    <div className="mt-2 h-2 w-full bg-[#F5F5F5]">
                        <div className="h-2 bg-[#E53935] transition-all" style={{ width: `${progress}%` }} />
                    </div>
                    <p className="mt-2 text-xs text-[#757575]">
                        Finaliza: {new Date(campaign.end_date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                </div>

                {immobilized.length > 0 && (
                    <div>
                        <h2 className="mb-3 text-xs font-semibold uppercase tracking-[2px] text-[#757575]">Inmovilizados ({immobilized.length})</h2>
                        <div className="flex flex-col gap-2">
                            {immobilized.map((ca) => <AnimalCard key={ca.id} item={ca} />)}
                        </div>
                    </div>
                )}

                {pending.length > 0 && (
                    <div>
                        <h2 className="mb-3 text-xs font-semibold uppercase tracking-[2px] text-[#757575]">Pendientes de muestreo ({pending.length})</h2>
                        <div className="flex flex-col gap-2">
                            {pending.map((ca) => <AnimalCard key={ca.id} item={ca} />)}
                        </div>
                    </div>
                )}

                {sampled.length > 0 && (
                    <div>
                        <h2 className="mb-3 text-xs font-semibold uppercase tracking-[2px] text-[#757575]">Muestreados ({sampled.length})</h2>
                        <div className="flex flex-col gap-2">
                            {sampled.map((ca) => <AnimalCard key={ca.id} item={ca} />)}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
