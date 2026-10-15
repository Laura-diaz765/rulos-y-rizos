import { Card, CardContent } from '@/components/ui/card';
import type { Step } from '@/lib/landing-data';

type StepsSectionProps = {
  steps: Step[];
};

export function StepsSection({ steps }: StepsSectionProps) {
  return (
    <section
      id="como-reservar"
      aria-labelledby="como-reservar-title"
      className="mx-auto max-w-7xl scroll-mt-16 px-4 py-16 md:px-8 md:py-20"
    >
      <div className="flex max-w-2xl flex-col gap-2">
        <h2
          id="como-reservar-title"
          className="font-serif text-3xl tracking-tight md:text-4xl"
        >
          Reservar toma tres pasos
        </h2>
        <p className="text-muted-foreground">
          Desde tu celular, sin instalar nada y sin crear una cuenta.
        </p>
      </div>

      <ol className="mt-10 grid gap-6 lg:grid-cols-3">
        {steps.map((step, index) => (
          <li key={step.titulo} className="flex">
            <Card className="w-full [--card-spacing:--spacing(6)]">
              <CardContent className="flex flex-col gap-2">
                <span
                  aria-hidden="true"
                  className="mb-2 flex size-10 items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground shadow-sm"
                >
                  {index + 1}
                </span>
                <h3 className="text-lg leading-7 font-semibold">
                  <span className="sr-only">Paso {index + 1}: </span>
                  {step.titulo}
                </h3>
                <p className="text-sm leading-6 text-muted-foreground">
                  {step.descripcion}
                </p>
              </CardContent>
            </Card>
          </li>
        ))}
      </ol>
    </section>
  );
}
