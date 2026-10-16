import { NextRequest, NextResponse } from 'next/server';

import { appointmentErrorResponse } from '@/lib/appointments/api';
import { createClient } from '@/lib/supabase/server';

const datePattern = /^\d{4}-\d{2}-\d{2}$/;

function isCalendarDate(value: string) {
  if (!datePattern.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get('date');
  const serviceIds = request.nextUrl.searchParams
    .getAll('serviceId')
    .filter(Boolean);

  if (!date || !isCalendarDate(date) || serviceIds.length === 0) {
    return NextResponse.json(
      { error: 'Indica una fecha y al menos un servicio.' },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc(
    'get_available_appointment_slots',
    { p_date: date, p_service_ids: serviceIds }
  );

  if (error) return appointmentErrorResponse(error, 'availability query');

  return NextResponse.json({ slots: data });
}
