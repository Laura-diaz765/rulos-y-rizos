'use client';

import { useState } from 'react';

import { cn } from '@/lib/utils';
import { getAuthErrorMessageFromError } from '@/lib/supabase/auth-errors';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'div'>) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      // The url which will be included in the email. This URL needs to be configured in your redirect URLs in the Supabase dashboard at https://supabase.com/dashboard/project/_/auth/url-configuration
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });
      if (error) throw error;
      setSuccess(true);
    } catch (error: unknown) {
      setError(getAuthErrorMessageFromError(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      {success ? (
        <Card>
          <CardHeader>
            <CardTitle>
              <h1 className="font-serif text-2xl tracking-tight">
                Revisa tu correo
              </h1>
            </CardTitle>
            <CardDescription>
              Te enviamos las instrucciones para cambiar tu contraseña.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Si tu cuenta usa correo electrónico y contraseña, recibirás un
              mensaje con un enlace para crear una contraseña nueva.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>
              <h1 className="font-serif text-2xl tracking-tight">
                Recupera tu contraseña
              </h1>
            </CardTitle>
            <CardDescription>
              Escribe tu correo electrónico y te enviaremos un enlace para
              cambiar tu contraseña.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleForgotPassword}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="email">Correo electrónico</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="tucorreo@ejemplo.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11"
                  />
                </div>
                {error && (
                  <p role="alert" className="text-sm text-destructive">
                    {error}
                  </p>
                )}
                <Button
                  type="submit"
                  className="h-11 w-full text-base"
                  disabled={isLoading}
                >
                  {isLoading ? 'Enviando...' : 'Enviar enlace'}
                </Button>
              </div>
              <div className="mt-4 text-center text-sm">
                ¿Ya la recordaste?{' '}
                <Link
                  href="/auth/login"
                  className="font-medium text-primary underline underline-offset-4"
                >
                  Iniciar sesión
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
