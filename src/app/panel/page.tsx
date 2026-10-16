import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { BrandLogo } from '@/components/brand-logo';
import { LogoutButton } from '@/components/logout-button';
import {
  AppointmentsManager,
  type PanelAppointment,
} from '@/components/panel/appointments-manager';
import { ModeToggle } from '@/components/toggle-mode';
import { STAFF_APPOINTMENT_SELECT } from '@/lib/appointments/api';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Panel de citas | Rulos y Rizos Pa’ti',
  robots: { index: false, follow: false },
};

function Notice({ title, children }: { title: string; children: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl bg-card p-8 text-center ring-1 ring-foreground/10">
      <h2 className="font-serif text-2xl">{title}</h2>
      <p className="max-w-xl text-muted-foreground">{children}</p>
    </div>
  );
}

export default async function PanelPage() {
  const supabase = await createClient();

  // The proxy already redirects visitors without a session; this check keeps
  // the page safe on its own.
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect('/auth/login?next=/panel');
  }

  const { data: isStaff } = await supabase.rpc('is_appointment_staff');

  let appointments: PanelAppointment[] = [];
  let loadFailed = false;

  if (isStaff) {
    const { data: rows, error: queryError } = await supabase
      .from('appointments')
      .select(STAFF_APPOINTMENT_SELECT)
      .order('starts_at', { ascending: false })
      .limit(300)
      .overrideTypes<PanelAppointment[], { merge: false }>();

    if (queryError) {
      console.warn('[panel] appointments query failed:', queryError.message);
      loadFailed = true;
    } else {
      appointments = rows;
    }
  }

  return (
    <div className="min-h-svh">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 md:px-8">
          <Link
            href="/"
            className="flex min-h-11 items-center gap-3 rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <BrandLogo priority />
            <span className="hidden text-sm font-semibold sm:block">
              Panel de administración
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-muted-foreground md:block">
              {data.claims.email}
            </span>
            <ModeToggle />
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8 md:px-8 md:py-12">
        <div className="flex flex-col gap-2">
          <h1 className="font-serif text-3xl tracking-tight md:text-4xl">
            Citas
          </h1>
          <p className="text-muted-foreground">
            Confirma, edita o cancela las reservas de tus clientas.
          </p>
        </div>

        {!isStaff ? (
          <Notice title="Tu cuenta aún no tiene acceso">
            Pide que autoricen tu usuario como personal del salón para poder
            gestionar las citas.
          </Notice>
        ) : loadFailed ? (
          <Notice title="No se pudieron cargar las citas">
            Revisa que la migración de Supabase esté aplicada y vuelve a
            intentarlo.
          </Notice>
        ) : (
          <AppointmentsManager initialAppointments={appointments} />
        )}
      </main>
    </div>
  );
}
