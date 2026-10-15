import Link from 'next/link';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getAuthErrorMessage } from '@/lib/supabase/auth-errors';

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>
                <h1 className="font-serif text-2xl tracking-tight">
                  Lo sentimos, algo salió mal.
                </h1>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <p className="text-sm text-muted-foreground">
                {getAuthErrorMessage(params?.error)}
              </p>
              <Link
                href="/auth/login"
                className="text-sm font-medium text-primary underline-offset-4 hover:underline"
              >
                Volver a iniciar sesión
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
