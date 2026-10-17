import { NextRequest } from 'next/server';

import { DELETE, GET } from '@/app/api/appointments/manage/route';
import { createClient } from '@/lib/supabase/server';

jest.mock('@/lib/supabase/server', () => ({ createClient: jest.fn() }));

const token = 'a'.repeat(64);
const req = (t?: string) =>
  new NextRequest(
    `http://localhost:3000/api/appointments/manage${t === undefined ? '' : `?token=${t}`}`
  );

const mockRpc = (result: { data?: unknown; error?: unknown }) => {
  const rpc = jest.fn().mockResolvedValue({
    data: result.data ?? null,
    error: result.error ?? null,
  });
  (createClient as jest.Mock).mockResolvedValue({ rpc });
  return rpc;
};

beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => jest.restoreAllMocks());

describe.each([
  ['GET', GET],
  ['DELETE', DELETE],
])('%s /api/appointments/manage — validación de token', (_n, handler) => {
  it.each([
    undefined,
    '',
    'abc',
    'A'.repeat(64),
    'g'.repeat(64),
    'a'.repeat(65),
  ])('404 con token %p sin consultar la base', async (t) => {
    expect((await handler(req(t))).status).toBe(404);
    expect(createClient).not.toHaveBeenCalled();
  });
});

describe('GET', () => {
  it('devuelve la cita', async () => {
    const rpc = mockRpc({ data: { id: '1' } });
    const res = await GET(req(token));
    expect(await res.json()).toEqual({ appointment: { id: '1' } });
    expect(rpc).toHaveBeenCalledWith('get_public_appointment', {
      p_token: token,
    });
  });

  it('404 si no existe', async () => {
    mockRpc({ data: null });
    expect((await GET(req(token))).status).toBe(404);
  });

  it('traduce errores de base de datos', async () => {
    mockRpc({ error: { code: 'XX' } });
    expect((await GET(req(token))).status).toBe(500);
  });
});

describe('DELETE', () => {
  it('cancela la cita', async () => {
    const rpc = mockRpc({ data: { id: '1', status: 'cancelled' } });
    const res = await DELETE(req(token));
    expect(res.status).toBe(200);
    expect(rpc).toHaveBeenCalledWith('cancel_public_appointment', {
      p_token: token,
    });
  });

  it('409 si venció el plazo', async () => {
    mockRpc({
      error: { code: 'P0001', message: 'cancellation_window_closed' },
    });
    expect((await DELETE(req(token))).status).toBe(409);
  });

  it('500 si la respuesta no es un objeto', async () => {
    mockRpc({ data: 'ok' });
    expect((await DELETE(req(token))).status).toBe(500);
  });
});
