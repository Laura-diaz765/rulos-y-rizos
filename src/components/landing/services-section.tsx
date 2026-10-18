import Image, { type StaticImageData } from 'next/image';

import { ArrowRight, Clock, Sparkles } from 'lucide-react';

import cejas from '@/assets/cejas.webp';
import corteDama from '@/assets/corte-dama.webp';
import corteHombre from '@/assets/corte-hombre.webp';
import keratina from '@/assets/keratina.webp';
import manicure from '@/assets/manicure.webp';
import maquillaje from '@/assets/maquillaje.webp';
import mechas from '@/assets/mechas.webp';
import pedicure from '@/assets/pedicure.webp';
import peinado from '@/assets/peinado.webp';
import rizos from '@/assets/rizos.webp';
import tinteColor from '@/assets/tinte-color.webp';
import tratamientoCapilar from '@/assets/tratamiento-capilar.webp';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
} from '@/components/ui/card';
import { formatPrice, type Service } from '@/lib/landing-data';

// Imported from src/assets so Next.js bundles them (string paths only work for
// files in /public). Services without an entry fall back to a placeholder.
const serviceImages: Record<string, StaticImageData> = {
  'corte-dama': corteDama,
  'corte-caballero': corteHombre,
  tinte: tinteColor,
  'mechas-balayage': mechas,
  'alisado-keratina': keratina,
  'tratamiento-capilar': tratamientoCapilar,
  'maquillaje-social': maquillaje,
  peinado,
  'definicion-de-rizos': rizos,
  manicure,
  pedicure,
  cejas,
};

type ServicesSectionProps = {
  services: Service[];
  bookingHref: string;
};

export function ServicesSection({
  services,
  bookingHref,
}: ServicesSectionProps) {
  return (
    <section
      id="servicios"
      aria-labelledby="servicios-title"
      className="scroll-mt-16 border-y bg-muted"
    >
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-20">
        <div className="flex max-w-2xl flex-col gap-2">
          <h2
            id="servicios-title"
            className="font-serif text-3xl tracking-tight md:text-4xl"
          >
            Servicios y precios
          </h2>
          <p className="text-muted-foreground">
            Elige uno o varios servicios en la misma cita. El total y la
            duración se calculan solos antes de confirmar.
          </p>
        </div>

        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <li key={service.id} className="flex">
              <Card className="w-full pt-0 shadow-sm [--card-spacing:--spacing(6)]">
                <div className="relative aspect-4/3 w-full overflow-hidden bg-secondary">
                  {serviceImages[service.id] ? (
                    <Image
                      src={serviceImages[service.id]}
                      alt={service.nombre}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center text-primary/60">
                      <Sparkles className="size-10" aria-hidden="true" />
                    </div>
                  )}
                </div>
                <CardHeader>
                  <h3 className="text-lg leading-7 font-semibold">
                    {service.nombre}
                  </h3>
                  <CardAction>
                    <Badge variant="secondary">
                      <Clock aria-hidden="true" />
                      {service.duracionMin} min
                    </Badge>
                  </CardAction>
                  <CardDescription className="leading-6">
                    {service.descripcion}
                  </CardDescription>
                </CardHeader>
                <CardContent className="mt-auto flex items-end justify-between gap-4 border-t pt-4">
                  <p className="flex flex-col">
                    <span className="text-xs text-muted-foreground">
                      Precio
                    </span>
                    <span className="text-xl font-bold">
                      {formatPrice(service.precio)}
                    </span>
                  </p>
                  <Button
                    variant="link"
                    nativeButton={false}
                    render={<a href={bookingHref} />}
                    aria-label={`Reservar ${service.nombre}`}
                    className="h-11 px-2 font-semibold"
                  >
                    Reservar
                    <ArrowRight data-icon="inline-end" aria-hidden="true" />
                  </Button>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
