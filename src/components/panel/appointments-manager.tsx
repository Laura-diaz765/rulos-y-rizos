'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  CalendarDays,
  Check,
  CircleCheck,
  Clock,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  Search,
  X,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BOOKING_HREF, formatPrice } from '@/lib/landing-data';
import { cn } from '@/lib/utils';

export type AppointmentStatus =
  'pending' | 'confirmed' | 'cancelled' | 'completed';

export type PanelAppointment = {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  address: string;
  notes: string;
  starts_at: string;
  ends_at: string;
  duration_minutes: number;
  total_price_cop: number;
  status: AppointmentStatus;
  appointment_services: {
    service_id: string;
    service_name: string;
    duration_minutes: number;
    price_cop: number;
  }[];
};

const TIME_ZONE = 'America/Bogota';

const statusLabels: Record<AppointmentStatus, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  completed: 'Completada',
  cancelled: 'Cancelada',
};

const statusStyles: Record<AppointmentStatus, string> = {
  pending: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
  confirmed: 'bg-primary/15 text-primary',
  completed: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
  cancelled: 'bg-destructive/15 text-destructive',
};

const filters: { value: AppointmentStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'pending', label: 'Pendientes' },
  { value: 'confirmed', label: 'Confirmadas' },
  { value: 'completed', label: 'Completadas' },
  { value: 'cancelled', label: 'Canceladas' },
];

const dateFormatter = new Intl.DateTimeFormat('es-CO', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  timeZone: TIME_ZONE,
});

const timeIntl = new Intl.DateTimeFormat('es-CO', {
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
  timeZone: TIME_ZONE,
});

// Node and browsers use different space characters ("a. m."), which breaks
// hydration, so every whitespace is normalized to a plain space.
const timeFormatter = {
  format: (date: Date) => timeIntl.format(date).replace(/\s/g, ' '),
};

const dayKeyFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: TIME_ZONE,
});

const textareaClassName =
  'w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-2 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30';

type EditDraft = {
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  address: string;
  notes: string;
};

function errorMessage(result: unknown, fallback: string) {
  return typeof result === 'object' &&
    result !== null &&
    'error' in result &&
    typeof result.error === 'string'
    ? result.error
    : fallback;
}

