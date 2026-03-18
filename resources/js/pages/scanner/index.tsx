import { Head, router } from '@inertiajs/react';
import { ArrowLeft, Camera, CameraOff, FlashlightOff, Flashlight, Search, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface AnimalResult {
    id: number;
    crotal_code: string;
    species: string;
    breed: string;
    sex: string;
    name: string | null;
    birth_date: string;
    status: string;
    sub_exploitation: {
        id: number;
        species: string;
        exploitation_type: string;
    };
}

type ScannerState = 'camera' | 'scanning' | 'result' | 'error' | 'manual' | 'permission_denied';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Mi Explotación', href: '/dashboard' },
    { title: 'Escanear Crotal', href: '/scanner' },
];

function CameraView({ onResult, onError }: { onResult: (animal: AnimalResult) => void; onError: () => void }) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const [torch, setTorch] = useState(false);
    const [hasTorch, setHasTorch] = useState(false);
    const [scanning, setScanning] = useState(false);

    const startCamera = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            const track = stream.getVideoTracks()[0];
            const caps = track.getCapabilities?.() as MediaTrackCapabilities & { torch?: boolean };
            if (caps?.torch) setHasTorch(true);
        } catch {
            onError();
        }
    }, [onError]);

    useEffect(() => {
        startCamera();
        return () => {
            streamRef.current?.getTracks().forEach((t) => t.stop());
        };
    }, [startCamera]);

    const toggleTorch = async () => {
        const track = streamRef.current?.getVideoTracks()[0];
        if (track) {
            await track.applyConstraints({ advanced: [{ torch: !torch } as MediaTrackConstraintSet] });
            setTorch(!torch);
        }
    };

    const simulateScan = async () => {
        setScanning(true);
        await new Promise((r) => setTimeout(r, 1000 + Math.random() * 1000));

        if (Math.random() > 0.1) {
            try {
                const res = await fetch('/api/animals/random-crotal');
                if (res.ok) {
                    const animal = await res.json();
                    onResult(animal);
                    return;
                }
            } catch { /* fall through */ }
        }
        setScanning(false);
        onError();
    };

    useEffect(() => {
        if (!scanning) {
            const timer = setTimeout(simulateScan, 2000);
            return () => clearTimeout(timer);
        }
    }, [scanning]);

    return (
        <div className="relative h-full w-full bg-[#1A1A1A]">
            <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" />

            <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative h-48 w-72">
                    <div className="absolute inset-0 border-2 border-white/60" />
                    {scanning && (
                        <div className="absolute inset-x-0 top-0 h-0.5 animate-bounce bg-[#E53935]" />
                    )}
                </div>
            </div>

            <div className="absolute inset-x-0 top-8 text-center">
                <p className="text-sm font-medium text-white/90">
                    {scanning ? 'Buscando crotal...' : 'Enfoca el crotal del animal'}
                </p>
            </div>

            <div className="absolute inset-x-0 bottom-8 flex items-center justify-center gap-8">
                {hasTorch && (
                    <button onClick={toggleTorch} className="flex size-12 items-center justify-center bg-white/20 text-white">
                        {torch ? <Flashlight className="size-5" /> : <FlashlightOff className="size-5" />}
                    </button>
                )}
            </div>
        </div>
    );
}

function AnimalResultCard({ animal, onScanAgain }: { animal: AnimalResult; onScanAgain: () => void }) {
    const age = Math.floor((Date.now() - new Date(animal.birth_date).getTime()) / (365.25 * 24 * 60 * 60 * 1000));

    return (
        <div className="flex flex-col gap-5 p-6">
            <div className="bg-[#E8F5E9] p-4 text-center">
                <p className="text-xs font-semibold text-[#2E7D32]">Crotal identificado</p>
                <p className="mt-1 text-xl font-bold">{animal.crotal_code}</p>
            </div>

            <div className="flex flex-col gap-3 border-2 border-black p-4">
                <div className="flex justify-between">
                    <span className="text-xs font-semibold uppercase tracking-[2px] text-[#757575]">Ficha del animal</span>
                    <span className={`px-2 py-0.5 text-xs font-bold ${animal.status === 'active' ? 'bg-[#E8F5E9] text-[#2E7D32]' : 'bg-[#FFEBEE] text-[#E53935]'}`}>
                        {animal.status === 'active' ? 'Activo' : animal.status}
                    </span>
                </div>
                <div className="grid grid-cols-2 gap-y-3 text-sm">
                    <div>
                        <p className="text-xs text-[#757575]">Especie</p>
                        <p className="font-semibold capitalize">{animal.species === 'bovine' ? 'Bovino' : animal.species === 'ovine' ? 'Ovino' : animal.species}</p>
                    </div>
                    <div>
                        <p className="text-xs text-[#757575]">Raza</p>
                        <p className="font-semibold">{animal.breed}</p>
                    </div>
                    <div>
                        <p className="text-xs text-[#757575]">Sexo</p>
                        <p className="font-semibold">{animal.sex === 'female' ? 'Hembra' : 'Macho'}</p>
                    </div>
                    <div>
                        <p className="text-xs text-[#757575]">Edad</p>
                        <p className="font-semibold">{age} años</p>
                    </div>
                    {animal.name && (
                        <div className="col-span-2">
                            <p className="text-xs text-[#757575]">Nombre</p>
                            <p className="font-semibold">{animal.name}</p>
                        </div>
                    )}
                    <div className="col-span-2">
                        <p className="text-xs text-[#757575]">Subexplotación</p>
                        <p className="font-semibold capitalize">{animal.sub_exploitation.exploitation_type}</p>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <button onClick={onScanAgain} className="w-full bg-[#E53935] py-[18px] text-center text-sm font-bold text-white">
                    Escanear otro
                </button>
                <button onClick={() => router.visit('/dashboard')} className="w-full border-2 border-black py-[18px] text-center text-sm font-semibold">
                    Volver al panel
                </button>
            </div>
        </div>
    );
}

