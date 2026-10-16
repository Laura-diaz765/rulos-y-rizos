import { NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('services')
    .select('id, name, description, duration_minutes, price_cop')
    .eq('is_active', true)
    .order('name');

  if (error) {
    console.error('[appointments] services query failed', error);
    return NextResponse.json(
      { error: 'No se pudieron consultar los servicios.' },
      { status: 500 }
    );
  }

  return NextResponse.json({ services: data });
}
