import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>
                <h1 className="font-serif text-2xl tracking-tight">
                  ¡Gracias por registrarte!
                </h1>
              </CardTitle>
              <CardDescription>
                Revisa tu correo para confirmar.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Tu cuenta fue creada. Revisa tu correo electrónico y confirma tu
                cuenta antes de iniciar sesión.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
