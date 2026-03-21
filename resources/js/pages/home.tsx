import { Head, Link, usePage } from '@inertiajs/react';
import { Baby, Bell, BellRing, ChevronRight, FilePlus, List, MessageCircle, ScanLine, Sparkles, Sprout, BarChart3 } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';

type AuraSummaryItem = {
    id: number;
    title: string;
    severity: 'urgent' | 'warning' | 'info';
    action_url: string | null;
};

type HomeProps = {
    firstName: string;
    avatar: string | null;
    auraSummary: AuraSummaryItem[];
};

const ctaCards = [
    { label: 'Ver estado de mi explotación', icon: BarChart3, href: '/dashboard', color: '#3D7A5A', disabled: false },
    { label: 'Consultar censo actual', icon: List, href: '#', color: '#C45C26', disabled: true },
    { label: 'Revisar alertas pendientes', icon: Bell, href: '/normativa', color: '#C45C26', disabled: false },
    { label: 'Iniciar un trámite', icon: FilePlus, href: '/nacimientos/crear', color: '#3D7A5A', disabled: false },
];

const fastActions = [
    { label: 'Escanear crotal', icon: ScanLine, href: '#', color: '#C45C26' },
    { label: 'Registrar nacimiento', icon: Baby, href: '/nacimientos/crear', color: '#3D7A5A' },
    { label: 'Revisar alertas', icon: BellRing, href: '/normativa', color: '#C45C26' },
];

function severityDotColor(severity: string): string {
    return severity === 'info' ? '#3D7A5A' : '#C45C26';
}

