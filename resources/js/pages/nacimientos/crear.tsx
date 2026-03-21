import { Head, router } from '@inertiajs/react';
import { Baby, Check, CheckCircle, ChevronDown, ChevronLeft, ChevronRight, Camera, Pencil, AlertTriangle } from 'lucide-react';
import { useEffect, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface Animal {
    id: number;
    crotal_code: string;
    breed: string;
    sex: string;
    name: string | null;
    birth_date: string;
}

interface SubExploitation {
    id: number;
    species: string;
    exploitation_type: string;
    current_capacity: number;
    max_capacity: number;
    status: string;
    animals: Animal[];
}

interface Exploitation {
    id: number;
    name: string;
    rega_code: string;
    sub_exploitations: SubExploitation[];
}

interface SuccessData {
    message: string;
    reference_code: string;
    calves: Array<{ name: string | null; sex: string; crotal: string }>;
    new_capacity: number;
}

interface Props {
    exploitation: Exploitation | null;
    success?: SuccessData | null;
}

interface CalfData {
    sex: string;
    breed: string;
    name: string;
    birth_date: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Mi Explotación', href: '/dashboard' },
    { title: 'Comunicar Nacimiento', href: '/nacimientos/crear' },
];

const STEPS = [
    'Subexplotación',
    'Madre',
    'Padre',
    'Datos cría',
    'Resumen',
    'Confirmación',
];

const speciesLabels: Record<string, string> = {
    bovine: 'Bovino',
    ovine: 'Ovino',
    caprine: 'Caprino',
    equine: 'Equino',
};

function ProgressBar({ currentStep }: { currentStep: number }) {
    return (
        <div className="flex gap-1">
            {STEPS.map((_, i) => (
                <div key={i} className={`h-1 flex-1 ${i <= currentStep ? 'bg-[#E53935]' : 'bg-[#E0E0E0]'}`} />
            ))}
        </div>
    );
}

function Step1({ subExploitations, onSelect }: { subExploitations: SubExploitation[]; onSelect: (s: SubExploitation) => void }) {
    return (
        <div className="flex flex-col gap-4">
            <h2 className="text-2xl font-bold">Seleccionar subexplotación</h2>
            <p className="text-sm leading-[1.4] text-[#757575]">Elige la subexplotación donde se registrará el nacimiento.</p>
            {subExploitations.filter(s => ['bovine', 'ovine', 'caprine', 'equine'].includes(s.species)).map((sub) => {
                const isFull = sub.current_capacity >= sub.max_capacity;
                return (
                    <button
                        key={sub.id}
                        onClick={() => !isFull && onSelect(sub)}
                        disabled={isFull}
                        className={`flex flex-col gap-2 border-2 border-black p-4 text-left ${isFull ? 'opacity-50' : 'hover:bg-[#F5F5F5]'}`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-bold">{speciesLabels[sub.species] || sub.species} · {sub.exploitation_type}</span>
                            <span className={`px-2 py-0.5 text-xs font-bold ${isFull ? 'bg-[#FFEBEE] text-[#E53935]' : 'bg-[#E8F5E9] text-[#2E7D32]'}`}>
                                {sub.current_capacity}/{sub.max_capacity}
                            </span>
                        </div>
                        <div className="h-1.5 w-full bg-[#F5F5F5]">
                            <div className={`h-1.5 ${isFull ? 'bg-[#E53935]' : 'bg-[#2E7D32]'}`} style={{ width: `${(sub.current_capacity / sub.max_capacity) * 100}%` }} />
                        </div>
                        {isFull && <p className="text-xs text-[#E53935]">Capacidad máxima alcanzada</p>}
                    </button>
                );
            })}
        </div>
    );
}

function Step2({ animals, selectedId, onSelect, subExploitationId }: { animals: Animal[]; selectedId: number | null; onSelect: (id: number) => void; subExploitationId: number }) {
    const females = animals.filter((a) => a.sex === 'female' && a.birth_date);
    const [search, setSearch] = useState('');
    const filtered = females.filter((a) => a.crotal_code.includes(search) || (a.name && a.name.toLowerCase().includes(search.toLowerCase())));

    return (
        <div className="flex flex-col gap-4">
            <h2 className="text-2xl font-bold">Seleccionar madre</h2>
            <p className="text-sm leading-[1.4] text-[#757575]">Selecciona la hembra que es madre del animal nacido.</p>
            <div className="flex gap-2">
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar por crotal o nombre..."
                    className="h-[52px] flex-1 bg-[#F5F5F5] px-[18px] text-base md:text-sm"
                />
                <button
                    onClick={() => router.visit(`/scanner?returnTo=${encodeURIComponent(`/nacimientos/crear?sub=${subExploitationId}`)}`)}
                    className="flex size-[52px] shrink-0 items-center justify-center border-2 border-black"
                    title="Escanear crotal"
                >
                    <Camera className="size-5" />
                </button>
            </div>
            <div className="flex flex-col gap-2">
                {filtered.map((a) => {
                    const age = Math.floor((Date.now() - new Date(a.birth_date).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
                    return (
                        <button
                            key={a.id}
                            onClick={() => onSelect(a.id)}
                            className={`flex items-center gap-3 border-2 p-3 text-left ${selectedId === a.id ? 'border-[#E53935] bg-[#FFF5F5]' : 'border-black'}`}
                        >
                            {selectedId === a.id && <Check className="size-5 shrink-0 text-[#E53935]" />}
                            <div className="flex-1">
                                <p className="text-sm font-bold">{a.crotal_code}</p>
                                <p className="text-xs text-[#757575]">{a.breed} · {age} años{a.name ? ` · ${a.name}` : ''}</p>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

function Step3({ animals, selectedId, onSelect, onSkip }: { animals: Animal[]; selectedId: number | null; onSelect: (id: number) => void; onSkip: () => void }) {
    const males = animals.filter((a) => a.sex === 'male');
    const [showParents, setShowParents] = useState(false);

    return (
        <div className="flex flex-col gap-4">
            <h2 className="text-2xl font-bold">Padre (opcional)</h2>
            <p className="text-sm leading-[1.4] text-[#757575]">Si conoces al padre, selecciónalo. Puedes omitir este paso.</p>
            <button onClick={onSkip} className="w-full border-2 border-black py-3 text-center text-sm font-semibold">
                Omitir este paso
            </button>
            {!showParents && (
                <button
                    onClick={() => setShowParents(true)}
                    className="flex w-full items-center justify-center gap-2 border-2 border-black bg-[#F5F5F5] py-3 text-center text-sm font-semibold"
                >
                    Ver Padres <ChevronDown className="size-4" />
                </button>
            )}
            {showParents && males.map((a) => (
                <button
                    key={a.id}
                    onClick={() => onSelect(a.id)}
                    className={`flex items-center gap-3 border-2 p-3 text-left ${selectedId === a.id ? 'border-[#E53935] bg-[#FFF5F5]' : 'border-black'}`}
                >
                    {selectedId === a.id && <Check className="size-5 shrink-0 text-[#E53935]" />}
                    <div>
                        <p className="text-sm font-bold">{a.crotal_code}</p>
                        <p className="text-xs text-[#757575]">{a.breed}{a.name ? ` · ${a.name}` : ''}</p>
                    </div>
                </button>
            ))}
        </div>
    );
}

function Step4({ motherBreed, calves, onUpdate }: { motherBreed: string; calves: CalfData[]; onUpdate: (calves: CalfData[]) => void }) {
    const today = new Date().toISOString().split('T')[0];
    const updateCalf = (index: number, field: keyof CalfData, value: string) => {
        const updated = [...calves];
        updated[index] = { ...updated[index], [field]: value };
        onUpdate(updated);
    };
    const addCalf = () => {
        onUpdate([...calves, { sex: 'female', breed: motherBreed, name: '', birth_date: today }]);
    };
    const removeCalf = (index: number) => {
        if (calves.length > 1) onUpdate(calves.filter((_, i) => i !== index));
    };

    return (
        <div className="flex flex-col gap-4">
            <h2 className="text-2xl font-bold">Datos de la cría</h2>
            {calves.map((calf, i) => {
                const daysAgo = Math.floor((Date.now() - new Date(calf.birth_date).getTime()) / (1000 * 60 * 60 * 24));
                return (
                    <div key={i} className="flex flex-col gap-3 border-2 border-black p-4">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-[2px] text-[#757575]">Cría {calves.length > 1 ? i + 1 : ''}</span>
                            {calves.length > 1 && (
                                <button onClick={() => removeCalf(i)} className="text-xs text-[#E53935]">Eliminar</button>
                            )}
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-[#757575]">Fecha de nacimiento</label>
                            <input type="date" value={calf.birth_date} onChange={(e) => updateCalf(i, 'birth_date', e.target.value)} className="mt-1 h-[44px] w-full min-w-0 bg-[#F5F5F5] px-3 text-base md:text-sm" />
                            {daysAgo > 7 && <p className="mt-1 text-xs font-medium text-[#E65100]">Supera el plazo legal de 7 días. Se recomienda registrarlo cuanto antes.</p>}
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-[#757575]">Sexo</label>
                            <div className="mt-1 flex gap-0">
                                {(['female', 'male'] as const).map((s) => (
                                    <button key={s} onClick={() => updateCalf(i, 'sex', s)} className={`flex-1 border-2 border-black py-2 text-xs font-bold ${calf.sex === s ? 'bg-black text-white' : ''}`}>
                                        {s === 'female' ? 'Hembra' : 'Macho'}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-[#757575]">Raza</label>
                            <input type="text" value={calf.breed} onChange={(e) => updateCalf(i, 'breed', e.target.value)} className="mt-1 h-[44px] w-full bg-[#F5F5F5] px-3 text-base md:text-sm" />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-[#757575]">Nombre (opcional)</label>
                            <input type="text" value={calf.name} onChange={(e) => updateCalf(i, 'name', e.target.value)} className="mt-1 h-[44px] w-full bg-[#F5F5F5] px-3 text-base md:text-sm" placeholder="Ej: Txuri" />
                        </div>
                    </div>
                );
            })}
            <button onClick={addCalf} className="w-full border-2 border-black py-3 text-center text-sm font-semibold">
                + Añadir otra cría
            </button>
        </div>
    );
}

function Step5({ sub, mother, father, calves, animals, onEditStep }: { sub: SubExploitation; mother: number; father: number | null; calves: CalfData[]; animals: Animal[]; onEditStep: (step: number) => void }) {
    const motherAnimal = animals.find((a) => a.id === mother);
    const fatherAnimal = father ? animals.find((a) => a.id === father) : null;
    const oldestCalfDaysAgo = Math.max(...calves.map((c) => Math.floor((Date.now() - new Date(c.birth_date).getTime()) / (1000 * 60 * 60 * 24))));
    const withinLegalDeadline = oldestCalfDaysAgo <= 7;

    return (
        <div className="flex flex-col gap-4">
            <h2 className="text-2xl font-bold">Resumen</h2>
            <div className="flex flex-col gap-3 border-2 border-black p-4">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-xs text-[#757575]">Subexplotación</p>
                        <p className="text-sm font-bold">{speciesLabels[sub.species]} · {sub.exploitation_type}</p>
                    </div>
                    <button onClick={() => onEditStep(0)} className="flex items-center gap-1 text-xs font-semibold text-[#E53935]">
                        <Pencil className="size-3" /> Editar
                    </button>
                </div>
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-xs text-[#757575]">Madre</p>
                        <p className="text-sm font-bold">{motherAnimal?.crotal_code} {motherAnimal?.name ? `(${motherAnimal.name})` : ''}</p>
                    </div>
                    <button onClick={() => onEditStep(1)} className="flex items-center gap-1 text-xs font-semibold text-[#E53935]">
                        <Pencil className="size-3" /> Editar
                    </button>
                </div>
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-xs text-[#757575]">Padre</p>
                        <p className="text-sm font-bold">{fatherAnimal ? `${fatherAnimal.crotal_code} ${fatherAnimal.name ? `(${fatherAnimal.name})` : ''}` : 'No indicado'}</p>
                    </div>
                    <button onClick={() => onEditStep(2)} className="flex items-center gap-1 text-xs font-semibold text-[#E53935]">
                        <Pencil className="size-3" /> Editar
                    </button>
                </div>
                <div className="mt-2 border-t-2 border-black pt-3">
                    <div className="flex items-start justify-between">
                        <p className="text-xs font-semibold uppercase tracking-[2px] text-[#757575]">Crías ({calves.length})</p>
                        <button onClick={() => onEditStep(3)} className="flex items-center gap-1 text-xs font-semibold text-[#E53935]">
                            <Pencil className="size-3" /> Editar
                        </button>
                    </div>
                    {calves.map((c, i) => (
                        <div key={i} className="mt-2 flex items-center justify-between text-sm">
                            <span>{c.sex === 'female' ? 'Hembra' : 'Macho'} · {c.breed}</span>
                            <span className="text-[#757575]">{new Date(c.birth_date).toLocaleDateString('es-ES')}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex flex-col gap-2 border-2 border-black p-4">
                <p className="text-xs font-semibold uppercase tracking-[2px] text-[#757575]">Validación</p>
                <div className="flex items-center gap-2">
                    <CheckCircle className="size-4 text-[#2E7D32]" />
                    <span className="text-xs text-[#2E7D32]">Madre activa en la explotación</span>
                </div>
                <div className="flex items-center gap-2">
                    <CheckCircle className="size-4 text-[#2E7D32]" />
                    <span className="text-xs text-[#2E7D32]">Capacidad disponible ({sub.current_capacity + calves.length}/{sub.max_capacity})</span>
                </div>
                <div className="flex items-center gap-2">
                    {withinLegalDeadline ? (
                        <>
                            <CheckCircle className="size-4 text-[#2E7D32]" />
                            <span className="text-xs text-[#2E7D32]">Dentro del plazo legal (7 días)</span>
                        </>
                    ) : (
                        <>
                            <AlertTriangle className="size-4 text-[#E65100]" />
                            <span className="text-xs text-[#E65100]">Fuera del plazo legal de 7 días</span>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

const SIGNING_STEPS = [
    'Conectando con Giltza...',
    'Verificando identidad digital...',
    'Firmando comunicación de nacimiento...',
    'Registrando en el sistema...',
];

function Step6({ referenceCode, calves, newCapacity, maxCapacity }: { referenceCode: string; calves: Array<{ name: string | null; sex: string; crotal: string }>; newCapacity: number; maxCapacity: number }) {
    const [phase, setPhase] = useState<'signing' | 'success'>('signing');
    const [signingStep, setSigningStep] = useState(0);
    const [progress, setProgress] = useState(0);
    const [signingDone, setSigningDone] = useState(false);
    const [showContent, setShowContent] = useState(false);

    useEffect(() => {
        const stepInterval = setInterval(() => {
            setSigningStep((prev) => {
                if (prev < SIGNING_STEPS.length - 1) return prev + 1;
                clearInterval(stepInterval);
                return prev;
            });
        }, 800);
        return () => clearInterval(stepInterval);
    }, []);

    useEffect(() => {
        const progressInterval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(progressInterval);
                    return 100;
                }
                return prev + 1.2;
            });
        }, 30);
        return () => clearInterval(progressInterval);
    }, []);

    useEffect(() => {
        if (progress >= 100 && signingStep === SIGNING_STEPS.length - 1) {
            const timeout = setTimeout(() => setSigningDone(true), 300);
            return () => clearTimeout(timeout);
        }
    }, [progress, signingStep]);

    useEffect(() => {
        if (signingDone) {
            const timeout = setTimeout(() => setPhase('success'), 800);
            return () => clearTimeout(timeout);
        }
    }, [signingDone]);

    useEffect(() => {
        if (phase === 'success') {
            const timeout = setTimeout(() => setShowContent(true), 400);
            return () => clearTimeout(timeout);
        }
    }, [phase]);

    if (phase === 'signing') {
        return (
            <div className="flex flex-col items-center gap-8 py-12 text-center">
                {/* Shield / Check animation */}
                <div className="relative flex items-center justify-center">
                    <div
                        className={`absolute size-28 rounded-full border-2 border-dashed transition-all duration-700 ${
                            signingDone ? 'scale-110 border-[#2E7D32] opacity-0' : 'animate-[spin_8s_linear_infinite] border-[#E53935]/30'
                        }`}
                    />
                    <div
                        className={`absolute size-20 rounded-full border transition-all duration-500 ${
                            signingDone ? 'scale-105 border-[#2E7D32] bg-[#E8F5E9]' : 'animate-[pulse_2s_ease-in-out_infinite] border-[#E53935]/20'
                        }`}
                    />
                    <div
                        className={`relative z-10 flex size-14 items-center justify-center rounded-full transition-all duration-500 ${
                            signingDone ? 'scale-110 bg-[#2E7D32] text-white' : 'bg-[#E53935] text-white'
                        }`}
                    >
                        {signingDone ? (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="size-7">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-7">
                                <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
                                <path d="M12 8v4" />
                                <path d="M12 16h.01" />
                            </svg>
                        )}
                    </div>
                </div>

                <div className="flex flex-col items-center gap-1">
                    <h2 className="text-xl font-medium">
                        {signingDone ? 'Comunicación firmada' : 'Firmando con Giltza'}
                    </h2>
                    <p className="text-sm text-[#757575]">
                        {signingDone ? 'Registro completado correctamente' : 'Firma digital gubernamental'}
                    </p>
                </div>

                <div className="w-full max-w-xs">
                    <div className="h-1.5 w-full overflow-hidden bg-[#F5F5F5]">
                        <div
                            className={`h-1.5 transition-all duration-300 ease-out ${signingDone ? 'bg-[#2E7D32]' : 'bg-[#E53935]'}`}
                            style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                    </div>
                    <div className="mt-3 flex items-center justify-center gap-2">
                        {!signingDone && <div className="size-3 animate-spin rounded-full border-2 border-[#E53935] border-t-transparent" />}
                        <p className="text-xs text-[#757575]">
                            {signingDone ? 'Verificación completada' : SIGNING_STEPS[signingStep]}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 border border-[#E0E0E0] bg-[#F5F5F5] px-4 py-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4 text-[#757575]">
                        <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    <span className="text-xs text-[#757575]">Conexión segura · Gobierno Vasco</span>
                </div>
            </div>
        );
    }

    return (
        <div
            className="flex flex-col items-center gap-5 py-8 text-center transition-all duration-500"
            style={{ opacity: showContent ? 1 : 0, transform: showContent ? 'translateY(0)' : 'translateY(12px)' }}
        >
            <div className="flex size-16 items-center justify-center bg-[#E8F5E9]">
                <CheckCircle className="size-8 text-[#2E7D32]" />
            </div>
            <h2 className="text-2xl font-bold">¡Nacimiento registrado!</h2>
            <p className="text-sm text-[#757575]">Referencia: <span className="font-bold text-black">{referenceCode}</span></p>
            <div className="flex items-center gap-2 bg-[#E8F5E9] px-3 py-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4 text-[#2E7D32]">
                    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
                </svg>
                <span className="text-xs font-semibold text-[#2E7D32]">Firmado digitalmente con Giltza</span>
            </div>
            {calves.length > 0 && (
                <div className="w-full border-2 border-black p-4">
                    <p className="text-xs font-semibold uppercase tracking-[2px] text-[#757575]">Crotales asignados</p>
                    {calves.map((c, i) => (
                        <div key={i} className="mt-2 flex items-center justify-between">
                            <span className="text-sm font-bold">{c.crotal}</span>
                            <span className="text-xs text-[#757575]">{c.sex === 'female' ? 'Hembra' : 'Macho'}{c.name ? ` · ${c.name}` : ''}</span>
                        </div>
                    ))}
                </div>
            )}
            {newCapacity > 0 && maxCapacity > 0 && (
                <div className="w-full border-2 border-black p-4">
                    <p className="text-xs font-semibold uppercase tracking-[2px] text-[#757575]">Capacidad actualizada</p>
                    <div className="mt-2 flex items-center justify-between">
                        <span className="text-sm font-bold">{newCapacity}/{maxCapacity}</span>
                        <span className={`px-2 py-0.5 text-xs font-bold ${newCapacity >= maxCapacity ? 'bg-[#FFEBEE] text-[#E53935]' : 'bg-[#E8F5E9] text-[#2E7D32]'}`}>
                            {maxCapacity - newCapacity} plazas libres
                        </span>
                    </div>
                    <div className="mt-2 h-1.5 w-full bg-[#F5F5F5]">
                        <div className={`h-1.5 ${newCapacity >= maxCapacity ? 'bg-[#E53935]' : 'bg-[#2E7D32]'}`} style={{ width: `${(newCapacity / maxCapacity) * 100}%` }} />
                    </div>
                </div>
            )}
            <div className="flex w-full flex-col gap-2">
                <button onClick={() => router.visit('/nacimientos/crear')} className="w-full bg-[#E53935] py-[18px] text-sm font-bold text-white">
                    Registrar otro nacimiento
                </button>
                <button onClick={() => router.visit('/dashboard')} className="w-full border-2 border-black py-[18px] text-sm font-semibold">
                    Volver al panel
                </button>
            </div>
        </div>
    );
}

export default function CrearNacimiento({ exploitation, success }: Props) {
    const [step, setStep] = useState(() => {
        if (success?.reference_code) return 5;
        return 0;
    });
    const [subExploitation, setSubExploitation] = useState<SubExploitation | null>(null);
    const [motherId, setMotherId] = useState<number | null>(null);
    const [fatherId, setFatherId] = useState<number | null>(null);
    const [calves, setCalves] = useState<CalfData[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState<{ reference_code: string; calves: Array<{ name: string | null; sex: string; crotal: string }>; new_capacity: number; max_capacity: number } | null>(() => {
        if (success?.reference_code) {
            return {
                reference_code: success.reference_code,
                calves: success.calves || [],
                new_capacity: success.new_capacity || 0,
                max_capacity: 0,
            };
        }
        return null;
    });

    const today = new Date().toISOString().split('T')[0];

    // Auto-restore state from scanner return (URL params: sub & crotal)
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const subId = params.get('sub');
        const crotal = params.get('crotal');

        if (subId && crotal && exploitation) {
            const sub = exploitation.sub_exploitations.find((s) => s.id === Number(subId));
            if (sub) {
                setSubExploitation(sub);
                const motherBreed = sub.animals.find((a) => a.sex === 'female')?.breed || '';
                setCalves([{ sex: 'female', breed: motherBreed, name: '', birth_date: today }]);

                const mother = sub.animals.find(
                    (a) => a.sex === 'female' && a.crotal_code === crotal.toUpperCase(),
                );
                if (mother) {
                    setMotherId(mother.id);
                    setCalves([{ sex: 'female', breed: mother.breed, name: '', birth_date: today }]);
                    setStep(2);
                } else {
                    setStep(1);
                }

                // Clean up URL params
                window.history.replaceState({}, '', window.location.pathname);
            }
        }
    }, []);

    const handleSubSelect = (sub: SubExploitation) => {
        setSubExploitation(sub);
        const motherBreed = sub.animals.find((a) => a.sex === 'female')?.breed || '';
        setCalves([{ sex: 'female', breed: motherBreed, name: '', birth_date: today }]);
        setStep(1);
    };

    const handleMotherSelect = (id: number) => {
        setMotherId(id);
        const mother = subExploitation?.animals.find((a) => a.id === id);
        if (mother) {
            setCalves((prev) => prev.map((c) => ({ ...c, breed: mother.breed })));
        }
    };

    const handleSubmit = () => {
        if (!subExploitation || !motherId) return;
        setSubmitting(true);

        router.post('/nacimientos', {
            sub_exploitation_id: subExploitation.id,
            mother_id: motherId,
            father_id: fatherId,
            birth_type: calves.length > 1 ? 'multiple' : 'simple',
            calf_count: calves.length,
            calves: calves.map((c) => ({
                sex: c.sex,
                breed: c.breed,
                name: c.name || null,
                birth_date: c.birth_date,
            })),
        }, {
            onSuccess: (page) => {
                const successData = (page.props as any).success;
                if (successData) {
                    setResult({
                        reference_code: successData.reference_code,
                        calves: successData.calves || [],
                        new_capacity: successData.new_capacity || 0,
                        max_capacity: subExploitation.max_capacity,
                    });
                    setStep(5);
                }
            },
            onError: () => setSubmitting(false),
        });
    };

    const canNext = () => {
        if (step === 0) return !!subExploitation;
        if (step === 1) return !!motherId;
        if (step === 3) return calves.every((c) => c.birth_date && c.sex && c.breed);
        return true;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Comunicar Nacimiento" />
            <div className="flex flex-col gap-5 p-6">
                {step < 5 && (
                    <>
                        <ProgressBar currentStep={step} />
                        <p className="text-xs font-semibold uppercase tracking-[2px] text-[#757575]">Paso {step + 1} de 6</p>
                    </>
                )}

                {step === 0 && !exploitation && (
                    <div className="flex flex-col items-center gap-4 py-12 text-center">
                        <Baby className="size-12 text-[#BDBDBD]" />
                        <h2 className="text-2xl font-bold">Sin explotación asignada</h2>
                        <p className="text-sm leading-[1.4] text-[#757575]">No tienes ninguna explotación asociada a tu cuenta. Contacta con tu administrador para que te asigne una.</p>
                        <button onClick={() => router.visit('/dashboard')} className="mt-2 border-2 border-black px-6 py-3 text-sm font-semibold">
                            Volver al panel
                        </button>
                    </div>
                )}
                {step === 0 && exploitation && <Step1 subExploitations={exploitation.sub_exploitations} onSelect={handleSubSelect} />}
                {step === 1 && subExploitation && <Step2 animals={subExploitation.animals} selectedId={motherId} onSelect={handleMotherSelect} subExploitationId={subExploitation.id} />}
                {step === 2 && subExploitation && <Step3 animals={subExploitation.animals} selectedId={fatherId} onSelect={setFatherId} onSkip={() => { setFatherId(null); setStep(3); }} />}
                {step === 3 && subExploitation && (
                    <Step4
                        motherBreed={subExploitation.animals.find((a) => a.id === motherId)?.breed || ''}
                        calves={calves}
                        onUpdate={setCalves}
                    />
                )}
                {step === 4 && subExploitation && (
                    <Step5 sub={subExploitation} mother={motherId!} father={fatherId} calves={calves} animals={subExploitation.animals} onEditStep={setStep} />
                )}
                {step === 5 && result && <Step6 referenceCode={result.reference_code} calves={result.calves} newCapacity={result.new_capacity} maxCapacity={result.max_capacity} />}

                {step > 0 && step < 5 && (
                    <div className="flex gap-2">
                        <button onClick={() => setStep(step - 1)} className="flex items-center gap-1 border-2 border-black px-4 py-3 text-sm font-semibold">
                            <ChevronLeft className="size-4" /> Atrás
                        </button>
                        <div className="flex-1" />
                        {step < 4 ? (
                            <button
                                onClick={() => setStep(step + 1)}
                                disabled={!canNext()}
                                className="flex items-center gap-1 bg-[#E53935] px-6 py-3 text-sm font-bold text-white disabled:opacity-50"
                            >
                                Siguiente <ChevronRight className="size-4" />
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="flex items-center gap-1 bg-[#E53935] px-6 py-3 text-sm font-bold text-white disabled:opacity-50"
                            >
                                {submitting ? 'Enviando...' : 'Enviar comunicación'}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
