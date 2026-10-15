import { redirect } from 'next/navigation';

import { LogoutButton } from '@/components/logout-button';
import { createClient } from '@/lib/supabase/server';

export default async function ProtectedPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect('/auth/login?next=/protected');
  }

  return (
    <main className="flex min-h-svh w-full flex-col items-center justify-center gap-4 p-6 text-center">
      <p>
        Hola, <span className="font-medium">{data.claims.email}</span>
      </p>
      <LogoutButton />
    </main>
  );
}
