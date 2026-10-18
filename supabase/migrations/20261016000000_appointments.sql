create extension if not exists pgcrypto with schema extensions;

create table public.services (
  id text primary key,
  name text not null,
  description text not null default '',
  duration_minutes integer not null check (duration_minutes > 0),
  price_cop integer not null check (price_cop >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.services (id, name, description, duration_minutes, price_cop)
values
  ('maquillaje-social', 'Maquillaje social', 'Maquillaje para eventos y ocasiones especiales, en la comodidad de tu casa.', 60, 90000),
  ('peinado', 'Peinado', 'Peinados para eventos o para el día a día, pensados para tu tipo de cabello.', 45, 70000),
  ('definicion-de-rizos', 'Definición de rizos', 'Lavado, hidratación y definición para que tus rizos luzcan sanos y con forma.', 50, 85000)
on conflict (id) do nothing;

create table public.business_hours (
  weekday smallint primary key check (weekday between 1 and 7),
  opens_at time not null,
  closes_at time not null,
  is_open boolean not null default true,
  check (opens_at < closes_at)
);

insert into public.business_hours (weekday, opens_at, closes_at, is_open)
values
  (1, '08:00', '18:00', true),
  (2, '08:00', '18:00', true),
  (3, '08:00', '18:00', true),
  (4, '08:00', '18:00', true),
  (5, '08:00', '18:00', true),
  (6, '08:00', '18:00', true),
  (7, '08:00', '18:00', false)
on conflict (weekday) do nothing;

create table public.staff_members (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_appointment_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.staff_members
    where user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_appointment_staff() from public;
grant execute on function public.is_appointment_staff() to authenticated;

create table public.appointments (
  id uuid primary key default extensions.gen_random_uuid(),
  customer_name text not null check (length(trim(customer_name)) between 2 and 120),
  customer_phone text not null check (length(trim(customer_phone)) between 7 and 30),
  customer_email text check (
    customer_email is null
    or (length(customer_email) <= 254 and position('@' in customer_email) > 1)
  ),
  address text not null check (length(trim(address)) between 5 and 300),
  notes text not null default '' check (length(notes) <= 1000),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  duration_minutes integer not null check (duration_minutes > 0),
  total_price_cop integer not null check (total_price_cop >= 0),
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'cancelled', 'completed')),
  cancellation_token_hash bytea,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (starts_at < ends_at),
  check (ends_at = starts_at + make_interval(mins => duration_minutes))
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger services_set_updated_at
  before update on public.services
  for each row execute function public.set_updated_at();

create trigger appointments_set_updated_at
  before update on public.appointments
  for each row execute function public.set_updated_at();

alter table public.appointments
  add constraint appointments_no_overlapping_active_times
  exclude using gist (tstzrange(starts_at, ends_at, '[)') with &&)
  where (status <> 'cancelled');

create table public.appointment_services (
  appointment_id uuid not null references public.appointments (id) on delete cascade,
  service_id text not null references public.services (id),
  service_name text not null,
  duration_minutes integer not null check (duration_minutes > 0),
  price_cop integer not null check (price_cop >= 0),
  primary key (appointment_id, service_id)
);

create index appointments_starts_at_idx on public.appointments (starts_at);
create index appointments_status_starts_at_idx on public.appointments (status, starts_at);

alter table public.services enable row level security;
alter table public.business_hours enable row level security;
alter table public.staff_members enable row level security;
alter table public.appointments enable row level security;
alter table public.appointment_services enable row level security;

create policy "Anyone can read active services"
  on public.services for select
  to anon, authenticated
  using (is_active);
create policy "Staff can manage services"
  on public.services for all
  to authenticated
  using ((select public.is_appointment_staff()))
  with check ((select public.is_appointment_staff()));

create policy "Anyone can read business hours"
  on public.business_hours for select
  to anon, authenticated
  using (true);
create policy "Staff can manage business hours"
  on public.business_hours for all
  to authenticated
  using ((select public.is_appointment_staff()))
  with check ((select public.is_appointment_staff()));

create policy "Staff can read their own membership"
  on public.staff_members for select
  to authenticated
  using (user_id = (select auth.uid()));

create policy "Staff can manage appointments"
  on public.appointments for all
  to authenticated
  using ((select public.is_appointment_staff()))
  with check ((select public.is_appointment_staff()));

create policy "Staff can manage appointment services"
  on public.appointment_services for all
  to authenticated
  using ((select public.is_appointment_staff()))
  with check ((select public.is_appointment_staff()));

grant select on public.services, public.business_hours to anon, authenticated;
grant select, insert, update, delete on public.services, public.business_hours to authenticated;
grant select on public.staff_members to authenticated;
grant select, insert, update, delete on public.appointments, public.appointment_services to authenticated;

create or replace function public.get_available_appointment_slots(
  p_date date,
  p_service_ids text[]
)
returns table (starts_at timestamptz, ends_at timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_hours public.business_hours%rowtype;
  v_duration integer;
  v_open timestamptz;
  v_close timestamptz;
begin
  if p_date is null or p_date < (now() at time zone 'America/Bogota')::date then
    raise exception using errcode = '22023', message = 'invalid_date';
  end if;

  if p_service_ids is null
    or cardinality(p_service_ids) not between 1 and 5
    or (select count(distinct service_id) from unnest(p_service_ids) as requested(service_id))
      <> cardinality(p_service_ids)
  then
    raise exception using errcode = '22023', message = 'invalid_services';
  end if;

  select sum(s.duration_minutes)::integer
    into v_duration
    from public.services as s
    where s.id = any (p_service_ids) and s.is_active;

  if v_duration is null or (
    select count(*) from public.services as s
    where s.id = any (p_service_ids) and s.is_active
  ) <> cardinality(p_service_ids) then
    raise exception using errcode = '22023', message = 'invalid_services';
  end if;

  select *
    into v_hours
    from public.business_hours
    where weekday = extract(isodow from p_date)::smallint;

  if not found or not v_hours.is_open then
    return;
  end if;

  v_open := (p_date + v_hours.opens_at) at time zone 'America/Bogota';
  v_close := (p_date + v_hours.closes_at) at time zone 'America/Bogota';

  return query
  select slot, slot + make_interval(mins => v_duration)
    from generate_series(
      v_open,
      v_close - make_interval(mins => v_duration),
      interval '30 minutes'
    ) as slots(slot)
    where slot > now()
      and not exists (
        select 1
        from public.appointments as a
        where a.status <> 'cancelled'
          and tstzrange(a.starts_at, a.ends_at, '[)')
            && tstzrange(slot, slot + make_interval(mins => v_duration), '[)')
      )
    order by slot;
end;
$$;

create or replace function public.create_public_appointment(
  p_customer_name text,
  p_customer_phone text,
  p_customer_email text,
  p_address text,
  p_notes text,
  p_starts_at timestamptz,
  p_service_ids text[]
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_duration integer;
  v_total integer;
  v_ends_at timestamptz;
  v_token text;
  v_appointment_id uuid;
begin
  if p_customer_name is null or length(trim(p_customer_name)) not between 2 and 120
    or p_customer_phone is null or length(trim(p_customer_phone)) not between 7 and 30
    or p_address is null or length(trim(p_address)) not between 5 and 300
    or coalesce(length(p_notes), 0) > 1000
    or (p_customer_email is not null and (
      length(p_customer_email) > 254 or position('@' in p_customer_email) <= 1
    ))
    or p_starts_at is null
  then
    raise exception using errcode = '22023', message = 'invalid_booking_details';
  end if;

  if p_service_ids is null
    or cardinality(p_service_ids) not between 1 and 5   
    or (select count(distinct service_id) from unnest(p_service_ids) as requested(service_id))
      <> cardinality(p_service_ids) 
  then
    raise exception using errcode = '22023', message = 'invalid_services';
  end if;

  select sum(s.duration_minutes)::integer, sum(s.price_cop)::integer
    into v_duration, v_total
    from public.services as s
    where s.id = any (p_service_ids) and s.is_active;

  if v_duration is null or (
    select count(*) from public.services as s
    where s.id = any (p_service_ids) and s.is_active
  ) <> cardinality(p_service_ids) then
    raise exception using errcode = '22023', message = 'invalid_services';
  end if;

  v_ends_at := p_starts_at + make_interval(mins => v_duration);

  if not exists (
    select 1
    from public.get_available_appointment_slots(
      (p_starts_at at time zone 'America/Bogota')::date,
      p_service_ids
    ) as slot
    where slot.starts_at = p_starts_at
  ) then
    raise exception using errcode = 'P0001', message = 'slot_unavailable';
  end if;

  v_token := encode(extensions.gen_random_bytes(32), 'hex');

  insert into public.appointments (
    customer_name,
    customer_phone,
    customer_email,
    address,
    notes,
    starts_at,
    ends_at,
    duration_minutes,
    total_price_cop,
    cancellation_token_hash
  )
  values (
    trim(p_customer_name),
    trim(p_customer_phone),
    nullif(trim(p_customer_email), ''),
    trim(p_address),
    coalesce(trim(p_notes), ''),
    p_starts_at,
    v_ends_at,
    v_duration,
    v_total,
    extensions.digest(v_token, 'sha256')
  )
  returning id into v_appointment_id;

  insert into public.appointment_services (
    appointment_id,
    service_id,
    service_name,
    duration_minutes,
    price_cop
  )
  select
    v_appointment_id,
    s.id,
    s.name,
    s.duration_minutes,
    s.price_cop
  from public.services as s
  where s.id = any (p_service_ids);

  return jsonb_build_object(
    'id', v_appointment_id,
    'cancellation_token', v_token,
    'starts_at', p_starts_at,
    'ends_at', v_ends_at,
    'duration_minutes', v_duration,
    'total_price_cop', v_total,
    'status', 'pending'
  );
exception
  when exclusion_violation then
    raise exception using errcode = 'P0001', message = 'slot_unavailable';
end;
$$;

create or replace function public.get_public_appointment(p_token text)
returns jsonb
language sql
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'id', a.id,
    'customer_name', a.customer_name,
    'starts_at', a.starts_at,
    'ends_at', a.ends_at,
    'duration_minutes', a.duration_minutes,
    'total_price_cop', a.total_price_cop,
    'status', a.status,
    'can_cancel',
      a.status in ('pending', 'confirmed')
      and now() <= a.starts_at - interval '24 hours',
    'services', coalesce((
      select jsonb_agg(jsonb_build_object(
        'name', aps.service_name,
        'duration_minutes', aps.duration_minutes,
        'price_cop', aps.price_cop
      ) order by aps.service_name)
      from public.appointment_services as aps
      where aps.appointment_id = a.id
    ), '[]'::jsonb)
  )
  from public.appointments as a
  where p_token ~ '^[0-9a-f]{64}$'
    and a.cancellation_token_hash = extensions.digest(p_token, 'sha256');
$$;

create or replace function public.cancel_public_appointment(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_appointment public.appointments%rowtype;
begin
  if p_token is null or p_token !~ '^[0-9a-f]{64}$' then
    raise exception using errcode = 'P0001', message = 'appointment_not_found';
  end if;

  select *
    into v_appointment
    from public.appointments as a
    where a.cancellation_token_hash = extensions.digest(p_token, 'sha256')
    for update;

  if not found then
    raise exception using errcode = 'P0001', message = 'appointment_not_found';
  end if;

  if v_appointment.status = 'cancelled' then
    return jsonb_build_object('status', 'cancelled');
  end if;

  if v_appointment.status = 'completed' then
    raise exception using errcode = 'P0001', message = 'appointment_not_cancellable';
  end if;

  if now() > v_appointment.starts_at - interval '24 hours' then
    raise exception using errcode = 'P0001', message = 'cancellation_window_closed';
  end if;

  update public.appointments
    set status = 'cancelled', updated_at = now()
    where id = v_appointment.id;

  return jsonb_build_object('status', 'cancelled');
end;
$$;

-- Catálogo ampliado de servicios de salón. Los precios son de referencia:
-- ajústalos desde Supabase (tabla public.services) con los valores reales.
insert into public.services (id, name, description, duration_minutes, price_cop)
values
  ('corte-dama', 'Corte de cabello dama', 'Corte y asesoría según la forma de tu rostro y tu tipo de cabello, con lavado y secado.', 50, 45000),
  ('corte-caballero', 'Corte de cabello caballero', 'Corte clásico o moderno, con perfilado y acabado a tu gusto.', 30, 30000),
  ('tinte', 'Tinte y color', 'Aplicación de color completo o retoque de raíz con productos de calidad profesional.', 120, 150000),
  ('mechas-balayage', 'Mechas y balayage', 'Iluminaciones, mechas o balayage para un color con dimensión y movimiento.', 210, 280000),
  ('alisado-keratina', 'Alisado y keratina', 'Tratamiento de alisado con keratina para reducir el frizz y dar brillo y suavidad.', 180, 250000),
  ('tratamiento-capilar', 'Tratamiento capilar', 'Hidratación o reconstrucción profunda para cabello seco, maltratado o debilitado.', 60, 80000),
  ('manicure', 'Manicure', 'Limpieza, forma y esmaltado de uñas de las manos.', 45, 35000),
  ('pedicure', 'Pedicure', 'Limpieza, exfoliación, forma y esmaltado de uñas de los pies.', 60, 40000),
  ('cejas', 'Diseño de cejas', 'Diseño y depilación de cejas para enmarcar tu mirada.', 30, 20000)
on conflict (id) do nothing;

revoke all on function public.get_available_appointment_slots(date, text[]) from public;
revoke all on function public.create_public_appointment(text, text, text, text, text, timestamptz, text[]) from public;
revoke all on function public.get_public_appointment(text) from public;
revoke all on function public.cancel_public_appointment(text) from public;

grant execute on function public.get_available_appointment_slots(date, text[]) to anon, authenticated;
grant execute on function public.create_public_appointment(text, text, text, text, text, timestamptz, text[]) to anon, authenticated;
grant execute on function public.get_public_appointment(text) to anon, authenticated;
grant execute on function public.cancel_public_appointment(text) to anon, authenticated;
