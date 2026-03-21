import { Head, router } from '@inertiajs/react';
import {
    Camera,
    FlashlightOff,
    Flashlight,
    Lightbulb,
    RefreshCw,
    Search,
    ScanSearch,
    Sun,
    Focus,
    ScanLine,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useCrotalOcr, normalizeCrotalCode } from '@/hooks/use-crotal-ocr';
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

type ScannerState =
    | 'instructions'
    | 'camera'
    | 'scanning'
    | 'result'
    | 'error'
    | 'permission_denied';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Mi Explotación', href: '/dashboard' },
    { title: 'Escanear Crotal', href: '/scanner' },
];

function ScanInstructions({
    onStart,
    onManual,
}: {
    onStart: () => void;
    onManual: () => void;
}) {
    const steps = [
        {
            icon: <Sun className="size-6 text-[#E53935]" />,
            title: 'Buena iluminación y cobertura',
            description:
                'Asegúrate de estar en un lugar bien iluminado y con cobertura de señal móvil.',
        },
        {
            icon: <Focus className="size-6 text-[#E53935]" />,
            title: 'Enfoca el crotal',
            description:
                'Dirige la cámara hacia el crotal del animal, a unos 10-15 cm de distancia.',
        },
        {
            icon: <ScanLine className="size-6 text-[#E53935]" />,
            title: 'Espera al reconocimiento',
            description:
                'Mantén el teléfono estable y espera a que el sistema identifique el código automáticamente.',
        },
    ];

    return (
        <div className="flex flex-1 flex-col justify-between p-6">
            <div className="flex flex-col gap-6">
                <div className="text-center">
                    <Camera className="mx-auto size-16 text-[#E53935]" />
                    <h2 className="mt-4 text-2xl font-bold">Escanear crotal</h2>
                    <p className="mt-2 text-sm text-[#757575]">
                        Sigue estos pasos para identificar al animal de forma
                        rápida y sencilla.
                    </p>
                </div>

                <div className="flex flex-col gap-4">
                    {steps.map((step, i) => (
                        <div
                            key={i}
                            className="flex items-start gap-4 border-2 border-black p-4"
                        >
                            <div className="flex size-10 shrink-0 items-center justify-center bg-[#FFEBEE]">
                                {step.icon}
                            </div>
                            <div>
                                <p className="text-sm font-bold">{`${i + 1}. ${step.title}`}</p>
                                <p className="mt-1 text-xs text-[#757575]">
                                    {step.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex flex-col gap-2 pt-6">
                <button
                    onClick={onStart}
                    className="w-full bg-[#E53935] py-[18px] text-center text-sm font-bold text-white"
                >
                    Comenzar escaneo
                </button>
                <button
                    onClick={onManual}
                    className="w-full border-2 border-black py-[18px] text-center text-sm font-semibold"
                >
                    Introducir código manualmente
                </button>
            </div>
        </div>
    );
}

const SCAN_INTERVAL_MS = 1000;
const SCAN_TIMEOUT_MS = 20000;

function CameraView({
    onResult,
    onError,
}: {
    onResult: (animal: AnimalResult) => void;
    onError: (lastDetected?: string) => void;
}) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const srcCanvasRef = useRef<HTMLCanvasElement>(null);
    const procCanvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const [torch, setTorch] = useState(false);
    const [hasTorch, setHasTorch] = useState(false);
    const [statusText, setStatusText] = useState('Enfoca el crotal del animal');
    const [debugText, setDebugText] = useState('');
    const [showDebug, setShowDebug] = useState(false);
    const { recognizeFrame, isProcessing, terminate } = useCrotalOcr();
    const scanningRef = useRef(true);
    const onErrorRef = useRef(onError);

    useEffect(() => {
        onErrorRef.current = onError;
    }, [onError]);

    useEffect(() => {
        let cancelled = false;

        (async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        facingMode: 'environment',
                        width: { ideal: 1920 },
                        height: { ideal: 1080 },
                    },
                });

                if (cancelled) {
                    stream.getTracks().forEach((t) => t.stop());

                    return;
                }

                streamRef.current = stream;

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }

                const track = stream.getVideoTracks()[0];
                const caps =
                    track.getCapabilities?.() as MediaTrackCapabilities & {
                        torch?: boolean;
                    };

                if (caps?.torch) {
                    setHasTorch(true);
                }
            } catch {
                if (!cancelled) {
                    onErrorRef.current();
                }
            }
        })();

        return () => {
            cancelled = true;
            scanningRef.current = false;
            streamRef.current?.getTracks().forEach((t) => t.stop());
            terminate();
        };
    }, [terminate]);

    const toggleTorch = async () => {
        const track = streamRef.current?.getVideoTracks()[0];

        if (track) {
            await track.applyConstraints({
                advanced: [{ torch: !torch } as MediaTrackConstraintSet],
            });
            setTorch(!torch);
        }
    };

    const onResultRef = useRef(onResult);

    useEffect(() => {
        onResultRef.current = onResult;
    }, [onResult]);

    // Demo mock: simulate scanning and always resolve to a hardcoded crotal
    const DEMO_CROTAL = 'ES480151123456';

    useEffect(() => {
        let active = true;

        const mockScan = async () => {
            // Simulate scanning animation for 2 seconds
            setStatusText('Analizando...');
            await new Promise((r) => setTimeout(r, 2000));

            if (!active || !scanningRef.current) {
                return;
            }

            setDebugText(DEMO_CROTAL);
            scanningRef.current = false;
            setStatusText('Crotal detectado, buscando animal...');

            try {
                const res = await fetch(
                    `/api/animals/by-crotal/${encodeURIComponent(DEMO_CROTAL)}`,
                );

                if (res.ok) {
                    const animal = await res.json();
                    onResultRef.current(animal);

                    return;
                }
            } catch {
                /* fall through */
            }

            onErrorRef.current(DEMO_CROTAL);
        };

        mockScan();

        return () => {
            active = false;
        };
    }, []);

    return (
        <div className="relative h-full w-full bg-[#1A1A1A]">
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="h-full w-full object-cover"
            />
            {/* Source canvas for full frame capture */}
            <canvas ref={srcCanvasRef} className="hidden" />
            {/* Processed canvas for binarized ROI — shown when debug is on */}
            <canvas
                ref={procCanvasRef}
                className={
                    showDebug
                        ? 'absolute bottom-20 left-2 z-50 h-24 w-40 border border-green-400'
                        : 'hidden'
                }
            />

            <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative h-48 w-72">
                    <div className="absolute inset-0 border-2 border-white/60" />
                    {isProcessing && (
                        <div className="absolute inset-x-0 top-0 h-0.5 animate-bounce bg-[#E53935]" />
                    )}
                </div>
            </div>

            <div className="absolute inset-x-0 top-8 text-center">
                <p className="text-sm font-medium text-white/90">
                    {statusText}
                </p>
                {showDebug && debugText && (
                    <p className="mt-1 font-mono text-xs text-green-400">
                        OCR: {debugText}
                    </p>
                )}
            </div>

            <div className="absolute inset-x-0 bottom-8 flex items-center justify-center gap-8">
                <button
                    onClick={() => setShowDebug((v) => !v)}
                    className="flex size-12 items-center justify-center bg-white/20 text-xs text-white"
                >
                    DBG
                </button>
                {hasTorch && (
                    <button
                        onClick={toggleTorch}
                        className="flex size-12 items-center justify-center bg-white/20 text-white"
                    >
                        {torch ? (
                            <Flashlight className="size-5" />
                        ) : (
                            <FlashlightOff className="size-5" />
                        )}
                    </button>
                )}
            </div>
        </div>
    );
}

