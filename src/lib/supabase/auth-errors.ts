// Supabase Auth returns English messages, so the UI shows Spanish text based
// on the stable error code instead. See https://supabase.com/docs/guides/auth/debugging/error-codes
const authErrorMessages: Record<string, string> = {
  invalid_credentials:
    'El correo electrónico o la contraseña no son correctos.',
  email_not_confirmed:
    'Debes confirmar tu correo electrónico antes de ingresar.',
  user_banned: 'Esta cuenta está bloqueada. Comunícate con el administrador.',
  over_request_rate_limit:
    'Demasiados intentos. Espera unos minutos e inténtalo de nuevo.',
  over_email_send_rate_limit:
    'Ya enviamos varios correos. Espera unos minutos antes de pedir otro.',
  weak_password:
    'La contraseña es muy débil. Usa al menos 6 caracteres y combina letras y números.',
  same_password: 'La nueva contraseña debe ser diferente a la anterior.',
  session_not_found:
    'Tu sesión expiró. Solicita un nuevo enlace para cambiar la contraseña.',
  otp_expired: 'El enlace expiró o ya fue usado. Solicita uno nuevo.',
  missing_token: 'El enlace no es válido o está incompleto.',
  user_already_exists: 'Ya existe una cuenta con este correo electrónico.',
  email_exists: 'Ya existe una cuenta con este correo electrónico.',
  signup_disabled: 'El registro de cuentas nuevas está desactivado.',
  password_mismatch: 'Las contraseñas no coinciden.',
};

const fallbackMessage = 'Ocurrió un error inesperado. Inténtalo de nuevo.';

export function getAuthErrorMessage(code: unknown): string {
  if (typeof code === 'string' && code in authErrorMessages) {
    return authErrorMessages[code];
  }
  return fallbackMessage;
}

export function getAuthErrorMessageFromError(error: unknown): string {
  const code =
    typeof error === 'object' && error !== null && 'code' in error
      ? error.code
      : undefined;
  return getAuthErrorMessage(code);
}
