import {
  STAFF_APPOINTMENT_SELECT,
  appointmentErrorResponse,
  isAppointmentStatus,
  isNonEmptyString,
  isRecord,
} from '@/lib/appointments/api';

describe('isRecord', () => {
  it('acepta objetos planos', () => {
    expect(isRecord({})).toBe(true);
    expect(isRecord({ a: 1 })).toBe(true);
  });

  it.each([null, undefined, [], 'x', 1, true])('rechaza %p', (v) => {
    expect(isRecord(v)).toBe(false);
  });
});

describe('isNonEmptyString', () => {
  it('valida longitud usando el texto recortado', () => {
    expect(isNonEmptyString('  ab  ', 2, 5)).toBe(true);
    expect(isNonEmptyString('  a  ', 2, 5)).toBe(false);
    expect(isNonEmptyString('abcdef', 2, 5)).toBe(false);
  });

  it('acepta los límites exactos', () => {
    expect(isNonEmptyString('ab', 2, 3)).toBe(true);
    expect(isNonEmptyString('abc', 2, 3)).toBe(true);
  });

  it.each([null, undefined, 12, [], {}])('rechaza no-strings: %p', (v) => {
    expect(isNonEmptyString(v, 1, 10)).toBe(false);
  });
});

describe('isAppointmentStatus', () => {
  it.each(['pending', 'confirmed', 'cancelled', 'completed'])(
    'acepta %s',
    (s) => expect(isAppointmentStatus(s)).toBe(true)
  );

  it.each(['PENDING', '', null, undefined, 1, 'done'])('rechaza %p', (s) =>
    expect(isAppointmentStatus(s)).toBe(false)
  );
});

describe('STAFF_APPOINTMENT_SELECT', () => {
  it('no expone el hash del token de cancelación', () => {
    expect(STAFF_APPOINTMENT_SELECT).not.toMatch(/token/i);
    expect(STAFF_APPOINTMENT_SELECT).toContain('appointment_services(');
  });
});

describe('appointmentErrorResponse', () => {
  let errorSpy: jest.SpyInstance;

  beforeEach(() => {
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => errorSpy.mockRestore());

  it.each([
    [{ code: 'P0001', message: 'slot_unavailable' }, 409],
    [{ code: 'P0001', message: 'cancellation_window_closed' }, 409],
    [{ code: 'P0001', message: 'appointment_not_found' }, 404],
    [{ code: 'P0001', message: 'appointment_not_cancellable' }, 404],
    [{ code: '22023', message: 'x' }, 400],
    [{ code: 'P0001', message: 'otra' }, 500],
    [{}, 500],
  ])('mapea %p a status %i', async (error, status) => {
    const res = appointmentErrorResponse(error, 'op');
    expect(res.status).toBe(status);
    expect(typeof (await res.json()).error).toBe('string');
  });

  it('solo registra en consola los errores 500', () => {
    appointmentErrorResponse(
      { code: 'P0001', message: 'slot_unavailable' },
      'op'
    );
    expect(errorSpy).not.toHaveBeenCalled();

    appointmentErrorResponse({ code: 'XX' }, 'op');
    expect(errorSpy).toHaveBeenCalledTimes(1);
  });
});
