import { NextRequest, NextResponse } from 'next/server';

import {
  type AppointmentStatus,
  isAppointmentStatus,
  isRecord,
  STAFF_APPOINTMENT_SELECT,
} from '@/lib/appointments/api';
import { requireAppointmentStaff } from '@/lib/appointments/staff';

type AppointmentRequest = NextRequest;

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(request: AppointmentRequest) {
  const access = await requireAppointmentStaff();
  if ('response' in access) return access.response;

  const id = request.nextUrl.searchParams.get('id') ?? '';
  if (!uuidPattern.test(id)) {
    return NextResponse.json({ error: 'La cita no existe.' }, { status: 404 });
  }

  const { data, error } = await access.supabase
    .from('appointments')
    .select(STAFF_APPOINTMENT_SELECT)
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('[appointments] staff detail query failed', error);
    return NextResponse.json(
      { error: 'No se pudo consultar la cita.' },
      { status: 500 }
    );
  }
  if (!data) {
    return NextResponse.json({ error: 'La cita no existe.' }, { status: 404 });
  }

  return NextResponse.json({ appointment: data });
}

export async function PATCH(request: AppointmentRequest) {
  const access = await requireAppointmentStaff();
  if ('response' in access) return access.response;

  const id = request.nextUrl.searchParams.get('id') ?? '';
  if (!uuidPattern.test(id)) {
    return NextResponse.json({ error: 'La cita no existe.' }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'El cuerpo de la solicitud debe ser JSON válido.' },
      { status: 400 }
    );
  }
  if (!isRecord(body)) {
    return NextResponse.json(
      { error: 'Los cambios de la cita no son válidos.' },
      { status: 400 }
    );
  }

  const updates: {
    customer_name?: string;
    customer_phone?: string;
    customer_email?: string | null;
    address?: string;
    notes?: string;
    status?: AppointmentStatus;
  } = {};

  if ('customer_name' in body) {
    if (
      typeof body.customer_name !== 'string' ||
      body.customer_name.trim().length < 2 ||
      body.customer_name.trim().length > 120
    ) {
      return NextResponse.json(
        { error: 'El nombre debe tener entre 2 y 120 caracteres.' },
        { status: 400 }
      );
    }
    updates.customer_name = body.customer_name.trim();
  }

  if ('customer_phone' in body) {
    if (
      typeof body.customer_phone !== 'string' ||
      body.customer_phone.trim().length < 7 ||
      body.customer_phone.trim().length > 30
    ) {
      return NextResponse.json(
        { error: 'El teléfono debe tener entre 7 y 30 caracteres.' },
        { status: 400 }
      );
    }
    updates.customer_phone = body.customer_phone.trim();
  }

  if ('customer_email' in body) {
    if (
      body.customer_email !== null &&
      (typeof body.customer_email !== 'string' ||
        body.customer_email.length > 254 ||
        (body.customer_email !== '' &&
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.customer_email)))
    ) {
      return NextResponse.json(
        { error: 'El correo electrónico no es válido.' },
        { status: 400 }
      );
    }
    updates.customer_email =
      typeof body.customer_email === 'string'
        ? body.customer_email.trim() || null
        : null;
  }

  if ('address' in body) {
    if (
      typeof body.address !== 'string' ||
      body.address.trim().length < 5 ||
      body.address.trim().length > 300
    ) {
      return NextResponse.json(
        { error: 'La dirección debe tener entre 5 y 300 caracteres.' },
        { status: 400 }
      );
    }
    updates.address = body.address.trim();
  }

  if ('notes' in body) {
    if (typeof body.notes !== 'string' || body.notes.length > 1000) {
      return NextResponse.json(
        { error: 'Las notas no pueden superar 1000 caracteres.' },
        { status: 400 }
      );
    }
    updates.notes = body.notes.trim();
  }

  if ('status' in body) {
    if (!isAppointmentStatus(body.status)) {
      return NextResponse.json(
        { error: 'El estado indicado no es válido.' },
        { status: 400 }
      );
    }
    updates.status = body.status;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json(
      { error: 'Indica al menos un campo que quieras actualizar.' },
      { status: 400 }
    );
  }

  const { data, error } = await access.supabase
    .from('appointments')
    .update(updates)
    .eq('id', id)
    .select(STAFF_APPOINTMENT_SELECT)
    .maybeSingle();

  if (error) {
    console.error('[appointments] staff update failed', error);
    return NextResponse.json(
      { error: 'No se pudo actualizar la cita.' },
      { status: 500 }
    );
  }
  if (!data) {
    return NextResponse.json({ error: 'La cita no existe.' }, { status: 404 });
  }

  return NextResponse.json({ appointment: data });
}

export async function DELETE(request: AppointmentRequest) {
  const access = await requireAppointmentStaff();
  if ('response' in access) return access.response;

  const id = request.nextUrl.searchParams.get('id') ?? '';
  if (!uuidPattern.test(id)) {
    return NextResponse.json({ error: 'La cita no existe.' }, { status: 404 });
  }

  const { data, error } = await access.supabase
    .from('appointments')
    .update({ status: 'cancelled' })
    .eq('id', id)
    .select('id, status')
    .maybeSingle();

  if (error) {
    console.error('[appointments] staff cancellation failed', error);
    return NextResponse.json(
      { error: 'No se pudo cancelar la cita.' },
      { status: 500 }
    );
  }
  if (!data) {
    return NextResponse.json({ error: 'La cita no existe.' }, { status: 404 });
  }

  return NextResponse.json({ appointment: data });
}
