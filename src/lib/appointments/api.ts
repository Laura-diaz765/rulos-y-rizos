import { NextResponse } from 'next/server';

// Explicit columns keep the cancellation token hash out of staff responses.
export const STAFF_APPOINTMENT_SELECT =
  'id, customer_name, customer_phone, customer_email, address, notes, starts_at, ends_at, duration_minutes, total_price_cop, status, created_at, updated_at, appointment_services(service_id, service_name, duration_minutes, price_cop)';

type DatabaseError = {
  code?: string;
  message?: string;
};

export function appointmentErrorResponse(
  error: DatabaseError,
  operation: string
) {
  if (error.code === 'P0001' && error.message === 'slot_unavailable') {
    return NextResponse.json(
      { error: 'Ese horario acaba de ocuparse. Elige otro, por favor.' },
      { status: 409 }
    );
  }

  if (
    error.code === 'P0001' &&
    error.message === 'cancellation_window_closed'
  ) {
    return NextResponse.json(
      { error: 'Ya pasó el plazo para cancelar desde este enlace.' },
      { status: 409 }
    );
  }

  if (
    error.code === 'P0001' &&
    (error.message === 'appointment_not_found' ||
      error.message === 'appointment_not_cancellable')
  ) {
    return NextResponse.json(
      { error: 'No encontramos una cita cancelable con ese enlace.' },
      { status: 404 }
    );
  }

  if (error.code === '22023') {
    return NextResponse.json(
      { error: 'Los datos de la solicitud no son válidos.' },
      { status: 400 }
    );
  }

  console.error(`[appointments] ${operation} failed`, error);
  return NextResponse.json(
    { error: 'No se pudo completar la operación. Inténtalo de nuevo.' },
    { status: 500 }
  );
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isNonEmptyString(
  value: unknown,
  minLength: number,
  maxLength: number
): value is string {
  return (
    typeof value === 'string' &&
    value.trim().length >= minLength &&
    value.trim().length <= maxLength
  );
}

export function isAppointmentStatus(
  value: unknown
): value is AppointmentStatus {
  return (
    value === 'pending' ||
    value === 'confirmed' ||
    value === 'cancelled' ||
    value === 'completed'
  );
}

export type AppointmentStatus =
  'pending' | 'confirmed' | 'cancelled' | 'completed';