export function AppointmentsManager({
  initialAppointments,
}: {
  initialAppointments: PanelAppointment[];
}) {
  const [appointments, setAppointments] = useState(initialAppointments);
  const [filter, setFilter] = useState<AppointmentStatus | 'all'>('all');
  const [query, setQuery] = useState('');
  const [onlyUpcoming, setOnlyUpcoming] = useState(true);
  const [now] = useState(() => Date.now());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<EditDraft | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const today = dayKeyFormatter.format(now);
  const active = appointments.filter((item) => item.status !== 'cancelled');
  const stats = [
    {
      label: 'Hoy',
      value: active.filter(
        (item) => dayKeyFormatter.format(new Date(item.starts_at)) === today
      ).length,
    },
    {
      label: 'Pendientes',
      value: appointments.filter((item) => item.status === 'pending').length,
    },
    {
      label: 'Próximas',
      value: active.filter((item) => new Date(item.starts_at).getTime() >= now)
        .length,
    },
  ];

  const normalizedQuery = query.trim().toLowerCase();
  const visible = appointments
    .filter((item) => filter === 'all' || item.status === filter)
    .filter((item) => !onlyUpcoming || new Date(item.ends_at).getTime() >= now)
    .filter(
      (item) =>
        !normalizedQuery ||
        item.customer_name.toLowerCase().includes(normalizedQuery) ||
        item.customer_phone.includes(normalizedQuery)
    )
    .sort((a, b) =>
      onlyUpcoming
        ? a.starts_at.localeCompare(b.starts_at)
        : b.starts_at.localeCompare(a.starts_at)
    );

  function setError(id: string, message: string | null) {
    setErrors((current) => {
      const next = { ...current };
      if (message) next[id] = message;
      else delete next[id];
      return next;
    });
  }

  async function send(
    id: string,
    init: RequestInit,
    fallback: string
  ): Promise<boolean> {
    setBusyId(id);
    setError(id, null);

    try {
      const response = await fetch(`/api/panel/appointments/item?id=${id}`, {
        ...init,
        headers: { 'Content-Type': 'application/json' },
      });
      const result: unknown = await response.json();

      if (!response.ok) {
        setError(id, errorMessage(result, fallback));
        return false;
      }

      const updated =
        typeof result === 'object' && result !== null && 'appointment' in result
          ? (result.appointment as Partial<PanelAppointment>)
          : {};
      setAppointments((current) =>
        current.map((item) => (item.id === id ? { ...item, ...updated } : item))
      );
      return true;
    } catch {
      setError(id, 'No se pudo conectar. Inténtalo de nuevo.');
      return false;
    } finally {
      setBusyId(null);
    }
  }

  function changeStatus(id: string, status: AppointmentStatus) {
    void send(
      id,
      { method: 'PATCH', body: JSON.stringify({ status }) },
      'No se pudo actualizar el estado.'
    );
  }

  async function cancel(id: string) {
    setConfirmingId(null);
    await send(id, { method: 'DELETE' }, 'No se pudo cancelar la cita.');
  }

  function startEditing(item: PanelAppointment) {
    setEditingId(item.id);
    setConfirmingId(null);
    setError(item.id, null);
    setDraft({
      customer_name: item.customer_name,
      customer_phone: item.customer_phone,
      customer_email: item.customer_email ?? '',
      address: item.address,
      notes: item.notes,
    });
  }

  async function saveEdit(event: React.FormEvent, id: string) {
    event.preventDefault();
    if (!draft) return;

    const saved = await send(
      id,
      { method: 'PATCH', body: JSON.stringify(draft) },
      'No se pudieron guardar los cambios.'
    );
    if (saved) {
      setEditingId(null);
      setDraft(null);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-3 gap-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex flex-col gap-1 rounded-xl bg-card p-4 ring-1 ring-foreground/10"
          >
            <span className="text-sm text-muted-foreground">{stat.label}</span>
            <span className="font-serif text-3xl">{stat.value}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              type="search"
              aria-label="Buscar por nombre o teléfono"
              placeholder="Buscar por nombre o teléfono"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-11 pl-9"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            aria-pressed={onlyUpcoming}
            onClick={() => setOnlyUpcoming((value) => !value)}
            className="h-11 px-4"
          >
            <CalendarDays data-icon="inline-start" aria-hidden="true" />
            {onlyUpcoming ? 'Solo próximas' : 'Todas las fechas'}
          </Button>
          <Button
            nativeButton={false}
            render={<Link href={BOOKING_HREF} />}
            className="h-11 px-4"
          >
            <Plus data-icon="inline-start" aria-hidden="true" />
            Nueva cita
          </Button>
        </div>

        <div
          role="group"
          aria-label="Filtrar por estado"
          className="-mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:flex-wrap md:px-0"
        >
          {filters.map((option) => (
            <button
              key={option.value}
              type="button"
              aria-pressed={filter === option.value}
              onClick={() => setFilter(option.value)}
              className={cn(
                'h-11 shrink-0 rounded-full bg-card px-4 text-sm font-medium ring-1 ring-foreground/10 transition-colors outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50',
                filter === option.value &&
                  'bg-primary text-primary-foreground ring-primary hover:bg-primary/90'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="rounded-xl bg-muted p-6 text-center text-sm text-muted-foreground">
          No hay citas que coincidan con estos filtros.
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {visible.map((item) => {
            const start = new Date(item.starts_at);
            const editing = editingId === item.id && draft !== null;
            const busy = busyId === item.id;
            const closed =
              item.status === 'cancelled' || item.status === 'completed';

            return (
              <li
                key={item.id}
                className="flex flex-col gap-4 rounded-xl bg-card p-4 ring-1 ring-foreground/10 md:p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex flex-col gap-1">
                    <p className="font-serif text-xl capitalize">
                      {dateFormatter.format(start)}
                    </p>
                    <p className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="size-4" aria-hidden="true" />
                      {timeFormatter.format(start)} –{' '}
                      {timeFormatter.format(new Date(item.ends_at))} ·{' '}
                      {item.duration_minutes} min
                    </p>
                  </div>
                  <Badge
                    variant="secondary"
                    className={cn('h-7 px-3', statusStyles[item.status])}
                  >
                    {statusLabels[item.status]}
                  </Badge>
                </div>

                {editing ? (
                  <form
                    onSubmit={(event) => void saveEdit(event, item.id)}
                    className="grid gap-4 sm:grid-cols-2"
                  >
                    <div className="flex flex-col gap-2">
                      <Label htmlFor={`name-${item.id}`}>Nombre</Label>
                      <Input
                        id={`name-${item.id}`}
                        required
                        minLength={2}
                        maxLength={120}
                        value={draft.customer_name}
                        onChange={(e) =>
                          setDraft({ ...draft, customer_name: e.target.value })
                        }
                        className="h-11"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor={`phone-${item.id}`}>Teléfono</Label>
                      <Input
                        id={`phone-${item.id}`}
                        type="tel"
                        required
                        minLength={7}
                        maxLength={30}
                        value={draft.customer_phone}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            customer_phone: e.target.value,
                          })
                        }
                        className="h-11"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor={`email-${item.id}`}>Correo</Label>
                      <Input
                        id={`email-${item.id}`}
                        type="email"
                        maxLength={254}
                        value={draft.customer_email}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            customer_email: e.target.value,
                          })
                        }
                        className="h-11"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor={`address-${item.id}`}>Dirección</Label>
                      <Input
                        id={`address-${item.id}`}
                        required
                        minLength={5}
                        maxLength={300}
                        value={draft.address}
                        onChange={(e) =>
                          setDraft({ ...draft, address: e.target.value })
                        }
                        className="h-11"
                      />
                    </div>
                    <div className="flex flex-col gap-2 sm:col-span-2">
                      <Label htmlFor={`notes-${item.id}`}>Notas</Label>
                      <textarea
                        id={`notes-${item.id}`}
                        rows={3}
                        maxLength={1000}
                        value={draft.notes}
                        onChange={(e) =>
                          setDraft({ ...draft, notes: e.target.value })
                        }
                        className={textareaClassName}
                      />
                    </div>
                    <div className="flex flex-col-reverse gap-3 sm:col-span-2 sm:flex-row">
                      <Button
                        type="button"
                        variant="outline"
                        disabled={busy}
                        onClick={() => {
                          setEditingId(null);
                          setDraft(null);
                          setError(item.id, null);
                        }}
                        className="h-11 px-5"
                      >
                        Descartar
                      </Button>
                      <Button
                        type="submit"
                        disabled={busy}
                        className="h-11 px-5"
                      >
                        {busy ? 'Guardando...' : 'Guardar cambios'}
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="flex flex-col gap-2 text-sm">
                      <p className="text-base font-medium">
                        {item.customer_name}
                      </p>
                      <a
                        href={`tel:${item.customer_phone}`}
                        className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                      >
                        <Phone className="size-4" aria-hidden="true" />
                        {item.customer_phone}
                      </a>
                      {item.customer_email && (
                        <a
                          href={`mailto:${item.customer_email}`}
                          className="flex items-center gap-2 break-all text-muted-foreground hover:text-foreground"
                        >
                          <Mail
                            className="size-4 shrink-0"
                            aria-hidden="true"
                          />
                          {item.customer_email}
                        </a>
                      )}
                      <p className="flex items-start gap-2 text-muted-foreground">
                        <MapPin
                          className="mt-0.5 size-4 shrink-0"
                          aria-hidden="true"
                        />
                        {item.address}
                      </p>
                      {item.notes && (
                        <p className="rounded-lg bg-muted p-3 text-muted-foreground">
                          {item.notes}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 text-sm">
                      <ul className="flex flex-col gap-1">
                        {item.appointment_services.map((service) => (
                          <li
                            key={service.service_id}
                            className="flex justify-between gap-3"
                          >
                            <span>{service.service_name}</span>
                            <span className="text-muted-foreground">
                              {formatPrice(service.price_cop)}
                            </span>
                          </li>
                        ))}
                      </ul>
                      <p className="flex justify-between gap-3 border-t pt-2 font-medium">
                        <span>Total</span>
                        <span>{formatPrice(item.total_price_cop)}</span>
                      </p>
                    </div>
                  </div>
                )}

                {errors[item.id] && (
                  <p role="alert" className="text-sm text-destructive">
                    {errors[item.id]}
                  </p>
                )}

                {!editing && (
                  <div className="flex flex-wrap gap-2 border-t pt-4">
                    {item.status === 'pending' && (
                      <Button
                        type="button"
                        disabled={busy}
                        onClick={() => changeStatus(item.id, 'confirmed')}
                        className="h-11 px-4"
                      >
                        <Check data-icon="inline-start" aria-hidden="true" />
                        Confirmar
                      </Button>
                    )}
                    {item.status === 'confirmed' && (
                      <Button
                        type="button"
                        disabled={busy}
                        onClick={() => changeStatus(item.id, 'completed')}
                        className="h-11 px-4"
                      >
                        <CircleCheck
                          data-icon="inline-start"
                          aria-hidden="true"
                        />
                        Marcar completada
                      </Button>
                    )}
                    {item.status === 'cancelled' && (
                      <Button
                        type="button"
                        variant="outline"
                        disabled={busy}
                        onClick={() => changeStatus(item.id, 'pending')}
                        className="h-11 px-4"
                      >
                        Reactivar
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      disabled={busy}
                      onClick={() => startEditing(item)}
                      className="h-11 px-4"
                    >
                      <Pencil data-icon="inline-start" aria-hidden="true" />
                      Editar
                    </Button>
                    {!closed &&
                      (confirmingId === item.id ? (
                        <>
                          <Button
                            type="button"
                            variant="destructive"
                            disabled={busy}
                            onClick={() => void cancel(item.id)}
                            className="h-11 px-4"
                          >
                            Sí, cancelar cita
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setConfirmingId(null)}
                            className="h-11 px-4"
                          >
                            No
                          </Button>
                        </>
                      ) : (
                        <Button
                          type="button"
                          variant="outline"
                          disabled={busy}
                          onClick={() => setConfirmingId(item.id)}
                          className="h-11 px-4 text-destructive"
                        >
                          <X data-icon="inline-start" aria-hidden="true" />
                          Cancelar
                        </Button>
                      ))}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
