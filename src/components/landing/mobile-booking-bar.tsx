import { Button } from '@/components/ui/button';

type MobileBookingBarProps = {
  bookingHref: string;
};

export function MobileBookingBar({ bookingHref }: MobileBookingBarProps) {
  return (
    <aside
      aria-label="Reserva rápida"
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur supports-backdrop-filter:bg-background/80 md:hidden"
    >
      <p className="mb-2 text-center text-xs text-muted-foreground">
        A domicilio · Reserva en 3 pasos
      </p>
      <Button
        nativeButton={false}
        render={<a href={bookingHref} />}
        className="h-12 w-full text-base"
      >
        Reserva tu cita
      </Button>
    </aside>
  );
}
