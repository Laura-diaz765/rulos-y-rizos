import { NextRequest } from 'next/server';

import { GET as getAvailability } from '@/app/api/availability/route';
import { GET as getServices } from '@/app/api/services/route';
import { createClient } from '@/lib/supabase/server';

jest.mock('@/lib/supabase/server', () => ({ createClient: jest.fn() }));

const availability = (qs: string) =>
  getAvailability(
    new NextRequest(`http://localhost:3000/api/availability?${qs}`)
  );

beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => jest.restoreAllMocks());

describe('GET /api/availability', () => {
  it.each([
    ['sin parámetros', ''],
    ['sin servicio', 'date=2030-01-01'],
    ['sin fecha', 'serviceId=a'],
    ['servicio vacío', 'date=2030-01-01&serviceId='],
    ['formato de fecha malo', 'date=01-01-2030&serviceId=a'],
    ['fecha inexistente', 'date=2030-02-30&serviceId=a'],
    ['mes inexistente', 'date=2030-13-01&serviceId=a'],
  ])('400 %s', async (_n, qs) => {
    expect((await availability(qs)).status).toBe(400);
    expect(createClient).not.toHaveBeenCalled();
  });

  it('acepta 29 de febrero en año bisiesto', async () => {
    const rpc = jest.fn().mockResolvedValue({ data: [], error: null });
    (createClient as jest.Mock).mockResolvedValue({ rpc });
    expect((await availability('date=2028-02-29&serviceId=a')).status).toBe(
      200
    );
  });

  it('devuelve los slots y pasa todos los serviceId', async () => {
    const rpc = jest.fn().mockResolvedValue({ data: ['09:00'], error: null });
    (createClient as jest.Mock).mockResolvedValue({ rpc });

    const res = await availability('date=2030-01-01&serviceId=a&serviceId=b');

    expect(await res.json()).toEqual({ slots: ['09:00'] });
    expect(rpc).toHaveBeenCalledWith('get_available_appointment_slots', {
      p_date: '2030-01-01',
      p_service_ids: ['a', 'b'],
    });
  });

  it('traduce errores de base de datos', async () => {
    const rpc = jest
      .fn()
      .mockResolvedValue({ data: null, error: { code: '22023' } });
    (createClient as jest.Mock).mockResolvedValue({ rpc });
    expect((await availability('date=2030-01-01&serviceId=a')).status).toBe(
      400
    );
  });
});

describe('GET /api/services', () => {
  const mockQuery = (result: { data: unknown; error: unknown }) => {
    const order = jest.fn().mockResolvedValue(result);
    const eq = jest.fn().mockReturnValue({ order });
    const select = jest.fn().mockReturnValue({ eq });
    const from = jest.fn().mockReturnValue({ select });
    (createClient as jest.Mock).mockResolvedValue({ from });
    return { from, eq, order };
  };

  it('lista solo servicios activos ordenados por nombre', async () => {
    const { from, eq, order } = mockQuery({
      data: [{ id: 'a' }],
      error: null,
    });
    const res = await getServices();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ services: [{ id: 'a' }] });
    expect(from).toHaveBeenCalledWith('services');
    expect(eq).toHaveBeenCalledWith('is_active', true);
    expect(order).toHaveBeenCalledWith('name');
  });

  it('500 si la consulta falla', async () => {
    mockQuery({ data: null, error: { message: 'x' } });
    expect((await getServices()).status).toBe(500);
  });
});