function AnimalResultCard({
    animal,
    onScanAgain,
}: {
    animal: AnimalResult;
    onScanAgain: () => void;
}) {
    const [age] = useState(() =>
        Math.floor(
            (Date.now() - new Date(animal.birth_date).getTime()) /
                (365.25 * 24 * 60 * 60 * 1000),
        ),
    );

    return (
        <div className="flex flex-col gap-5 p-6">
            <div className="bg-[#E8F5E9] p-4 text-center">
                <p className="text-xs font-semibold text-[#2E7D32]">
                    Crotal identificado
                </p>
                <p className="mt-1 text-xl font-bold">{animal.crotal_code}</p>
            </div>

            <div className="flex flex-col gap-3 border-2 border-black p-4">
                <div className="flex justify-between">
                    <span className="text-xs font-semibold tracking-[2px] text-[#757575] uppercase">
                        Ficha del animal
                    </span>
                    <span
                        className={`px-2 py-0.5 text-xs font-bold ${animal.status === 'active' ? 'bg-[#E8F5E9] text-[#2E7D32]' : 'bg-[#FFEBEE] text-[#E53935]'}`}
                    >
                        {animal.status === 'active' ? 'Activo' : animal.status}
                    </span>
                </div>
                <div className="grid grid-cols-2 gap-y-3 text-sm">
                    <div>
                        <p className="text-xs text-[#757575]">Especie</p>
                        <p className="font-semibold capitalize">
                            {animal.species === 'bovine'
                                ? 'Bovino'
                                : animal.species === 'ovine'
                                  ? 'Ovino'
                                  : animal.species}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-[#757575]">Raza</p>
                        <p className="font-semibold">{animal.breed}</p>
                    </div>
                    <div>
                        <p className="text-xs text-[#757575]">Sexo</p>
                        <p className="font-semibold">
                            {animal.sex === 'female' ? 'Hembra' : 'Macho'}
                        </p>
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
                        <p className="font-semibold capitalize">
                            {animal.sub_exploitation.exploitation_type}
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <button
                    onClick={onScanAgain}
                    className="w-full bg-[#E53935] py-[18px] text-center text-sm font-bold text-white"
                >
                    Escanear otro
                </button>
                <button
                    onClick={() => router.visit('/dashboard')}
                    className="w-full border-2 border-black py-[18px] text-center text-sm font-semibold"
                >
                    Volver al panel
                </button>
            </div>
        </div>
    );
}

function ErrorView({
    onRetry,
    onResult,
    initialCode = '',
}: {
    onRetry: () => void;
    onResult: (animal: AnimalResult) => void;
    initialCode?: string;
}) {
    const [code, setCode] = useState(initialCode || 'ES');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const searchManual = async () => {
        const normalized = normalizeCrotalCode(code);

        if (!normalized) {
            setError('Formato inválido. Debe ser ES + 12 dígitos');

            return;
        }

        setError('');
        setLoading(true);

        try {
            const res = await fetch(
                `/api/animals/by-crotal/${encodeURIComponent(normalized)}`,
            );

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
        <div className="flex flex-col gap-5 overflow-y-auto p-6">
            <div className="flex flex-col items-center gap-3">
                <div className="flex size-16 items-center justify-center rounded-full bg-[#FFF3E0]">
                    <ScanSearch className="size-8 text-[#E65100]" />
                </div>
                <h2 className="text-xl font-bold">No pude leer el crotal</h2>
                <p className="text-center text-sm text-[#757575]">
                    Inténtalo de nuevo o introduce el número manualmente
                </p>
            </div>

            <button
                onClick={onRetry}
                className="flex w-full items-center justify-center gap-2 bg-[#E53935] py-[18px] text-sm font-bold text-white"
            >
                <RefreshCw className="size-4" />
                Intentar de nuevo
            </button>

            <div className="flex flex-col gap-3 border-2 border-[#FFF8E1] bg-[#FFFDE7] p-4">
                <div className="flex items-center gap-2">
                    <Lightbulb className="size-5 text-[#F9A825]" />
                    <span className="text-sm font-bold">
                        Consejos para un mejor escaneo
                    </span>
                </div>
                <ul className="flex flex-col gap-2 text-xs text-[#757575]">
                    <li className="flex items-start gap-2">
                        <span className="mt-0.5 size-1.5 shrink-0 rounded-full bg-[#F9A825]" />
                        Limpia el crotal con un trapo antes de escanear
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="mt-0.5 size-1.5 shrink-0 rounded-full bg-[#F9A825]" />
                        Acerca el móvil a 10-15 cm del crotal
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="mt-0.5 size-1.5 shrink-0 rounded-full bg-[#F9A825]" />
                        Busca buena iluminación, evita sombras sobre el crotal
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="mt-0.5 size-1.5 shrink-0 rounded-full bg-[#F9A825]" />
                        Mantén el móvil firme y espera a que enfoque
                    </li>
                </ul>
            </div>

            <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-[#E0E0E0]" />
                <span className="text-xs text-[#9E9E9E]">o</span>
                <div className="h-px flex-1 bg-[#E0E0E0]" />
            </div>

            <div className="flex flex-col gap-3">
                <p className="text-xs font-semibold tracking-[2px] uppercase">
                    Ingresar manualmente
                </p>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value.toUpperCase())}
                        placeholder="ES480123456789"
                        className="h-[52px] flex-1 bg-[#F5F5F5] px-[18px] text-sm font-medium"
                        maxLength={14}
                    />
                    <button
                        onClick={searchManual}
                        disabled={code.length < 10 || loading}
                        className="flex h-[52px] w-[52px] items-center justify-center bg-[#E53935] text-white disabled:opacity-50"
                    >
                        <Search className="size-5" />
                    </button>
                </div>
                <p className="text-xs text-[#9E9E9E]">
                    Formato: ES + 4 dígitos provincia + 3 municipio + 5
                    individual
                </p>
                {error && (
                    <p className="text-sm font-medium text-[#E53935]">
                        {error}
                    </p>
                )}
            </div>
        </div>
    );
}

function PermissionDenied({ onManual }: { onManual: () => void }) {
    return (
        <div className="flex flex-col items-center gap-5 p-6 pt-16">
            <Camera className="size-16 text-[#757575]" />
            <h2 className="text-xl font-bold">Acceso a cámara denegado</h2>
            <div className="flex flex-col gap-2 text-sm text-[#757575]">
                <p className="font-semibold text-black">
                    Para habilitar la cámara:
                </p>
                <p>iOS: Ajustes → Safari → Cámara → Permitir</p>
                <p>Android: Ajustes → Apps → Navegador → Permisos → Cámara</p>
            </div>
            <button
                onClick={onManual}
                className="w-full border-2 border-black py-[18px] text-center text-sm font-semibold"
            >
                Introducir código manualmente
            </button>
        </div>
    );
}

export default function ScannerIndex() {
    const [state, setState] = useState<ScannerState>('instructions');
    const [animal, setAnimal] = useState<AnimalResult | null>(null);
    const [lastDetectedCode, setLastDetectedCode] = useState('');

    const handleResult = (a: AnimalResult) => {
        setAnimal(a);
        setState('result');
    };

    const handleError = (detected?: string) => {
        if (detected) {
            setLastDetectedCode(detected);
        }

        setState('error');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Escanear Crotal" />
            <div className="flex h-full flex-col">
                {state === 'instructions' && (
                    <ScanInstructions
                        onStart={() => setState('camera')}
                        onManual={() => setState('error')}
                    />
                )}
                {state === 'camera' && (
                    <div className="relative min-h-[500px] flex-1">
                        <CameraView
                            onResult={handleResult}
                            onError={(detected) => {
                                if (state === 'camera') {
                                    handleError(detected);
                                }
                            }}
                        />
                    </div>
                )}
                {state === 'result' && animal && (
                    <AnimalResultCard
                        animal={animal}
                        onScanAgain={() => {
                            setAnimal(null);
                            setState('camera');
                        }}
                    />
                )}
                {state === 'error' && (
                    <ErrorView
                        onRetry={() => setState('camera')}
                        onResult={handleResult}
                        initialCode={lastDetectedCode}
                    />
                )}
                {state === 'permission_denied' && (
                    <PermissionDenied onManual={() => setState('error')} />
                )}

                {state === 'camera' && (
                    <div className="flex items-center justify-center border-t-2 border-black bg-white p-4">
                        <button
                            onClick={() => setState('error')}
                            className="text-sm font-semibold text-[#757575]"
                        >
                            Introducir código manualmente
                        </button>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
