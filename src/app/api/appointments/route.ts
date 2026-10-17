import { NextRequest, NextResponse } from 'next/server';

import {
  appointmentErrorResponse,
  isNonEmptyString,
  isRecord,
} from '@/lib/appointments/api';
import { createClient } from '@/lib/supabase/server';

const serviceIdPattern = /^[a-z0-9-]{1,80}$/;

export async function POST(request: NextRequest) {
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
      { error: 'Los datos de la cita no son válidos.' },
      { status: 400 }
    );
  }

  const {
    customerName,
    customerPhone,
    customerEmail,
    address,
    notes,
    startsAt,
    serviceIds,
  } = body;

  if (
    !isNonEmptyString(customerName, 2, 120) ||
    !isNonEmptyString(customerPhone, 7, 30) ||
    !isNonEmptyString(address, 5, 300) ||
    (customerEmail !== undefined &&
      customerEmail !== null &&
      (typeof customerEmail !== 'string' || customerEmail.length > 254)) ||
    (notes !== undefined &&
      (typeof notes !== 'string' || notes.length > 1000)) ||
    typeof startsAt !== 'string' ||
    Number.isNaN(Date.parse(startsAt)) ||
    !Array.isArray(serviceIds) ||
    serviceIds.length < 1 ||
    serviceIds.length > 5 ||
    !serviceIds.every(
      (serviceId) =>
        typeof serviceId === 'string' && serviceIdPattern.test(serviceId)
    )
  ) {
    return NextResponse.json(
      { error: 'Revisa los datos, servicios y horario de la cita.' },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc('create_public_appointment', {
    p_customer_name: customerName.trim(),
    p_customer_phone: customerPhone.trim(),
    p_customer_email:
      typeof customerEmail === 'string' ? customerEmail.trim() || null : null,
    p_address: address.trim(),
    p_notes: typeof notes === 'string' ? notes.trim() : '',
    p_starts_at: startsAt,
    p_service_ids: serviceIds,
  });

  if (error) return appointmentErrorResponse(error, 'booking creation');

  if (!isRecord(data) || typeof data.cancellation_token !== 'string') {
    console.error('[appointments] booking RPC returned an invalid response');
    return NextResponse.json(
      { error: 'No se pudo confirmar la cita. Inténtalo de nuevo.' },
      { status: 500 }
    );
  }

  const cancellationUrl = new URL(
    `/citas/cancelar?token=${data.cancellation_token}`,
    request.nextUrl.origin
  );

  return NextResponse.json(
    {
      appointment: {
        id: data.id,
        startsAt: data.starts_at,
        endsAt: data.ends_at,
        durationMinutes: data.duration_minutes,
        totalPriceCop: data.total_price_cop,
        status: data.status,
      },
      cancellationUrl: cancellationUrl.toString(),
    },
    { status: 201 }
  );
}
