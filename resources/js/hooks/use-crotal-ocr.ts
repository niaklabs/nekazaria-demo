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

/**
 * Preprocesses a video frame for OCR:
 * 1. Crops to the center ROI (scanning rectangle area)
 * 2. Upscales 2x for better Tesseract accuracy
 * 3. Binarizes: dark text → black, everything else → white
 */
function preprocessFrame(
    video: HTMLVideoElement,
    srcCanvas: HTMLCanvasElement,
    procCanvas: HTMLCanvasElement,
): void {
    const vw = video.videoWidth;
    const vh = video.videoHeight;

    if (vw === 0 || vh === 0) {
        return;
    }

    // Crop center ROI matching the on-screen scanning rectangle proportions
    const roiW = Math.round(vw * 0.55);
    const roiH = Math.round(vh * 0.45);
    const roiX = Math.round((vw - roiW) / 2);
    const roiY = Math.round((vh - roiH) / 2);

    // Draw full frame to source canvas
    srcCanvas.width = vw;
    srcCanvas.height = vh;
    const srcCtx = srcCanvas.getContext('2d', { willReadFrequently: true })!;
    srcCtx.drawImage(video, 0, 0);

    // Upscale 2x (enough for Tesseract, smaller = faster)
    const scale = 2;
    const outW = roiW * scale;
    const outH = roiH * scale;

    procCanvas.width = outW;
    procCanvas.height = outH;
    const ctx = procCanvas.getContext('2d', { willReadFrequently: true })!;

    // Draw cropped + upscaled ROI
    ctx.drawImage(srcCanvas, roiX, roiY, roiW, roiH, 0, 0, outW, outH);

    // Binarize: isolate dark text from background
    const imageData = ctx.getImageData(0, 0, outW, outH);
    const d = imageData.data;

    for (let i = 0; i < d.length; i += 4) {
        const r = d[i];
        const g = d[i + 1];
        const b = d[i + 2];

        // Luminance-weighted grayscale
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;

        // Threshold: dark pixels (text) → black, light pixels (background) → white
        const isText = gray < 130;

        d[i] = isText ? 0 : 255;
        d[i + 1] = isText ? 0 : 255;
        d[i + 2] = isText ? 0 : 255;
    }

    ctx.putImageData(imageData, 0, 0);
}

export interface OcrResult {
    code: string | null;
    rawText: string;
}

interface UseCrotalOcrReturn {
    recognizeFrame: (
        video: HTMLVideoElement,
        srcCanvas: HTMLCanvasElement,
        procCanvas: HTMLCanvasElement,
    ) => Promise<OcrResult>;
    isProcessing: boolean;
    terminate: () => void;
}

export function useCrotalOcr(): UseCrotalOcrReturn {
    const workerRef = useRef<Tesseract.Worker | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const processingRef = useRef(false);
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

    // Stable reference — does not change between renders
    const recognizeFrame = useCallback(
        async (
            video: HTMLVideoElement,
            srcCanvas: HTMLCanvasElement,
            procCanvas: HTMLCanvasElement,
        ): Promise<OcrResult> => {
            // Use ref for guard so this callback stays stable
            if (processingRef.current) {
                return { code: null, rawText: '' };
            }

            processingRef.current = true;
            setIsProcessing(true);

            try {
                const worker = await getWorker();

                preprocessFrame(video, srcCanvas, procCanvas);

                const { data } = await worker.recognize(procCanvas);
                const code = extractCrotalFromLines(data.text);

                return { code, rawText: data.text.replace(/\n/g, ' ').trim() };
            } catch (err) {
                console.warn('OCR recognition error:', err);

                return { code: null, rawText: '' };
            } finally {
                processingRef.current = false;
                setIsProcessing(false);
            }
        },
        [getWorker],
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