export default function Home() {
    const { firstName, avatar, auraSummary } = usePage<HomeProps>().props;

    return (
        <AppLayout>
            <Head title="Inicio" />
            <div className="flex min-h-screen flex-col bg-[#F4F3F1]">
                {/* AI Greeting Section */}
                <div className="flex gap-3 px-5 pt-3 pb-5">
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full">
                        {avatar ? (
                            <img src={avatar} alt={firstName} className="h-full w-full object-cover" />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center bg-[#EEECE9] text-xl">
                                🐂
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <div
                            className="flex flex-col gap-2.5 rounded-br-2xl rounded-bl-2xl rounded-tr-2xl bg-white px-[18px] pt-3.5 pb-3"
                            style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}
                        >
                            <p className="font-serif text-xl font-semibold tracking-tight text-[#1C1C1C]">
                                Hola {firstName}!
                            </p>
                            <p className="font-serif text-sm italic text-[#5C5C5C]">
                                ¿En qué puedo ayudarte hoy?
                            </p>
                            <div className="h-px w-full bg-[#EEECE9]" />
                            <Link href="/chat" className="flex items-center gap-1.5">
                                <MessageCircle className="h-3.5 w-3.5 text-[#C45C26]" />
                                <span className="text-[11px] font-semibold tracking-wide text-[#C45C26]" style={{ fontFamily: "'Barlow Semi Condensed', sans-serif" }}>
                                    Escríbeme, estoy aquí para ayudarte
                                </span>
                                <ChevronRight className="h-3 w-3 text-[#C45C26]" />
                            </Link>
                        </div>
                        <span
                            className="text-[10px] font-bold tracking-[2px] text-[#8C8A87]"
                            style={{ fontFamily: "'Barlow Semi Condensed', sans-serif" }}
                        >
                            NEKAZARIA
                        </span>
                    </div>
                </div>

                {/* Resumen Inteligente Aura */}
                {auraSummary.length > 0 && (
                    <div className="flex flex-col gap-2.5 px-5 pt-1 pb-2">
                        <div className="flex items-center gap-1.5">
                            <Sparkles className="h-3.5 w-3.5 text-[#C45C26]" />
                            <span
                                className="text-[11px] font-bold tracking-[2.5px] text-[#8C8A87]"
                                style={{ fontFamily: "'Barlow Semi Condensed', sans-serif" }}
                            >
                                RESUMEN INTELIGENTE
                            </span>
                        </div>
                        <div
                            className="flex flex-col gap-2 rounded-[10px] border border-[#EEECE9] bg-white px-3.5 py-3"
                            style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}
                        >
                            {auraSummary.map((item, index) => (
                                <div key={item.id}>
                                    <Link
                                        href={item.action_url || '/normativa'}
                                        className="flex items-center gap-2"
                                    >
                                        <span
                                            className="h-1.5 w-1.5 shrink-0 rounded-full"
                                            style={{ backgroundColor: severityDotColor(item.severity) }}
                                        />
                                        <span className="flex-1 font-serif text-[13px] leading-[1.3] text-[#1C1C1C]">
                                            {item.title}
                                        </span>
                                        <ChevronRight className="h-3 w-3 shrink-0 text-[#B5B3B0]" />
                                    </Link>
                                    {index < auraSummary.length - 1 && (
                                        <div className="mt-2 h-px w-full bg-[#F4F3F1]" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* CTA Cards Grid */}
                <div className="flex flex-col gap-3 px-5 py-2">
                    <div className="grid grid-cols-2 gap-3">
                        {ctaCards.slice(0, 2).map((card) => (
                            <CTACard key={card.label} card={card} />
                        ))}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        {ctaCards.slice(2).map((card) => (
                            <CTACard key={card.label} card={card} />
                        ))}
                    </div>
                </div>

                {/* Fast Actions Section */}
                <div className="flex flex-col gap-3 px-5 pt-4 pb-6">
                    <div className="flex items-center justify-between">
                        <span
                            className="text-xs font-bold tracking-[3px] text-[#8C8A87]"
                            style={{ fontFamily: "'Barlow Semi Condensed', sans-serif" }}
                        >
                            ACCIONES RÁPIDAS
                        </span>
                        <Link
                            href="/normativa"
                            className="text-[11px] font-semibold tracking-wide text-[#C45C26]"
                            style={{ fontFamily: "'Barlow Semi Condensed', sans-serif" }}
                        >
                            Ver todo
                        </Link>
                    </div>
                    <div className="grid grid-cols-3 gap-2.5">
                        {fastActions.map((action) => {
                            const Icon = action.icon;
                            return (
                                <Link
                                    key={action.label}
                                    href={action.href}
                                    className="flex flex-col items-center justify-center gap-2.5 rounded-xl bg-white px-3 pt-5 pb-4"
                                    style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
                                >
                                    <div
                                        className="flex h-11 w-11 items-center justify-center rounded-xl"
                                        style={{ backgroundColor: action.color }}
                                    >
                                        <Icon className="h-[22px] w-[22px] text-white" />
                                    </div>
                                    <span className="text-center font-serif text-xs font-semibold leading-[1.3] text-[#1C1C1C]">
                                        {action.label}
                                    </span>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex flex-col items-center gap-1.5 px-5 pt-6 pb-4">
                    <Sprout className="h-4 w-4 text-[#B5B3B0]" />
                    <span className="font-serif text-[13px] italic text-[#B5B3B0]">
                        Tu campo, siempre cerca
                    </span>
                </div>
            </div>
        </AppLayout>
    );
}

function CTACard({ card }: { card: (typeof ctaCards)[number] }) {
    const Icon = card.icon;
    const content = (
        <div
            className={`flex flex-col gap-3 rounded-xl bg-white p-4 ${card.disabled ? 'cursor-not-allowed opacity-50' : ''}`}
            style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}
        >
            <div
                className="flex h-9 w-9 items-center justify-center rounded-[10px]"
                style={{ backgroundColor: card.color }}
            >
                <Icon className="h-[18px] w-[18px] text-white" />
            </div>
            <span className="font-serif text-sm font-semibold text-[#1C1C1C]">
                {card.label}
            </span>
        </div>
    );

    if (card.disabled) {
        return <div>{content}</div>;
    }

    return (
        <Link href={card.href} className="block">
            {content}
        </Link>
    );
}
