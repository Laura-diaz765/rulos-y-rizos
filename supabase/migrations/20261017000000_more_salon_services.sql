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
