import {
  ArrowRight,
  CalendarDays,
  Check,
  Clock,
  MapPin,
  Sparkles,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { formatPrice, type ResumenCita } from '@/lib/landing-data';

type HeroSectionProps = {
  benefits: string[];
  resumen: ResumenCita;
  bookingHref: string;
};

export function HeroSection({
  benefits,
  resumen,
  bookingHref,
}: HeroSectionProps) {
  return (
    <section
      aria-labelledby="hero-title"
      className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-12 md:px-8 md:py-16 lg:grid-cols-[minmax(0,1fr)_28rem] lg:gap-12"
    >
      <div className="flex flex-col gap-6">
        <Badge variant="secondary" className="h-8 gap-2 px-3 text-sm">
          <MapPin aria-hidden="true" />
          Estilista independiente · Servicio a domicilio
        </Badge>

        <h1
          id="hero-title"
          className="font-serif text-4xl leading-tight tracking-tight text-balance sm:text-5xl lg:text-6xl"
        >
          Tus rizos, cuidados en casa y a tu hora.
        </h1>

        <p className="max-w-xl text-lg leading-8 text-muted-foreground">
          Elige tu servicio, mira los horarios que están libres y reserva en
          minutos. Sin esperar respuesta por chat y con el precio claro desde el
          inicio.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            nativeButton={false}
            render={<a href={bookingHref} />}
            className="h-12 px-6 text-base"
          >
            Reserva tu cita
            <ArrowRight data-icon="inline-end" aria-hidden="true" />
          </Button>
          <Button
            variant="outline"
            nativeButton={false}
            render={<a href="#servicios" />}
            className="h-12 px-6 text-base"
          >
            Ver servicios y precios
          </Button>
        </div>

        <ul className="grid gap-4 border-t pt-6 sm:grid-cols-3">
          {benefits.map((benefit) => (
            <li key={benefit} className="flex gap-2.5 text-sm">
              <Check
                className="mt-0.5 size-4 shrink-0 text-primary"
                aria-hidden="true"
              />
              {benefit}
            </li>
          ))}
        </ul>
      </div>

      <div className="relative mx-auto w-full max-w-md pb-28 sm:pb-20 lg:mr-8">
        <div className="flex aspect-4/5 flex-col items-center justify-center gap-3 rounded-2xl border bg-card p-8 pb-32 text-center">
          <span className="flex size-20 items-center justify-center rounded-full bg-secondary text-primary">
            <Sparkles className="size-10" aria-hidden="true" />
          </span>
          <span className="mt-2 rounded-md bg-muted px-3 py-1 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            Espacio para foto
          </span>
          <p className="text-sm font-medium">[Foto de Rulos y Rizos]</p>
          <p className="max-w-xs text-xs text-muted-foreground">
            Fotografía real de trabajos y resultados en definición y peinado de
            cabello rizado
          </p>
        </div>

        <Card
          size="sm"
          aria-label="Ejemplo de resumen de cita"
          className="absolute right-4 bottom-0 left-4 shadow-lg sm:left-auto sm:w-80 lg:-right-8"
        >
          <CardHeader className="border-b">
            <CardTitle className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Resumen de tu cita
            </CardTitle>
            <CardAction>
              <Badge variant="secondary">{resumen.estado}</Badge>
            </CardAction>
          </CardHeader>
          <CardContent className="flex flex-col gap-1">
            <p className="font-semibold">{resumen.servicios}</p>
            <p className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="size-3.5" aria-hidden="true" />
                {resumen.duracionMin} min
              </span>
              <span aria-hidden="true">•</span>
              <span className="flex items-center gap-1">
                <CalendarDays className="size-3.5" aria-hidden="true" />
                {resumen.dia} · {resumen.hora}
              </span>
            </p>
          </CardContent>
          <CardContent className="flex items-center justify-between border-t pt-3">
            <span className="text-xs text-muted-foreground">Total</span>
            <span className="text-lg font-bold">
              {formatPrice(resumen.total)}
            </span>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
