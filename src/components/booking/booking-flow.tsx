'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  CircleCheck,
  Clock,
  MapPin,
} from 'lucide-react';

import { CancelAppointmentButton } from '@/components/appointments/cancel-appointment-button';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CANCELLATION_HOURS, formatPrice } from '@/lib/landing-data';
import { cn } from '@/lib/utils';

export type BookingService = {
  id: string;
  name: string;
  description: string;
  durationMin: number;
  price: number;
};

type Slot = { starts_at: string; ends_at: string };

type Confirmation = {
  startsAt: string;
  durationMinutes: number;
  totalPriceCop: number;
  cancellationUrl: string;
};

const TIME_ZONE = 'America/Bogota';
const MONTHS_AHEAD = 3;
const steps = ['Servicios', 'Fecha y hora', 'Tus datos'] as const;

const timeFormatter = new Intl.DateTimeFormat('es-CO', {
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
  timeZone: TIME_ZONE,
});

const longDateFormatter = new Intl.DateTimeFormat('es-CO', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  timeZone: TIME_ZONE,
});

// Today is computed in Bogota time so the calendar matches the business day.
function todayInBogota(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE }).format(
    new Date()
  );
}

const WEEKDAY_LABELS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

function shiftMonth(month: string, delta: number): string {
  const [year, m] = month.split('-').map(Number);
  return new Date(Date.UTC(year, m - 1 + delta, 1)).toISOString().slice(0, 7);
}

// Cells for a Monday-first month grid; null entries pad the first week.
function monthCells(month: string): (string | null)[] {
  const [year, m] = month.split('-').map(Number);
  const offset = (new Date(Date.UTC(year, m - 1, 1)).getUTCDay() + 6) % 7;
  const total = new Date(Date.UTC(year, m, 0)).getUTCDate();

  return [
    ...Array.from({ length: offset }, () => null),
    ...Array.from(
      { length: total },
      (_, index) => `${month}-${String(index + 1).padStart(2, '0')}`
    ),
  ];
}

