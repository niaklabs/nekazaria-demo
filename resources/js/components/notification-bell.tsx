import { Link } from '@inertiajs/react';
import { Bell } from 'lucide-react';

type NotificationBellProps = {
    count: number;
};

export function NotificationBell({ count }: NotificationBellProps) {
    return (
        <Link
            href="/normativa"
            className="relative flex size-12 shrink-0 items-center justify-center rounded-full bg-neutral-100 transition-colors hover:bg-neutral-200"
            prefetch
        >
            <Bell className="size-5 text-black" />
            {count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex size-5 items-center justify-center rounded-full bg-[#E53935] text-[10px] font-bold text-white">
                    {count > 9 ? '9+' : count}
                </span>
            )}
        </Link>
    );
}
