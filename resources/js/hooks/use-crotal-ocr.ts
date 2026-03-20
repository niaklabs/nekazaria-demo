import { useCallback, useEffect, useRef, useState } from 'react';
import Tesseract from 'tesseract.js';

const PARTIAL_PREFIX = /ES\d{2}/i;

export function normalizeCrotalCode(raw: string): string | null {
    const cleaned = raw.replace(/[\s\-\n\r]/g, '').toUpperCase();
    const match = cleaned.match(/ES\d{12}/);

    return match ? match[0] : null;
}

function extractCrotalFromLines(text: string): string | null {
    const direct = normalizeCrotalCode(text);

    if (direct) {
        return direct;
    }

    const lines = text
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean);

    for (let i = 0; i < lines.length; i++) {
        const prefixMatch = lines[i].match(PARTIAL_PREFIX);

        if (!prefixMatch) {
            continue;
        }

        const collected = [lines[i]];

        for (let j = i + 1; j < Math.min(i + 3, lines.length); j++) {
            collected.push(lines[j]);
        }

        const combined = normalizeCrotalCode(collected.join(''));

        if (combined) {
            return combined;
        }
    }

    return null;
}

interface UseCrotalOcrReturn {
    recognizeFrame: (
        video: HTMLVideoElement,
        canvas: HTMLCanvasElement,
    ) => Promise<string | null>;
    isProcessing: boolean;
    terminate: () => void;
}

export function useCrotalOcr(): UseCrotalOcrReturn {
    const workerRef = useRef<Tesseract.Worker | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const initPromiseRef = useRef<Promise<Tesseract.Worker> | null>(null);

    const getWorker = useCallback(async (): Promise<Tesseract.Worker> => {
        if (workerRef.current) {
            return workerRef.current;
        }

        if (!initPromiseRef.current) {
            initPromiseRef.current = (async () => {
                const worker = await Tesseract.createWorker('eng');
                await worker.setParameters({
                    tessedit_char_whitelist:
                        'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
                });
                workerRef.current = worker;

                return worker;
            })();
        }

        return initPromiseRef.current;
    }, []);

    const recognizeFrame = useCallback(
        async (
            video: HTMLVideoElement,
            canvas: HTMLCanvasElement,
        ): Promise<string | null> => {
            if (isProcessing) {
                return null;
            }

            setIsProcessing(true);

            try {
                const worker = await getWorker();
                const ctx = canvas.getContext('2d');

                if (!ctx) {
                    return null;
                }

                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                ctx.drawImage(video, 0, 0);

                const { data } = await worker.recognize(canvas);
                const code = extractCrotalFromLines(data.text);

                return code;
            } catch (err) {
                console.warn('OCR recognition error:', err);

                return null;
            } finally {
                setIsProcessing(false);
            }
        },
        [getWorker, isProcessing],
    );

    const terminate = useCallback(() => {
        workerRef.current?.terminate();
        workerRef.current = null;
        initPromiseRef.current = null;
    }, []);

    useEffect(() => {
        return () => {
            terminate();
        };
    }, [terminate]);

    return { recognizeFrame, isProcessing, terminate };
}
