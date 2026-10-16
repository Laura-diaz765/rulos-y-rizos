'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';

type CancelAppointmentButtonProps = {
  token: string;
};

export function CancelAppointmentButton({
  token,
}: CancelAppointmentButtonProps) {
  const [isCancelling, setIsCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cancelled, setCancelled] = useState(false);
  const [confirming, setConfirming] = useState(false);

  async function cancelAppointment() {
    setIsCancelling(true);
    setError(null);

    try {
      const response = await fetch(`/api/appointments/manage?token=${token}`, {
        method: 'DELETE',
      });
      const result: unknown = await response.json();

      if (!response.ok) {
        const message =
          typeof result === 'object' &&
          result !== null &&
          'error' in result &&
          typeof result.error === 'string'
            ? result.error
            : 'No se pudo cancelar la cita.';
        setError(message);
        return;
      }

      setCancelled(true);
    } catch {
      setError('No se pudo conectar. Inténtalo de nuevo.');
    } finally {
      setIsCancelling(false);
    }
  }

  if (cancelled) {
    return (
      <p role="status" className="font-medium text-primary">
        La cita quedó cancelada.
      </p>
    );
  }

  return (
    <div className="flex flex-col items-start gap-3">
      {confirming ? (
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="destructive"
            disabled={isCancelling}
            onClick={cancelAppointment}
            className="h-11 px-5"
          >
            {isCancelling ? 'Cancelando...' : 'Sí, cancelar cita'}
          </Button>
          <Button
            type="button"
            variant="ghost"
            disabled={isCancelling}
            onClick={() => setConfirming(false)}
            className="h-11 px-4"
          >
            No
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          onClick={() => setConfirming(true)}
          className="h-11 px-5 text-destructive"
        >
          Cancelar cita
        </Button>
      )}
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
