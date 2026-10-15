import { redirect } from 'next/navigation';

import { LogoutButton } from '@/components/logout-button';
import { createClient } from '@/lib/supabase/server';

export default async function PanelPage() {
  const supabase = await createClient();

  // The proxy already redirects visitors without a session; this check keeps
  // the page safe on its own.
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect('/auth/login?next=/panel');
  }

  return (
    <main className="flex min-h-svh w-full flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="font-serif text-3xl tracking-tight md:text-4xl">
        Panel de Rulos y Rizos
      </h1>
      <p className="text-muted-foreground">
        Sesión iniciada como{' '}
        <span className="font-medium text-foreground">{data.claims.email}</span>
      </p>
      <LogoutButton />
    </main>
  );
}
