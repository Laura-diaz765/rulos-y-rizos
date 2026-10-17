import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { CancelAppointmentButton } from '@/components/appointments/cancel-appointment-button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Gestionar cita | Rulos y Rizos Pa’ti',
  robots: { index: false, follow: false },
};

type ManageAppointmentPageProps = {
  searchParams: Promise<{ token?: string }>;
};

type PublicAppointment = {
  customer_name: string;
  starts_at: string;
  duration_minutes: number;
  total_price_cop: number;
  status: string;
  can_cancel: boolean;
  services: Array<{ name: string }>;
};

function isPublicAppointment(value: unknown): value is PublicAppointment {
  if (typeof value !== 'object' || value === null) return false;
  const appointment = value as Record<string, unknown>;
  return (
    typeof appointment.customer_name === 'string' &&
    typeof appointment.starts_at === 'string' &&
    typeof appointment.duration_minutes === 'number' &&
    typeof appointment.total_price_cop === 'number' &&
    typeof appointment.status === 'string' &&
    typeof appointment.can_cancel === 'boolean' &&
    Array.isArray(appointment.services)
  );
}

const priceFormatter = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

export default async function ManageAppointmentPage({
  searchParams,
}: ManageAppointmentPageProps) {
  const { token = '' } = await searchParams;
  if (!/^[0-9a-f]{64}$/.test(token)) notFound();

  const supabase = await createClient();
  const { data, error } = await supabase.rpc('get_public_appointment', {
    p_token: token,
  });
  if (error) {
    console.error('[appointments] public appointment page query failed', error);
    throw new Error('No se pudo consultar la cita.');
  }
  if (!isPublicAppointment(data)) notFound();

  const appointmentDate = new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: 'America/Bogota',
  }).format(new Date(data.starts_at));
  const isCancelled = data.status === 'cancelled';

  return (
    <main className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-lg">
        <Card>
          <CardHeader>
            <CardTitle>
              <h1 className="font-serif text-2xl tracking-tight">
                Gestionar mi cita
              </h1>
            </CardTitle>
            <CardDescription>
              Hola {data.customer_name}. Aquí puedes consultar o cancelar tu
              reserva.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <dl className="grid gap-2 text-sm">
              <div>
                <dt className="font-medium">Fecha y hora</dt>
                <dd className="text-muted-foreground">{appointmentDate}</dd>
              </div>
              <div>
                <dt className="font-medium">Servicios</dt>
                <dd className="text-muted-foreground">
                  {data.services.map((service) => service.name).join(' + ')}
                </dd>
              </div>
              <div>
                <dt className="font-medium">Duración y total</dt>
                <dd className="text-muted-foreground">
                  {data.duration_minutes} min ·{' '}
                  {priceFormatter.format(data.total_price_cop)}
                </dd>
              </div>
              <div>
                <dt className="font-medium">Estado</dt>
                <dd className="text-muted-foreground">
                  {isCancelled ? 'Cancelada' : 'Pendiente o confirmada'}
                </dd>
              </div>
            </dl>

            {isCancelled ? (
              <p role="status" className="text-sm text-muted-foreground">
                Esta cita ya fue cancelada.
              </p>
            ) : data.can_cancel ? (
              <>
                <p className="text-sm text-muted-foreground">
                  Puedes cancelar hasta 24 horas antes de la cita.
                </p>
                <CancelAppointmentButton token={token} />
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Ya pasó el plazo de cancelación en línea. Escríbenos por
                WhatsApp si necesitas ayuda.
              </p>
            )}

            <Link
              href="/"
              className="text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              Volver al inicio
            </Link>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
