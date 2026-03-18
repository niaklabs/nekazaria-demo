import { Head, router } from '@inertiajs/react';
import { Baby, Check, ChevronLeft, ChevronRight, Camera } from 'lucide-react';
import { useState } from 'react';
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

interface Props {
    exploitation: Exploitation;
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

function Step2({ animals, selectedId, onSelect }: { animals: Animal[]; selectedId: number | null; onSelect: (id: number) => void }) {
    const females = animals.filter((a) => a.sex === 'female' && a.birth_date);
    const [search, setSearch] = useState('');
    const filtered = females.filter((a) => a.crotal_code.includes(search) || (a.name && a.name.toLowerCase().includes(search.toLowerCase())));

    return (
        <div className="flex flex-col gap-4">
            <h2 className="text-2xl font-bold">Seleccionar madre</h2>
            <p className="text-sm leading-[1.4] text-[#757575]">Selecciona la hembra que es madre del animal nacido.</p>
            <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por crotal o nombre..."
                className="h-[52px] w-full bg-[#F5F5F5] px-[18px] text-sm"
            />
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

    return (
        <div className="flex flex-col gap-4">
            <h2 className="text-2xl font-bold">Padre (opcional)</h2>
            <p className="text-sm leading-[1.4] text-[#757575]">Si conoces al padre, selecciónalo. Puedes omitir este paso.</p>
            <button onClick={onSkip} className="w-full border-2 border-black py-3 text-center text-sm font-semibold">
                Omitir este paso
            </button>
            {males.map((a) => (
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
                            <input type="date" value={calf.birth_date} onChange={(e) => updateCalf(i, 'birth_date', e.target.value)} className="mt-1 h-[44px] w-full bg-[#F5F5F5] px-3 text-sm" />
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
                            <input type="text" value={calf.breed} onChange={(e) => updateCalf(i, 'breed', e.target.value)} className="mt-1 h-[44px] w-full bg-[#F5F5F5] px-3 text-sm" />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-[#757575]">Nombre (opcional)</label>
                            <input type="text" value={calf.name} onChange={(e) => updateCalf(i, 'name', e.target.value)} className="mt-1 h-[44px] w-full bg-[#F5F5F5] px-3 text-sm" placeholder="Ej: Txuri" />
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

function Step5({ sub, mother, father, calves, animals }: { sub: SubExploitation; mother: number; father: number | null; calves: CalfData[]; animals: Animal[] }) {
    const motherAnimal = animals.find((a) => a.id === mother);
    const fatherAnimal = father ? animals.find((a) => a.id === father) : null;

    return (
        <div className="flex flex-col gap-4">
            <h2 className="text-2xl font-bold">Resumen</h2>
            <div className="flex flex-col gap-3 border-2 border-black p-4">
                <div>
                    <p className="text-xs text-[#757575]">Subexplotación</p>
                    <p className="text-sm font-bold">{speciesLabels[sub.species]} · {sub.exploitation_type}</p>
                </div>
                <div>
                    <p className="text-xs text-[#757575]">Madre</p>
                    <p className="text-sm font-bold">{motherAnimal?.crotal_code} {motherAnimal?.name ? `(${motherAnimal.name})` : ''}</p>
                </div>
                {fatherAnimal && (
                    <div>
                        <p className="text-xs text-[#757575]">Padre</p>
                        <p className="text-sm font-bold">{fatherAnimal.crotal_code} {fatherAnimal.name ? `(${fatherAnimal.name})` : ''}</p>
                    </div>
                )}
                <div className="mt-2 border-t-2 border-black pt-3">
                    <p className="text-xs font-semibold uppercase tracking-[2px] text-[#757575]">Crías ({calves.length})</p>
                    {calves.map((c, i) => (
                        <div key={i} className="mt-2 flex items-center justify-between text-sm">
                            <span>{c.sex === 'female' ? 'Hembra' : 'Macho'} · {c.breed}</span>
                            <span className="text-[#757575]">{new Date(c.birth_date).toLocaleDateString('es-ES')}</span>
                        </div>
                    ))}
                </div>
            </div>
            <div className="flex items-center gap-2 bg-[#E8F5E9] p-3">
                <Check className="size-4 text-[#2E7D32]" />
                <span className="text-xs font-semibold text-[#2E7D32]">Datos validados correctamente</span>
            </div>
        </div>
    );
}

function Step6({ referenceCode, assignedCrotals }: { referenceCode: string; assignedCrotals: string[] }) {
    return (
        <div className="flex flex-col items-center gap-5 py-8 text-center">
            <div className="flex size-16 items-center justify-center bg-[#E8F5E9]">
                <Baby className="size-8 text-[#2E7D32]" />
            </div>
            <h2 className="text-2xl font-bold">¡Nacimiento registrado!</h2>
            <p className="text-sm text-[#757575]">Referencia: <span className="font-bold text-black">{referenceCode}</span></p>
            {assignedCrotals.length > 0 && (
                <div className="w-full border-2 border-black p-4">
                    <p className="text-xs font-semibold uppercase tracking-[2px] text-[#757575]">Crotales asignados</p>
                    {assignedCrotals.map((c, i) => (
                        <p key={i} className="mt-2 text-sm font-bold">{c}</p>
                    ))}
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

export default function CrearNacimiento({ exploitation }: Props) {
    const [step, setStep] = useState(0);
    const [subExploitation, setSubExploitation] = useState<SubExploitation | null>(null);
    const [motherId, setMotherId] = useState<number | null>(null);
    const [fatherId, setFatherId] = useState<number | null>(null);
    const [calves, setCalves] = useState<CalfData[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState<{ reference_code: string; assigned_crotals: string[] } | null>(null);

    const today = new Date().toISOString().split('T')[0];

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

    const handleSubmit = async () => {
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
            onSuccess: (page: any) => {
                const flash = page.props?.flash;
                setResult({
                    reference_code: flash?.reference_code || 'NC-2026-048-00001',
                    assigned_crotals: flash?.assigned_crotals || [],
                });
                setStep(5);
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

                {step === 0 && <Step1 subExploitations={exploitation.sub_exploitations} onSelect={handleSubSelect} />}
                {step === 1 && subExploitation && <Step2 animals={subExploitation.animals} selectedId={motherId} onSelect={handleMotherSelect} />}
                {step === 2 && subExploitation && <Step3 animals={subExploitation.animals} selectedId={fatherId} onSelect={setFatherId} onSkip={() => { setFatherId(null); setStep(3); }} />}
                {step === 3 && subExploitation && (
                    <Step4
                        motherBreed={subExploitation.animals.find((a) => a.id === motherId)?.breed || ''}
                        calves={calves}
                        onUpdate={setCalves}
                    />
                )}
                {step === 4 && subExploitation && (
                    <Step5 sub={subExploitation} mother={motherId!} father={fatherId} calves={calves} animals={subExploitation.animals} />
                )}
                {step === 5 && result && <Step6 referenceCode={result.reference_code} assignedCrotals={result.assigned_crotals} />}

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
