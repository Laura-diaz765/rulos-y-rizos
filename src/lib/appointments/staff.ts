import { NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';

export async function requireAppointmentStaff() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return {
      response: NextResponse.json(
        { error: 'Debes iniciar sesión para acceder a las citas.' },
        { status: 401 }
      ),
    };
  }

  const { data: isStaff, error: staffError } = await supabase.rpc(
    'is_appointment_staff'
  );

  if (staffError) {
    console.error('[appointments] staff authorization failed', staffError);
    return {
      response: NextResponse.json(
        { error: 'No se pudo verificar el acceso al panel.' },
        { status: 500 }
      ),
    };
  }

  if (!isStaff) {
    return {
      response: NextResponse.json(
        { error: 'No tienes permiso para gestionar las citas.' },
        { status: 403 }
      ),
    };
  }

  return { supabase };
}
