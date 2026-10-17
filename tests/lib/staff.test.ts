import { requireAppointmentStaff } from '@/lib/appointments/staff';
import { createClient } from '@/lib/supabase/server';

jest.mock('@/lib/supabase/server', () => ({ createClient: jest.fn() }));

const mockClient = (opts: {
  user?: unknown;
  authError?: unknown;
  isStaff?: unknown;
  rpcError?: unknown;
}) => {
  const supabase = {
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user: opts.user ?? null },
        error: opts.authError ?? null,
      }),
    },
    rpc: jest.fn().mockResolvedValue({
      data: opts.isStaff,
      error: opts.rpcError ?? null,
    }),
  };
  (createClient as jest.Mock).mockResolvedValue(supabase);
  return supabase;
};

describe('requireAppointmentStaff', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => jest.restoreAllMocks());

  it('401 si no hay usuario', async () => {
    const supabase = mockClient({});
    const result = await requireAppointmentStaff();
    expect(result.response?.status).toBe(401);
    expect(supabase.rpc).not.toHaveBeenCalled();
  });

  it('401 si getUser devuelve error', async () => {
    mockClient({ user: { id: '1' }, authError: new Error('x') });
    const result = await requireAppointmentStaff();
    expect(result.response?.status).toBe(401);
  });

  it('500 si falla la verificación de staff', async () => {
    mockClient({ user: { id: '1' }, rpcError: { message: 'boom' } });
    const result = await requireAppointmentStaff();
    expect(result.response?.status).toBe(500);
  });

  it('403 si el usuario no es staff', async () => {
    mockClient({ user: { id: '1' }, isStaff: false });
    const result = await requireAppointmentStaff();
    expect(result.response?.status).toBe(403);
  });

  it('devuelve el cliente si es staff', async () => {
    const supabase = mockClient({ user: { id: '1' }, isStaff: true });
    const result = await requireAppointmentStaff();
    expect(result.response).toBeUndefined();
    expect(result.supabase).toBe(supabase);
    expect(supabase.rpc).toHaveBeenCalledWith('is_appointment_staff');
  });
});
