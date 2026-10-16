import { NextRequest, NextResponse } from 'next/server';

import { appointmentErrorResponse, isRecord } from '@/lib/appointments/api';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token') ?? '';
  if (!/^[0-9a-f]{64}$/.test(token)) {
    return NextResponse.json(
      { error: 'No encontramos una cita con ese enlace.' },
      { status: 404 }
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc('get_public_appointment', {
    p_token: token,
  });

  if (error) return appointmentErrorResponse(error, 'appointment lookup');
  if (!data) {
    return NextResponse.json(
      { error: 'No encontramos una cita con ese enlace.' },
      { status: 404 }
    );
  }

  return NextResponse.json({ appointment: data });
}

export async function DELETE(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token') ?? '';
  if (!/^[0-9a-f]{64}$/.test(token)) {
    return NextResponse.json(
      { error: 'No encontramos una cita con ese enlace.' },
      { status: 404 }
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc('cancel_public_appointment', {
    p_token: token,
  });

  if (error) return appointmentErrorResponse(error, 'appointment cancellation');
  if (!isRecord(data)) {
    console.error(
      '[appointments] cancellation RPC returned an invalid response'
    );
    return NextResponse.json(
      { error: 'No se pudo cancelar la cita. Inténtalo de nuevo.' },
      { status: 500 }
    );
  }

  return NextResponse.json({ appointment: data });
}