function monthTitle(month: string): string {
  return new Intl.DateTimeFormat('es-CO', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${month}-01T12:00:00Z`));
}

function errorMessage(result: unknown, fallback: string) {
  return typeof result === 'object' &&
    result !== null &&
    'error' in result &&
    typeof result.error === 'string'
    ? result.error
    : fallback;
}

const fieldClassName = 'h-11';

export function BookingFlow({ services }: { services: BookingService[] }) {
  const [step, setStep] = useState(0);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [today, setToday] = useState('');
  const [month, setMonth] = useState('');
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  const slotsRequest = useRef(0);

  const selectedServices = services.filter((service) =>
    selectedIds.includes(service.id)
  );
  const totalDuration = selectedServices.reduce(
    (sum, service) => sum + service.durationMin,
    0
  );
  const totalPrice = selectedServices.reduce(
    (sum, service) => sum + service.price,
    0
  );

  function toggleService(id: string) {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((serviceId) => serviceId !== id)
        : [...current, id]
    );
    // Slots depend on the total duration, so they must be loaded again.
    setSelectedSlot(null);
    setSelectedDay(null);
  }

  async function loadSlots(day: string) {
    // Ignores responses from older requests when the user clicks quickly.
    const requestId = ++slotsRequest.current;
    setSelectedDay(day);
    setSelectedSlot(null);
    setSlots([]);
    setSlotsError(null);
    setSlotsLoading(true);

    const params = new URLSearchParams({ date: day });
    selectedIds.forEach((id) => params.append('serviceId', id));

    try {
      const response = await fetch(`/api/availability?${params.toString()}`);
      const result: unknown = await response.json();
      if (requestId !== slotsRequest.current) return;

      if (!response.ok) {
        setSlotsError(
          errorMessage(result, 'No se pudieron consultar los horarios.')
        );
        return;
      }
      const list =
        typeof result === 'object' &&
        result !== null &&
        'slots' in result &&
        Array.isArray(result.slots)
          ? (result.slots as Slot[])
          : [];
      setSlots(list);
    } catch {
      if (requestId === slotsRequest.current) {
        setSlotsError('No se pudo conectar. Inténtalo de nuevo.');
      }
    } finally {
      if (requestId === slotsRequest.current) setSlotsLoading(false);
    }
  }

  function goToSchedule() {
    const current = todayInBogota();
    const day = selectedDay ?? current;
    setToday(current);
    setMonth(day.slice(0, 7));
    setStep(1);
    void loadSlots(day);
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!selectedSlot) return;
    setSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: name,
          customerPhone: phone,
          customerEmail: email || null,
          address,
          notes,
          startsAt: selectedSlot.starts_at,
          serviceIds: selectedIds,
        }),
      });
      const result: unknown = await response.json();

      if (!response.ok) {
        setSubmitError(
          errorMessage(
            result,
            'No se pudo confirmar la cita. Inténtalo de nuevo.'
          )
        );
        if (response.status === 409 && selectedDay) {
          // The slot was taken by someone else: go back and refresh the list.
          setStep(1);
          void loadSlots(selectedDay);
        }
        return;
      }

      const data = result as {
        appointment: {
          startsAt: string;
          durationMinutes: number;
          totalPriceCop: number;
        };
        cancellationUrl: string;
      };
      setConfirmation({
        startsAt: data.appointment.startsAt,
        durationMinutes: data.appointment.durationMinutes,
        totalPriceCop: data.appointment.totalPriceCop,
        cancellationUrl: data.cancellationUrl,
      });
    } catch {
      setSubmitError('No se pudo conectar. Inténtalo de nuevo.');
    } finally {
      setSubmitting(false);
    }
  }

  if (confirmation) {
    const start = new Date(confirmation.startsAt);
    const manageUrl = new URL(confirmation.cancellationUrl);
    const manageToken = manageUrl.searchParams.get('token') ?? '';
    const manageHref = `${manageUrl.pathname}${manageUrl.search}`;
    return (
      <Card className="mx-auto w-full max-w-xl [--card-spacing:--spacing(8)]">
        <CardHeader className="items-center text-center">
          <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-secondary text-primary">
            <CircleCheck className="size-9" aria-hidden="true" />
          </span>
          <CardTitle className="mt-2">
            <h1 className="font-serif text-3xl tracking-tight">
              ¡Tu cita quedó reservada!
            </h1>
          </CardTitle>
          <CardDescription>
            Te esperamos el {longDateFormatter.format(start)} a las{' '}
            {timeFormatter.format(start)}.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <dl className="grid gap-3 rounded-xl bg-muted p-4 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Servicios</dt>
              <dd className="text-right font-medium">
                {selectedServices.map((service) => service.name).join(' + ')}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Duración</dt>
              <dd className="font-medium">
                {confirmation.durationMinutes} min
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Total</dt>
              <dd className="font-bold">
                {formatPrice(confirmation.totalPriceCop)}
              </dd>
            </div>
          </dl>

          <div className="flex flex-col gap-3 rounded-xl border p-4">
            <p className="text-sm text-muted-foreground">
              Puedes consultar o cancelar tu cita hasta {CANCELLATION_HOURS}{' '}
              horas antes.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
              <Button
                nativeButton={false}
                render={<Link href={manageHref} />}
                className="h-11 px-5"
              >
                Ver mi cita
              </Button>
              <CancelAppointmentButton token={manageToken} />
            </div>
          </div>

          <Button
            nativeButton={false}
            render={<Link href="/" />}
            className="h-12 text-base"
          >
            Volver al inicio
          </Button>
        </CardContent>
      </Card>
    );
  }

  const canSubmit =
    name.trim().length >= 2 &&
    phone.trim().length >= 7 &&
    address.trim().length >= 5 &&
    !!selectedSlot;

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="flex flex-col gap-6">
        <nav aria-label="Progreso de la reserva">
          <ol className="grid grid-cols-3 gap-2">
            {steps.map((label, index) => (
              <li
                key={label}
                aria-current={index === step ? 'step' : undefined}
                className="flex flex-col gap-2"
              >
                <span
                  className={cn(
                    'h-1.5 rounded-full bg-border transition-colors',
                    index <= step && 'bg-primary'
                  )}
                />
                <span
                  className={cn(
                    'text-xs font-medium sm:text-sm',
                    index === step ? 'text-foreground' : 'text-muted-foreground'
                  )}
                >
                  {index + 1}. {label}
                </span>
              </li>
            ))}
          </ol>
        </nav>

        {step === 0 && (
          <section
            aria-labelledby="paso-servicios"
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col gap-2">
              <h1
                id="paso-servicios"
                className="font-serif text-3xl tracking-tight md:text-4xl"
              >
                Elige tus servicios
              </h1>
              <p className="text-muted-foreground">
                Puedes combinar varios en una sola cita. El total se calcula al
                instante.
              </p>
            </div>
            <ul className="flex flex-col gap-3">
              {services.map((service) => {
                const checked = selectedIds.includes(service.id);
                return (
                  <li key={service.id}>
                    <label
                      className={cn(
                        'flex min-h-11 cursor-pointer items-start gap-4 rounded-xl bg-card p-5 ring-1 ring-foreground/10 transition-colors has-focus-visible:ring-3 has-focus-visible:ring-ring/50',
                        checked && 'bg-secondary ring-2 ring-primary'
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleService(service.id)}
                        className="sr-only"
                      />
                      <span
                        aria-hidden="true"
                        className={cn(
                          'mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md border border-input bg-background',
                          checked &&
                            'border-primary bg-primary text-primary-foreground'
                        )}
                      >
                        {checked && <Check className="size-4" />}
                      </span>
                      <span className="flex flex-1 flex-col gap-1">
                        <span className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-lg leading-7 font-semibold">
                            {service.name}
                          </span>
                          <span className="text-lg font-bold">
                            {formatPrice(service.price)}
                          </span>
                        </span>
                        <span className="text-sm leading-6 text-muted-foreground">
                          {service.description}
                        </span>
                        <Badge variant="secondary" className="mt-1 w-fit">
                          <Clock aria-hidden="true" />
                          {service.durationMin} min
                        </Badge>
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
            <div className="sticky bottom-0 z-30 -mx-4 flex flex-col gap-3 border-t bg-background/95 px-4 py-3 backdrop-blur supports-backdrop-filter:bg-background/80 sm:flex-row sm:items-center sm:justify-between md:-mx-8 md:px-8 lg:mx-0 lg:rounded-xl lg:border lg:px-5">
              <p
                aria-live="polite"
                className="flex flex-col text-sm text-muted-foreground"
              >
                {selectedServices.length === 0 ? (
                  <span>Selecciona al menos un servicio</span>
                ) : (
                  <>
                    <span>
                      {selectedServices.length}{' '}
                      {selectedServices.length === 1 ? 'servicio' : 'servicios'}{' '}
                      · {totalDuration} min
                    </span>
                    <span className="text-lg font-bold text-foreground">
                      {formatPrice(totalPrice)}
                    </span>
                  </>
                )}
              </p>
              <Button
                type="button"
                disabled={selectedIds.length === 0}
                onClick={goToSchedule}
                className="h-12 w-full text-base sm:w-fit sm:px-8"
              >
                Continuar
                <ArrowRight data-icon="inline-end" aria-hidden="true" />
              </Button>
            </div>
          </section>
        )}

        {step === 1 && (
          <section aria-labelledby="paso-fecha" className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <h1
                id="paso-fecha"
                className="font-serif text-3xl tracking-tight md:text-4xl"
              >
                Escoge fecha y hora
              </h1>
              <p className="text-muted-foreground">
                Solo aparecen los horarios libres para la duración de tu cita.
              </p>
            </div>

            {submitError && (
              <p role="alert" className="text-sm text-destructive">
                {submitError}
              </p>
            )}

            {month && (
              <div
                role="group"
                aria-label="Calendario"
                className="flex flex-col gap-3 rounded-xl bg-card p-4 ring-1 ring-foreground/10"
              >
                <div className="flex items-center justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label="Mes anterior"
                    disabled={month <= today.slice(0, 7)}
                    onClick={() => setMonth(shiftMonth(month, -1))}
                    className="size-11"
                  >
                    <ArrowLeft aria-hidden="true" />
                  </Button>
                  <p
                    aria-live="polite"
                    className="font-serif text-xl capitalize"
                  >
                    {monthTitle(month)}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label="Mes siguiente"
                    disabled={
                      month >= shiftMonth(today.slice(0, 7), MONTHS_AHEAD)
                    }
                    onClick={() => setMonth(shiftMonth(month, 1))}
                    className="size-11"
                  >
                    <ArrowRight aria-hidden="true" />
                  </Button>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground">
                  {WEEKDAY_LABELS.map((label) => (
                    <span key={label}>{label}</span>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {monthCells(month).map((day, index) => {
                    if (!day) return <span key={`pad-${index}`} />;
                    const active = day === selectedDay;
                    return (
                      <button
                        key={day}
                        type="button"
                        aria-pressed={active}
                        disabled={day < today}
                        onClick={() => void loadSlots(day)}
                        className={cn(
                          'flex h-11 items-center justify-center rounded-lg text-sm font-medium transition-colors outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-35',
                          day === today && 'ring-1 ring-primary',
                          active &&
                            'bg-primary text-primary-foreground hover:bg-primary/90'
                        )}
                      >
                        {Number(day.slice(8))}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div aria-live="polite" className="min-h-24">
              {slotsLoading && (
                <p className="text-sm text-muted-foreground">
                  Buscando horarios disponibles...
                </p>
              )}
              {slotsError && (
                <p role="alert" className="text-sm text-destructive">
                  {slotsError}
                </p>
              )}
              {!slotsLoading && !slotsError && slots.length === 0 && (
                <p className="rounded-xl bg-muted p-4 text-sm text-muted-foreground">
                  No hay horarios disponibles ese día. Prueba con otra fecha.
                </p>
              )}
              {slots.length > 0 && (
                <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
                  {slots.map((slot) => {
                    const active = selectedSlot?.starts_at === slot.starts_at;
                    return (
                      <li key={slot.starts_at}>
                        <button
                          type="button"
                          aria-pressed={active}
                          onClick={() => setSelectedSlot(slot)}
                          className={cn(
                            'h-11 w-full rounded-lg bg-card px-2 text-sm font-medium ring-1 ring-foreground/10 transition-colors outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50',
                            active &&
                              'bg-primary text-primary-foreground ring-primary hover:bg-primary/90'
                          )}
                        >
                          {timeFormatter.format(new Date(slot.starts_at))}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="flex flex-col-reverse gap-3 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(0)}
                className="h-12 px-6 text-base"
              >
                <ArrowLeft data-icon="inline-start" aria-hidden="true" />
                Atrás
              </Button>
              <Button
                type="button"
                disabled={!selectedSlot}
                onClick={() => {
                  setSubmitError(null);
                  setStep(2);
                }}
                className="h-12 px-8 text-base"
              >
                Continuar
                <ArrowRight data-icon="inline-end" aria-hidden="true" />
              </Button>
            </div>
          </section>
        )}

        {step === 2 && (
          <section aria-labelledby="paso-datos" className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <h1
                id="paso-datos"
                className="font-serif text-3xl tracking-tight md:text-4xl"
              >
                Confirma tus datos
              </h1>
              <p className="text-muted-foreground">
                Los usamos solo para llegar a tu cita y contactarte si hace
                falta.
              </p>
            </div>

            <form onSubmit={submit} className="flex flex-col gap-5">
              <div className="grid gap-2">
                <Label htmlFor="name">Nombre completo</Label>
                <Input
                  id="name"
                  autoComplete="name"
                  required
                  minLength={2}
                  maxLength={120}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={fieldClassName}
                />
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="phone">Teléfono / WhatsApp</Label>
                  <Input
                    id="phone"
                    type="tel"
                    autoComplete="tel"
                    required
                    minLength={7}
                    maxLength={30}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={fieldClassName}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Correo (opcional)</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    maxLength={254}
                    placeholder="tucorreo@ejemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={fieldClassName}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="address">Dirección de la cita</Label>
                <Input
                  id="address"
                  autoComplete="street-address"
                  required
                  minLength={5}
                  maxLength={300}
                  placeholder="Barrio, calle, apartamento o casa"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className={fieldClassName}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="notes">Notas (opcional)</Label>
                <textarea
                  id="notes"
                  maxLength={1000}
                  rows={3}
                  placeholder="Portería, ascensor o algo que deba saber para llegar"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-2 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30"
                />
              </div>

              {submitError && (
                <p role="alert" className="text-sm text-destructive">
                  {submitError}
                </p>
              )}

              <div className="flex flex-col-reverse gap-3 sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="h-12 px-6 text-base"
                >
                  <ArrowLeft data-icon="inline-start" aria-hidden="true" />
                  Atrás
                </Button>
                <Button
                  type="submit"
                  disabled={!canSubmit || submitting}
                  className="h-12 px-8 text-base"
                >
                  {submitting ? 'Reservando...' : 'Confirmar reserva'}
                </Button>
              </div>
            </form>
          </section>
        )}
      </div>

      <aside aria-label="Resumen de tu cita" className="lg:sticky lg:top-24">
        <Card className="shadow-lg">
          <CardHeader className="border-b">
            <CardTitle className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Resumen de tu cita
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {selectedServices.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Aún no has elegido servicios.
              </p>
            ) : (
              <ul className="flex flex-col gap-1.5">
                {selectedServices.map((service) => (
                  <li
                    key={service.id}
                    className="flex justify-between gap-3 text-sm"
                  >
                    <span className="font-medium">{service.name}</span>
                    <span className="text-muted-foreground">
                      {formatPrice(service.price)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            {selectedServices.length > 0 && (
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="size-3.5" aria-hidden="true" />
                {totalDuration} min
              </p>
            )}
            {selectedSlot && (
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <CalendarDays className="size-3.5" aria-hidden="true" />
                <span className="capitalize">
                  {longDateFormatter.format(new Date(selectedSlot.starts_at))}
                </span>
                · {timeFormatter.format(new Date(selectedSlot.starts_at))}
              </p>
            )}
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="size-3.5" aria-hidden="true" />
              Servicio a domicilio
            </p>
          </CardContent>
          <CardContent className="flex items-center justify-between border-t pt-3">
            <span className="text-xs text-muted-foreground">Total</span>
            <span className="text-lg font-bold">{formatPrice(totalPrice)}</span>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
