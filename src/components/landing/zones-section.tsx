import { CircleCheck, Info, MapIcon, Plug, Sun } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import type { Tip, TipIcon } from '@/lib/landing-data';

const tipIcons: Record<TipIcon, typeof Sun> = {
  luz: Sun,
  enchufe: Plug,
  info: Info,
};

type ZonesSectionProps = {
  zones: string[];
  tips: Tip[];
  whatsappUrl: string;
  hours: string;
};

export function ZonesSection({
  zones,
  tips,
  whatsappUrl,
  hours,
}: ZonesSectionProps) {
  return (
    <section
      id="zonas"
      aria-labelledby="zonas-title"
      className="mx-auto max-w-7xl scroll-mt-16 px-4 py-16 md:px-8"
    >
      <div className="flex max-w-2xl flex-col gap-2">
        <h2
          id="zonas-title"
          className="font-serif text-3xl tracking-tight md:text-4xl"
        >
          Vamos hasta donde estés
        </h2>
        <p className="text-muted-foreground">
          Atendemos en tu casa, apartamento u oficina. {hours}.
        </p>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <Card className="[--card-spacing:--spacing(8)]">
          <CardHeader>
            <h3 className="flex items-center gap-2 text-lg leading-7 font-semibold">
              <MapIcon className="size-5 text-primary" aria-hidden="true" />
              Zonas de atención
            </h3>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <ul className="flex flex-wrap gap-2">
              {zones.map((zone) => (
                <li key={zone}>
                  <Badge variant="secondary" className="h-7 px-3 text-sm">
                    {zone}
                  </Badge>
                </li>
              ))}
            </ul>
            <p className="border-t pt-4 text-sm text-muted-foreground">
              ¿Tu zona no aparece?{' '}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-sm font-medium text-primary underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                Escríbenos
              </a>{' '}
              y lo revisamos.
            </p>
          </CardContent>
        </Card>

        <Card className="[--card-spacing:--spacing(8)]">
          <CardHeader>
            <h3 className="flex items-center gap-2 text-lg leading-7 font-semibold">
              <CircleCheck className="size-5 text-primary" aria-hidden="true" />
              Para que todo salga bien
            </h3>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-3.5">
              {tips.map((tip) => {
                const Icon = tipIcons[tip.icono];
                return (
                  <li key={tip.texto} className="flex gap-2.5 text-sm">
                    <Icon
                      className="mt-0.5 size-4 shrink-0 text-primary"
                      aria-hidden="true"
                    />
                    {tip.texto}
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
