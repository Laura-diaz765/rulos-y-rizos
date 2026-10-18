# Citas en Supabase

## Flujo implementado

1. La landing consulta `GET /api/services` y solicita horarios con
   `GET /api/availability?date=AAAA-MM-DD&serviceId=...`. Se pueden repetir los
   parámetros `serviceId` para reservar varios servicios seguidos.
2. La clienta envía sus datos y el horario elegido a `POST /api/appointments`.
   La base calcula precio y duración desde el catálogo, comprueba el horario y
   crea la cita y sus servicios en una transacción.
3. La respuesta incluye una URL privada para consultar la cita y cancelarla.
   El token aleatorio se entrega una sola vez y en la base solo se guarda su
   hash. La cancelación pública se permite hasta 24 horas antes de la cita.
4. La prestadora gestiona las citas por `GET /api/panel/appointments`,
   `GET/PATCH/DELETE /api/panel/appointments/:id`. `DELETE` cancela la cita
   lógicamente para conservar el historial. La modificación permite actualizar
   los datos de contacto, las notas y el estado.

La zona horaria usada para el calendario es `America/Bogota`. El horario inicial
se carga de lunes a sábado, 08:00–18:00, con turnos cada 30 minutos.

## Aplicar la migración

Ejecuta `migrations/20261016000000_appointments.sql` en el SQL Editor del
proyecto Supabase. La migración crea el catálogo, los horarios, las citas, las
políticas RLS y las funciones transaccionales de disponibilidad, reserva y
cancelación. Los tres servicios existentes en la landing se cargan como datos
iniciales; si ya existe un servicio con ese identificador, se conserva su
configuración.

Después ejecuta también `migrations/20261017000000_more_salon_services.sql`, que
agrega el resto de servicios del salón (corte, color, mechas, keratina,
tratamiento capilar, manicure, pedicure y cejas). La página de reserva solo
muestra los servicios que existen en la tabla `services`.

## Autorizar a la prestadora

1. Crea/invita la cuenta de la prestadora en Supabase Auth y confirma su correo.
2. En Supabase Auth, copia el UUID de esa cuenta.
3. Inserta únicamente a esa persona como integrante del personal:

   ```sql
   insert into public.staff_members (user_id)
   values ('UUID-DE-LA-CUENTA');
   ```

El registro público de Auth no concede permisos de panel por sí solo. La
autorización la determina `staff_members` y se aplica tanto en la API como en
las políticas RLS.

## Ejemplo de reserva

```json
{
  "customerName": "Laura",
  "customerPhone": "+573001234567",
  "customerEmail": "laura@example.com",
  "address": "Calle 10 # 20-30, apartamento 4",
  "notes": "",
  "startsAt": "2026-10-20T08:00:00-05:00",
  "serviceIds": ["definicion-de-rizos"]
}
```

`startsAt` debe incluir el offset de zona horaria. La base vuelve a comprobar
disponibilidad al confirmar: si otra persona toma el horario al mismo tiempo,
la restricción de exclusión evita la doble reserva y la API responde `409`.

El formulario de reserva público está en `/reservar` y usa estos endpoints; la
interfaz de administración del panel aún debe conectarse a ellos. El token de
cancelación funciona como una credencial privada: no debe registrarse en
analítica ni compartirse con terceros.
