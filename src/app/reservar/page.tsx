import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import {
  BookingFlow,
  type BookingService,
} from '@/components/booking/booking-flow';
import { BrandLogo } from '@/components/brand-logo';
import { ModeToggle } from '@/components/toggle-mode';
import { Button } from '@/components/ui/button';
import { brand, services as fallbackServices } from '@/lib/landing-data';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Reserva tu cita | Rulos Y Rizos Pa'ti",
  description:
    'Elige tus servicios, mira los horarios libres y reserva tu cita a domicilio en minutos.',
};

// The static list keeps the page usable if the services table is empty or unreachable.
async function loadServices(): Promise<BookingService[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('services')
    .select('id, name, description, duration_minutes, price_cop')
    .eq('is_active', true)
    .order('name');

  if (!error && data && data.length > 0) {
    return data.map((service) => ({
      id: service.id,
      name: service.name,
      description: service.description,
      durationMin: service.duration_minutes,
      price: service.price_cop,
    }));
  }

  if (error) console.warn('[booking] services query failed:', error.message);

  return fallbackServices.map((service) => ({
    id: service.id,
    name: service.nombre,
    description: service.descripcion,
    durationMin: service.duracionMin,
    price: service.precio,
  }));
}

export default async function BookingPage() {
  const services = await loadServices();

  return (
    <div className="min-h-svh">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 md:px-8">
          <Link
            href="/"
            className="flex min-h-11 items-center gap-3 rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <BrandLogo priority />
            <span className="hidden flex-col sm:flex">
              <span className="text-sm leading-5 font-semibold">
                {brand.nombre}
              </span>
              <span className="text-xs leading-4 text-muted-foreground">
                {brand.lema}
              </span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              nativeButton={false}
              render={<Link href="/" />}
              className="h-11 px-3 text-muted-foreground"
            >
              <ArrowLeft data-icon="inline-start" aria-hidden="true" />
              Volver al sitio
            </Button>
            <ModeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-12">
        <BookingFlow services={services} />
      </main>
    </div>
  );
}
