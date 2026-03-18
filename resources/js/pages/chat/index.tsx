import { Head, usePage } from '@inertiajs/react';
import { Bot, Send } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, SharedData } from '@/types';

interface Message {
    id: number;
    role: 'user' | 'assistant';
    content: string;
    quick_replies: string[] | null;
    created_at: string;
}

interface Conversation {
    id: number;
    messages: Message[];
}

interface Props {
    conversation: Conversation;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Mi Explotación', href: '/dashboard' },
    { title: 'NekazarIA Chat', href: '/chat' },
];

function TypingIndicator() {
    return (
        <div className="flex items-end gap-2">
            <div className="flex size-8 shrink-0 items-center justify-center bg-[#E53935] text-white">
                <Bot className="size-4" />
            </div>
            <div className="flex gap-1 bg-[#F5F5F5] px-4 py-3">
                <span className="inline-block size-2 animate-bounce rounded-full bg-[#757575] [animation-delay:0ms]" />
                <span className="inline-block size-2 animate-bounce rounded-full bg-[#757575] [animation-delay:150ms]" />
                <span className="inline-block size-2 animate-bounce rounded-full bg-[#757575] [animation-delay:300ms]" />
            </div>
        </div>
    );
}

function ChatBubble({ message }: { message: Message }) {
    const isUser = message.role === 'user';

    return (
        <div className={`flex items-end gap-2 ${isUser ? 'flex-row-reverse' : ''}`}>
            {!isUser && (
                <div className="flex size-8 shrink-0 items-center justify-center bg-[#E53935] text-white">
                    <Bot className="size-4" />
                </div>
            )}
            <div className={`max-w-[80%] px-4 py-3 text-sm leading-[1.4] ${isUser ? 'bg-[#E53935] text-white' : 'bg-[#F5F5F5] text-black'}`}>
                {message.content}
            </div>
        </div>
    );
}

export default function ChatIndex({ conversation }: Props) {
    const { auth } = usePage<SharedData>().props;
    const [messages, setMessages] = useState<Message[]>(conversation.messages || []);
    const [input, setInput] = useState('');
    const [typing, setTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }, [messages, typing]);

    const sendMessage = async (text: string) => {
        if (!text.trim()) return;
        setInput('');

        const userMsg: Message = {
            id: Date.now(),
            role: 'user',
            content: text.trim(),
            quick_replies: null,
            created_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, userMsg]);
        setTyping(true);

        try {
            const res = await fetch('/chat/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content || '',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ message: text.trim() }),
            });

            if (res.ok) {
                const data = await res.json();
                await new Promise((r) => setTimeout(r, 500 + Math.random() * 1000));
                setMessages((prev) => [...prev, data.message]);
            }
        } catch {
            setMessages((prev) => [...prev, {
                id: Date.now() + 1,
                role: 'assistant',
                content: 'Lo siento, ha ocurrido un error. Intenta de nuevo.',
                quick_replies: ['Ayuda'],
                created_at: new Date().toISOString(),
            }]);
        }
        setTyping(false);
        inputRef.current?.focus();
    };

    const lastAssistantMsg = [...messages].reverse().find((m) => m.role === 'assistant');

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="NekazarIA Chat" />
            <div className="flex h-[calc(100vh-8rem)] flex-col">
                <div className="flex items-center gap-3 border-b-2 border-black px-4 py-3">
                    <div className="flex size-10 items-center justify-center bg-[#E53935] text-white">
                        <Bot className="size-5" />
                    </div>
                    <div>
                        <p className="text-sm font-bold">NekazarIA Laguntzailea</p>
                        <p className="text-xs text-[#2E7D32]">En línea</p>
                    </div>
                </div>

                <div ref={scrollRef} className="flex-1 overflow-y-auto p-4">
                    <div className="flex flex-col gap-4">
                        {messages.length === 0 && (
                            <div className="flex flex-col items-center gap-3 py-8 text-center">
                                <div className="flex size-16 items-center justify-center bg-[#F5F5F5]">
                                    <Bot className="size-8 text-[#757575]" />
                                </div>
                                <p className="text-sm text-[#757575]">Escribe un mensaje o usa las opciones rápidas</p>
                            </div>
                        )}

                        {messages.map((msg) => (
                            <ChatBubble key={msg.id} message={msg} />
                        ))}

                        {typing && <TypingIndicator />}
                    </div>
                </div>

                {lastAssistantMsg?.quick_replies && lastAssistantMsg.quick_replies.length > 0 && !typing && (
                    <div className="flex gap-2 overflow-x-auto border-t border-[#E0E0E0] px-4 py-2">
                        {lastAssistantMsg.quick_replies.map((reply) => (
                            <button
                                key={reply}
                                onClick={() => sendMessage(reply)}
                                className="shrink-0 border-2 border-black px-3 py-1.5 text-xs font-semibold hover:bg-[#F5F5F5]"
                            >
                                {reply}
                            </button>
                        ))}
                    </div>
                )}

                <div className="flex items-center gap-2 border-t-2 border-black p-4">
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
                        placeholder="Escribe tu mensaje..."
                        className="h-[44px] flex-1 bg-[#F5F5F5] px-4 text-sm"
                    />
                    <button
                        onClick={() => sendMessage(input)}
                        disabled={!input.trim() || typing}
                        className="flex size-[44px] items-center justify-center bg-[#E53935] text-white disabled:opacity-50"
                    >
                        <Send className="size-5" />
                    </button>
                </div>
            </div>
        </AppLayout>
    );
}
