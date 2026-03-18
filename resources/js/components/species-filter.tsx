import { Beef } from 'lucide-react';

type SpeciesFilterProps = {
    species: string[];
    activeSpecies: string | null;
    onSelect: (species: string | null) => void;
};

const speciesLabels: Record<string, string> = {
    bovine: 'Bovino',
    ovine: 'Ovino',
    caprine: 'Caprino',
    porcine: 'Porcino',
    equine: 'Equino',
};

export function SpeciesFilter({ species, activeSpecies, onSelect }: SpeciesFilterProps) {
    return (
        <div className="flex gap-2 overflow-x-auto">
            <button
                onClick={() => onSelect(null)}
                className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold transition-colors ${
                    activeSpecies === null
                        ? 'bg-[#E53935] text-white'
                        : 'border-2 border-black bg-white text-black'
                }`}
            >
                Todos
            </button>
            {species.map((s) => (
                <button
                    key={s}
                    onClick={() => onSelect(s)}
                    className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold transition-colors ${
                        activeSpecies === s
                            ? 'bg-[#E53935] text-white'
                            : 'border-2 border-black bg-white text-black'
                    }`}
                >
                    {activeSpecies === s && s === 'bovine' && <Beef className="size-4" />}
                    {speciesLabels[s] ?? s}
                </button>
            ))}
        </div>
    );
}
