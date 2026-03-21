import { Head, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { home } from '@/routes';

const steps = [
    'Conectando con Giltza...',
    'Verificando identidad digital...',
    'Validando certificado electrónico...',
    'Firmando la sesión...',
];

export default function Giltza() {
    const [currentStep, setCurrentStep] = useState(0);
    const [progress, setProgress] = useState(0);
    const [verified, setVerified] = useState(false);

    useEffect(() => {
        const stepInterval = setInterval(() => {
            setCurrentStep((prev) => {
                if (prev < steps.length - 1) {
                    return prev + 1;
                }
                clearInterval(stepInterval);
                return prev;
            });
        }, 900);

        return () => clearInterval(stepInterval);
    }, []);

    useEffect(() => {
        const progressInterval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(progressInterval);
                    return 100;
                }
                return prev + 1;
            });
        }, 35);

        return () => clearInterval(progressInterval);
    }, []);

    useEffect(() => {
        if (progress === 100 && currentStep === steps.length - 1) {
            const timeout = setTimeout(() => setVerified(true), 400);
            return () => clearTimeout(timeout);
        }
    }, [progress, currentStep]);

    useEffect(() => {
        if (verified) {
            const redirect = setTimeout(() => {
                router.visit(home());
            }, 1500);
            return () => clearTimeout(redirect);
        }
    }, [verified]);

    return (
        <>
            <Head title="Firmando sesión — Giltza" />

            <div className="flex min-h-svh flex-col items-center justify-center bg-background p-6">
                <div className="flex w-full max-w-md flex-col items-center gap-10">
                    {/* Logo */}
                    <div className="flex flex-col items-center gap-3">
                        <img src="/nekazaria-logo.png" alt="NekazarIA" className="size-10" />
                        <span className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                            NekazarIA
                        </span>
                    </div>

                    {/* Shield animation */}
                    <div className="relative flex items-center justify-center">
                        {/* Outer rotating ring */}
                        <div
                            className={`absolute size-32 rounded-full border-2 border-dashed transition-all duration-1000 ${
                                verified
                                    ? 'border-success-foreground opacity-0 scale-110'
                                    : 'border-primary/30 animate-[spin_8s_linear_infinite]'
                            }`}
                        />

                        {/* Middle pulsing ring */}
                        <div
                            className={`absolute size-24 rounded-full border transition-all duration-700 ${
                                verified
                                    ? 'border-success-foreground bg-success scale-105'
                                    : 'border-primary/20 animate-[pulse_2s_ease-in-out_infinite]'
                            }`}
                        />

                        {/* Shield icon */}
                        <div
                            className={`relative z-10 flex size-16 items-center justify-center rounded-full transition-all duration-700 ${
                                verified
                                    ? 'bg-success-foreground text-white scale-110'
                                    : 'bg-primary text-primary-foreground'
                            }`}
                        >
                            {verified ? (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="size-8 animate-[scaleIn_0.3s_ease-out]"
                                >
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                            ) : (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="size-8"
                                >
                                    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
                                    <path d="M12 8v4" />
                                    <path d="M12 16h.01" />
                                </svg>
                            )}
                        </div>
                    </div>

                    {/* Title */}
                    <div className="flex flex-col items-center gap-2 text-center">
                        <h1 className="text-xl font-medium">
                            {verified
                                ? 'Sesión firmada correctamente'
                                : 'Firmando la sesión con Giltza'}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {verified
                                ? 'Redirigiendo a la aplicación...'
                                : 'Autenticación gubernamental mediante clave digital'}
                        </p>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full max-w-xs">
                        <div className="h-1.5 w-full overflow-hidden bg-secondary">
                            <div
                                className={`h-full transition-all duration-300 ease-out ${
                                    verified ? 'bg-success-foreground' : 'bg-primary'
                                }`}
                                style={{ width: `${progress}%` }}
                            />
                        </div>

                        {/* Step text */}
                        <div className="mt-4 flex items-center justify-center gap-2">
                            {!verified && (
                                <div className="size-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                            )}
                            <p className="text-xs text-muted-foreground">
                                {verified ? 'Verificación completada' : steps[currentStep]}
                            </p>
                        </div>
                    </div>

                    {/* Security badge */}
                    <div className="flex items-center gap-2 rounded-sm border border-border bg-secondary px-4 py-2">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="size-4 text-muted-foreground"
                        >
                            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                        <span className="text-xs text-muted-foreground">
                            Conexión segura · Gobierno Vasco
                        </span>
                    </div>
                </div>
            </div>
        </>
    );
}
