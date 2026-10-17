import { NextRequest } from 'next/server';

import { POST } from '@/app/api/appointments/route';
import { createClient } from '@/lib/supabase/server';

jest.mock('@/lib/supabase/server', () => ({ createClient: jest.fn() }));

const validBody = {
  customerName: ' Ana Pérez ',
  customerPhone: '3001234567',
  customerEmail: ' ana@example.com ',
  address: 'Calle 1 # 2-3',
  notes: ' nota ',
  startsAt: '2030-01-01T10:00:00.000Z',
  serviceIds: ['corte-rizos'],
};

const post = (body: unknown, raw = false) =>
  POST(
    new NextRequest('http://localhost:3000/api/appointments', {
      method: 'POST',
      body: raw ? (body as string) : JSON.stringify(body),
    })
  );

const mockRpc = (result: { data?: unknown; error?: unknown }) => {
  const rpc = jest.fn().mockResolvedValue({
    data: result.data ?? null,
    error: result.error ?? null,
  });
  (createClient as jest.Mock).mockResolvedValue({ rpc });
  return rpc;
};

describe('POST /api/appointments', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => jest.restoreAllMocks());

  it('400 si el JSON es inválido', async () => {
    expect((await post('{no', true)).status).toBe(400);
  });

  it.each([[null], [[]], ['texto']])('400 si el cuerpo es %p', async (b) => {
    expect((await post(b)).status).toBe(400);
  });

  it.each([
    ['nombre corto', { customerName: 'A' }],
    ['teléfono corto', { customerPhone: '123' }],
    ['dirección corta', { address: 'abc' }],
    ['email no string', { customerEmail: 5 }],
    ['email muy largo', { customerEmail: 'a'.repeat(255) }],
    ['notas muy largas', { notes: 'a'.repeat(1001) }],
    ['notas no string', { notes: 5 }],
    ['fecha inválida', { startsAt: 'no-es-fecha' }],
    ['fecha no string', { startsAt: 123 }],
    ['sin servicios', { serviceIds: [] }],
    ['demasiados servicios', { serviceIds: ['a', 'b', 'c', 'd', 'e', 'f'] }],
    ['servicio con formato inválido', { serviceIds: ['Corte!'] }],
    ['servicios no array', { serviceIds: 'corte' }],
  ])('400 con %s', async (_name, override) => {
    const rpc = mockRpc({});
    const res = await post({ ...validBody, ...override });
    expect(res.status).toBe(400);
    expect(rpc).not.toHaveBeenCalled();
  });

  it('crea la cita y limpia los datos antes de llamar al RPC', async () => {
    const rpc = mockRpc({
      data: {
        id: 'abc',
        starts_at: 's',
        ends_at: 'e',
        duration_minutes: 60,
        total_price_cop: 50000,
        status: 'pending',
        cancellation_token: 'tok',
      },
    });

    const res = await post(validBody);
    const json = await res.json();

    expect(res.status).toBe(201);
    expect(rpc).toHaveBeenCalledWith('create_public_appointment', {
      p_customer_name: 'Ana Pérez',
      p_customer_phone: '3001234567',
      p_customer_email: 'ana@example.com',
      p_address: 'Calle 1 # 2-3',
      p_notes: 'nota',
      p_starts_at: validBody.startsAt,
      p_service_ids: ['corte-rizos'],
    });
    expect(json.cancellationUrl).toBe(
      'http://localhost:3000/citas/cancelar?token=tok'
    );
    expect(json.appointment).toEqual({
      id: 'abc',
      startsAt: 's',
      endsAt: 'e',
      durationMinutes: 60,
      totalPriceCop: 50000,
      status: 'pending',
    });
  });

  it('envía email null y notas vacías cuando faltan', async () => {
    const rpc = mockRpc({ data: { cancellation_token: 't' } });
    const { customerEmail, notes, ...rest } = validBody;
    void customerEmail;
    void notes;
    await post(rest);
    expect(rpc.mock.calls[0][1]).toMatchObject({
      p_customer_email: null,
      p_notes: '',
    });
  });

  it('409 si el horario ya no está disponible', async () => {
    mockRpc({ error: { code: 'P0001', message: 'slot_unavailable' } });
    expect((await post(validBody)).status).toBe(409);
  });

  it('500 si el RPC devuelve una respuesta inválida', async () => {
    mockRpc({ data: { id: 'x' } });
    expect((await post(validBody)).status).toBe(500);
  });
});
