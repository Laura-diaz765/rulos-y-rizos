import { CalendarX2 } from 'lucide-react';

type CancellationNoticeProps = {
  hours: number | string;
};

export function CancellationNotice({ hours }: CancellationNoticeProps) {
  return (
    <section
      aria-labelledby="cancelacion-title"
      className="mx-auto max-w-7xl px-4 md:px-8"
    >
      <div className="flex gap-4 rounded-xl bg-secondary p-6 text-secondary-foreground shadow-sm md:p-8">
        <span className="flex size-10 shrink-0 items-center justify-center text-primary">
          <CalendarX2 className="size-6" aria-hidden="true" />
        </span>
        <div className="flex flex-col gap-1">
          <h3
            id="cancelacion-title"
            className="text-lg leading-7 font-semibold text-foreground"
          >
            ¿No puedes asistir?
          </h3>
          <p className="leading-6">
            Cancela desde el enlace que recibes al confirmar, con al menos{' '}
            {hours} horas de anticipación. Así el horario queda libre para otra
            persona y nadie pierde el viaje.
          </p>
        </div>
      </div>
    </section>
  );
}
