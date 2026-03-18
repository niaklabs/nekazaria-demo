import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Share, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
    prompt(): Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

function isIos(): boolean {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !('MSStream' in window);
}

function isInStandaloneMode(): boolean {
    return (
        window.matchMedia('(display-mode: standalone)').matches ||
        ('standalone' in navigator && (navigator as unknown as { standalone: boolean }).standalone === true)
    );
}

const DISMISSED_KEY = 'pwa-install-dismissed';
const DISMISS_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function wasDismissedRecently(): boolean {
    const dismissed = localStorage.getItem(DISMISSED_KEY);
    if (!dismissed) return false;
    return Date.now() - Number(dismissed) < DISMISS_DURATION_MS;
}

export default function PwaInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showIosPrompt, setShowIosPrompt] = useState(false);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (isInStandaloneMode() || wasDismissedRecently()) return;

        if (isIos()) {
            setShowIosPrompt(true);
            setVisible(true);
            return;
        }

        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            setVisible(true);
        };

        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setVisible(false);
        }
        setDeferredPrompt(null);
    };

    const handleDismiss = () => {
        localStorage.setItem(DISMISSED_KEY, String(Date.now()));
        setVisible(false);
    };

    if (!visible) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md animate-in slide-in-from-bottom-4 fade-in duration-300 md:left-auto md:right-6">
            <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-4 shadow-lg">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Download className="size-5 text-primary" />
                </div>

                <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-card-foreground">
                        Instalar NekazarIA
                    </p>

                    {showIosPrompt ? (
                        <p className="mt-1 text-xs text-muted-foreground">
                            Toca <Share className="inline size-3.5 align-text-bottom" /> y luego
                            {' '}<span className="font-medium">"Agregar a pantalla de inicio"</span>.
                        </p>
                    ) : (
                        <>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Accede mas rapido desde tu pantalla de inicio.
                            </p>
                            <div className="mt-2 flex gap-2">
                                <Button size="sm" onClick={handleInstall}>
                                    Instalar
                                </Button>
                                <Button size="sm" variant="ghost" onClick={handleDismiss}>
                                    Ahora no
                                </Button>
                            </div>
                        </>
                    )}
                </div>

                <button
                    onClick={handleDismiss}
                    className="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    aria-label="Cerrar"
                >
                    <X className="size-4" />
                </button>
            </div>
        </div>
    );
}
