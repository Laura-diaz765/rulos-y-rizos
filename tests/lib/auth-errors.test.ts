import {
  getAuthErrorMessage,
  getAuthErrorMessageFromError,
} from '@/lib/supabase/auth-errors';

const fallback = getAuthErrorMessage('codigo_desconocido');

describe('getAuthErrorMessage', () => {
  it('traduce códigos conocidos', () => {
    expect(getAuthErrorMessage('invalid_credentials')).not.toBe(fallback);
    expect(getAuthErrorMessage('email_exists')).toBe(
      getAuthErrorMessage('user_already_exists')
    );
  });

  it.each([undefined, null, 5, {}, 'otro'])(
    'devuelve el mensaje genérico para %p',
    (code) => {
      expect(getAuthErrorMessage(code)).toBe(fallback);
    }
  );
});

describe('getAuthErrorMessageFromError', () => {
  it('lee el código del error', () => {
    expect(getAuthErrorMessageFromError({ code: 'otp_expired' })).toBe(
      getAuthErrorMessage('otp_expired')
    );
  });

  it.each([null, undefined, 'texto', {}, new Error('x')])(
    'devuelve el mensaje genérico para %p',
    (error) => {
      expect(getAuthErrorMessageFromError(error)).toBe(fallback);
    }
  );
});
