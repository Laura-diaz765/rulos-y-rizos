import { NextRequest, NextResponse } from 'next/server';

import {
  isAppointmentStatus,
  STAFF_APPOINTMENT_SELECT,
} from '@/lib/appointments/api';
import { requireAppointmentStaff } from '@/lib/appointments/staff';

export async function GET(request: NextRequest) {
  const access = await requireAppointmentStaff();
  if ('response' in access) return access.response;

  const { searchParams } = request.nextUrl;
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const status = searchParams.get('status');

  if (
    (from && Number.isNaN(Date.parse(from))) ||
    (to && Number.isNaN(Date.parse(to))) ||
    (status && !isAppointmentStatus(status))
  ) {
    return NextResponse.json(
      { error: 'Los filtros de consulta no son válidos.' },
      { status: 400 }
    );
  }

  let query = access.supabase
    .from('appointments')
    .select(STAFF_APPOINTMENT_SELECT)
    .order('starts_at', { ascending: true })
    .limit(100);

  if (from) query = query.gte('starts_at', from);
  if (to) query = query.lte('starts_at', to);
  if (status) query = query.eq('status', status);

  const { data, error } = await query;
  if (error) {
    console.error('[appointments] staff list failed', error);
    return NextResponse.json(
      { error: 'No se pudieron consultar las citas.' },
      { status: 500 }
    );
  }

  return NextResponse.json({ appointments: data });
}
