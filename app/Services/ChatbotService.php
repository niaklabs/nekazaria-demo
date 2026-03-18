<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Str;

class ChatbotService
{
    /**
     * @return array{content: string, quick_replies: array<string>}
     */
    public function respond(string $message, User $user): array
    {
        $context = $this->gatherContext($user);
        $pattern = $this->matchPattern($message);

        $content = $this->renderTemplate($pattern['template'], $context);
        $quickReplies = $pattern['quick_replies'];

        return [
            'content' => $content,
            'quick_replies' => $quickReplies,
        ];
    }

    /**
     * @return array{template: string, quick_replies: array<string>}
     */
    private function matchPattern(string $message): array
    {
        $message = Str::lower($message);
        $patterns = $this->getPatterns();

        foreach ($patterns as $pattern) {
            foreach ($pattern['keywords'] as $keyword) {
                if (Str::contains($message, $keyword)) {
                    return $pattern;
                }
            }
        }

        return $this->defaultPattern();
    }

    /**
     * @return array<int, array{keywords: array<string>, template: string, quick_replies: array<string>}>
     */
    private function getPatterns(): array
    {
        return [
            [
                'keywords' => ['hola', 'buenos días', 'buenas'],
                'template' => '¡Hola {farmer_name}! ¿En qué puedo ayudarte hoy?',
                'quick_replies' => ['Mis animales', 'Mis alertas', 'Hacer un trámite'],
            ],
            [
                'keywords' => ['animales', 'cuantos', 'tengo'],
                'template' => 'Tienes {animal_count} animales en tu explotación. {animal_by_species_summary}.',
                'quick_replies' => ['Ver mis bovinos', 'Ver mis ovinos'],
            ],
            [
                'keywords' => ['bloqueado', 'inmovilizado', 'problema'],
                'template' => 'Tienes {immobilized_count} animales inmovilizados por la campaña {campaign_name}. Para desbloquearlos debes completar el muestreo. ¿Quieres que te explique cómo?',
                'quick_replies' => ['Sí, explícame', 'Ver animales bloqueados'],
            ],
            [
                'keywords' => ['nacimiento', 'registrar', 'cría', 'parir'],
                'template' => 'Para comunicar un nacimiento, necesitas saber la madre y la fecha de parto. El plazo legal es de 7 días. ¿Quieres que te guíe paso a paso?',
                'quick_replies' => ['Empezar registro', '¿Qué necesito?'],
            ],
            [
                'keywords' => ['movimiento', 'guía', 'trasladar', 'mover'],
                'template' => 'Para mover animales necesitas una guía de movimiento. Te hará falta saber: destino, animales, fecha y medio de transporte. ¿Empezamos?',
                'quick_replies' => ['Crear guía', '¿Qué tipos hay?'],
            ],
            [
                'keywords' => ['campaña', 'sanitaria', 'bvd', 'tuberculosis'],
                'template' => 'Tienes la campaña {campaign_name} activa. Progreso: {sampled}/{total} animales muestreados. Te quedan {pending} pendientes.',
                'quick_replies' => ['Ver pendientes', '¿Cuándo termina?'],
            ],
            [
                'keywords' => ['alerta', 'alertas', 'normativa', 'regulacion'],
                'template' => 'Tienes {regulation_count} alertas pendientes. ¿Quieres que te explique la más urgente?',
                'quick_replies' => ['Sí, explícame', 'Ver todas las alertas'],
            ],
            [
                'keywords' => ['ayuda', 'help', 'no entiendo'],
                'template' => 'Estoy aquí para ayudarte. Puedo resolver dudas sobre tus animales, trámites, campañas sanitarias, o alertas. ¿Sobre qué quieres preguntar?',
                'quick_replies' => ['Mis animales', 'Mis alertas', 'Hacer un trámite'],
            ],
            [
                'keywords' => ['explicame', 'explícame', 'facil', 'fácil', 'sencillo', 'qué significa'],
                'template' => '¡Claro! Te lo explico en sencillo: las campañas sanitarias son controles obligatorios que hace la Diputación para asegurar que los animales están sanos. Si tienes animales pendientes, el veterinario debe tomar muestras antes de la fecha límite.',
                'quick_replies' => ['Mis campañas', 'Mis animales', 'Ayuda'],
            ],
        ];
    }

    /**
     * @return array{keywords: array<string>, template: string, quick_replies: array<string>}
     */
    private function defaultPattern(): array
    {
        return [
            'keywords' => [],
            'template' => 'No he entendido del todo. ¿Puedes decírmelo de otra forma? También puedes preguntarme sobre tus animales, trámites, campañas o alertas.',
            'quick_replies' => ['Mis animales', 'Mis alertas', 'Ayuda'],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function gatherContext(User $user): array
    {
        $exploitation = $user->exploitations()->with(['subExploitations.animals', 'sanitaryCampaigns', 'regulations'])->first();

        $animalCount = 0;
        $speciesCounts = [];
        $speciesSubs = [];

        if ($exploitation) {
            foreach ($exploitation->subExploitations as $sub) {
                $count = $sub->animals->count();
                $animalCount += $count;
                $species = $sub->species ?? 'otros';
                $speciesCounts[$species] = ($speciesCounts[$species] ?? 0) + $count;
                $speciesSubs[$species] = $sub->exploitation_type ?? $species;
            }
        }

        $speciesSummaryParts = [];
        foreach ($speciesCounts as $species => $count) {
            $speciesSummaryParts[] = "{$count} {$species}";
        }
        $speciesSummary = implode(' y ', $speciesSummaryParts) ?: 'sin animales registrados';

        $activeCampaign = $exploitation?->sanitaryCampaigns()->where('status', 'active')->first();
        $sampled = $activeCampaign?->sampled_animals ?? 0;
        $total = $activeCampaign?->total_animals ?? 0;
        $pending = $total - $sampled;

        $immobilizedCount = 0;
        if ($exploitation) {
            foreach ($exploitation->subExploitations as $sub) {
                $immobilizedCount += $sub->animals->where('status', 'immobilized')->count();
            }
        }

        $regulationCount = $exploitation?->regulations()->where('is_resolved', false)->count() ?? 0;

        return [
            'farmer_name' => Str::before($user->name, ' '),
            'animal_count' => $animalCount,
            'animal_by_species_summary' => $speciesSummary,
            'campaign_name' => $activeCampaign?->name ?? 'sin campaña activa',
            'sampled' => $sampled,
            'total' => $total,
            'pending' => $pending,
            'immobilized_count' => $immobilizedCount,
            'regulation_count' => $regulationCount,
        ];
    }

    /**
     * @param  array<string, mixed>  $context
     */
    private function renderTemplate(string $template, array $context): string
    {
        $replacements = [];
        foreach ($context as $key => $value) {
            $replacements["{{$key}}"] = (string) $value;
        }

        return strtr($template, $replacements);
    }
}