function ErrorView({ onRetry, onManual }: { onRetry: () => void; onManual: () => void }) {
    return (
        <div className="flex flex-col items-center gap-5 p-6 pt-16">
            <CameraOff className="size-16 text-[#757575]" />
            <h2 className="text-xl font-bold">No se ha podido leer el crotal</h2>
            <div className="flex flex-col gap-3 text-sm text-[#757575]">
                <p className="flex items-center gap-2">Limpia el crotal si está sucio</p>
                <p className="flex items-center gap-2">Acerca el teléfono a 10-15 cm</p>
                <p className="flex items-center gap-2">Busca buena iluminación</p>
                <p className="flex items-center gap-2">Mantén el teléfono estable</p>
            </div>
            <div className="flex w-full flex-col gap-2">
                <button onClick={onRetry} className="w-full bg-[#E53935] py-[18px] text-center text-sm font-bold text-white">
                    Reintentar
                </button>
                <button onClick={onManual} className="w-full border-2 border-black py-[18px] text-center text-sm font-semibold">
                    Introducir código manualmente
                </button>
            </div>
        </div>
    );
}

function ManualInput({ onResult }: { onResult: (animal: AnimalResult) => void }) {
    const [code, setCode] = useState('ES');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const search = async () => {
        setError('');
        setLoading(true);
        try {
            const res = await fetch(`/api/animals/by-crotal/${code}`);
            if (res.ok) {
                onResult(await res.json());
            } else {
                setError('Animal no encontrado');
            }
        } catch {
            setError('Error de conexión');
        }
        setLoading(false);
    };

    return (
        <div className="flex flex-col gap-5 p-6">
            <h2 className="text-2xl font-bold">Introducir código</h2>
            <p className="text-sm text-[#757575]">Escribe el código del crotal (formato: ES + 13 dígitos)</p>
            <div className="flex gap-2">
                <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="ES0480123000101"
                    className="h-[52px] flex-1 bg-[#F5F5F5] px-[18px] text-sm font-medium"
                    maxLength={15}
                />
                <button
                    onClick={search}
                    disabled={code.length < 10 || loading}
                    className="flex h-[52px] w-[52px] items-center justify-center bg-[#E53935] text-white disabled:opacity-50"
                >
                    <Search className="size-5" />
                </button>
            </div>
            {error && <p className="text-sm font-medium text-[#E53935]">{error}</p>}
        </div>
    );
}

function PermissionDenied({ onManual }: { onManual: () => void }) {
    return (
        <div className="flex flex-col items-center gap-5 p-6 pt-16">
            <Camera className="size-16 text-[#757575]" />
            <h2 className="text-xl font-bold">Acceso a cámara denegado</h2>
            <div className="flex flex-col gap-2 text-sm text-[#757575]">
                <p className="font-semibold text-black">Para habilitar la cámara:</p>
                <p>iOS: Ajustes → Safari → Cámara → Permitir</p>
                <p>Android: Ajustes → Apps → Navegador → Permisos → Cámara</p>
            </div>
            <button onClick={onManual} className="w-full border-2 border-black py-[18px] text-center text-sm font-semibold">
                Introducir código manualmente
            </button>
        </div>
    );
}

export default function ScannerIndex() {
    const [state, setState] = useState<ScannerState>('camera');
    const [animal, setAnimal] = useState<AnimalResult | null>(null);

    const handleResult = (a: AnimalResult) => {
        setAnimal(a);
        setState('result');
    };

    const handleError = () => setState('error');
    const handlePermissionDenied = () => setState('permission_denied');

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Escanear Crotal" />
            <div className="flex h-full flex-col">
                {state === 'camera' && (
                    <div className="relative min-h-[500px] flex-1">
                        <CameraView onResult={handleResult} onError={() => { if (state === 'camera') handleError(); }} />
                    </div>
                )}
                {state === 'result' && animal && (
                    <AnimalResultCard animal={animal} onScanAgain={() => { setAnimal(null); setState('camera'); }} />
                )}
                {state === 'error' && (
                    <ErrorView onRetry={() => setState('camera')} onManual={() => setState('manual')} />
                )}
                {state === 'manual' && <ManualInput onResult={handleResult} />}
                {state === 'permission_denied' && <PermissionDenied onManual={() => setState('manual')} />}

                {(state === 'camera') && (
                    <div className="flex items-center justify-center border-t-2 border-black bg-white p-4">
                        <button onClick={() => setState('manual')} className="text-sm font-semibold text-[#757575]">
                            Introducir código manualmente
                        </button>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
