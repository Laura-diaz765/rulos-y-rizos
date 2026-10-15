import { MessageCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';

type CtaSectionProps = {
  bookingHref: string;
  whatsappUrl: string;
};

export function CtaSection({ bookingHref, whatsappUrl }: CtaSectionProps) {
  return (
    <section
      id="contacto"
      aria-labelledby="contacto-title"
      className="mx-auto max-w-7xl scroll-mt-16 px-4 py-16 md:px-8 md:py-20"
    >
      <div className="flex flex-col items-center gap-4 rounded-2xl bg-primary px-6 py-12 text-center text-primary-foreground shadow-lg md:px-12 md:py-14">
        <h2
          id="contacto-title"
          className="font-serif text-3xl tracking-tight text-balance md:text-4xl"
        >
          ¿Agendamos tu próxima cita?
        </h2>
        <p className="max-w-xl text-lg leading-7 text-primary-foreground/85">
          Reserva en línea cuando quieras. Si tienes una duda antes, escríbeme
          por WhatsApp.
        </p>
        <div className="mt-4 flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row">
          <Button
            nativeButton={false}
            render={<a href={bookingHref} />}
            className="h-12 bg-primary-foreground px-6 text-base font-semibold text-primary hover:bg-primary-foreground/90 focus-visible:ring-primary-foreground/60"
          >
            Reserva tu cita
          </Button>
          <Button
            variant="outline"
            nativeButton={false}
            render={
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" />
            }
            className="h-12 border-primary-foreground/50 bg-transparent px-6 text-base font-semibold text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground focus-visible:ring-primary-foreground/60 dark:border-primary-foreground/50 dark:bg-transparent dark:hover:bg-primary-foreground/10"
          >
            <MessageCircle data-icon="inline-start" aria-hidden="true" />
            Escríbeme por WhatsApp
          </Button>
        </div>
      </div>
    </section>
  );
}
