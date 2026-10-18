// Temporary landing content. It will come from Supabase later, so components
// receive it as props instead of importing it directly.

export type NavLink = {
  label: string;
  href: string;
};

export type Brand = {
  nombre: string;
  iniciales: string;
  lema: string;
};

export type ResumenCita = {
  servicios: string;
  duracionMin: number;
  dia: string;
  hora: string;
  total: number;
  estado: string;
};

export type Service = {
  id: string;
  nombre: string;
  descripcion: string;
  duracionMin: number;
  precio: number;
};

export type Step = {
  titulo: string;
  descripcion: string;
};

// Icons are stored as keys (not components) so the data can come from Supabase.
export type TipIcon = 'luz' | 'enchufe' | 'info';

export type Tip = {
  texto: string;
  icono: TipIcon;
};

export const WHATSAPP_URL = 'https://wa.me/573115916075';
export const BUSINESS_HOURS = 'Lunes a sábado, de 8:00 a. m. a 6:00 p. m.';

// Must match the 24-hour window enforced by the cancellation function in Supabase.
export const CANCELLATION_HOURS = 24;

// Placeholders until those pages exist.
export const PRIVACY_HREF = '/politica-de-privacidad';
export const PROVIDER_LOGIN_HREF = '/auth/login';

export const BOOKING_HREF = '/reservar';

export const brand: Brand = {
  nombre: "Rulos y Rizos Pa'ti",
  iniciales: 'RR',
  lema: 'Salón de belleza a domicilio',
};

export const navLinks: NavLink[] = [
  { label: 'Servicios', href: '#servicios' },
  { label: 'Cómo reservar', href: '#como-reservar' },
  { label: 'Zonas de atención', href: '#zonas' },
  { label: 'Contacto', href: '#contacto' },
];

export const heroBenefits: string[] = [
  'Precio y duración claros antes de reservar',
  'Solo ves los horarios disponibles',
  'Cancelas fácil desde el enlace de tu cita',
];

export const resumenEjemplo: ResumenCita = {
  servicios: 'Peinado + Maquillaje social',
  duracionMin: 105,
  dia: 'Sáb.',
  hora: '10:30 a. m.',
  total: 160000,
  estado: 'Confirmada',
};

// Keep ids, durations and prices in sync with public.services in Supabase.
export const services: Service[] = [
  {
    id: 'corte-dama',
    nombre: 'Corte de cabello dama',
    descripcion:
      'Corte y asesoría según la forma de tu rostro y tu tipo de cabello, con lavado y secado.',
    duracionMin: 50,
    precio: 45000,
  },
  {
    id: 'corte-caballero',
    nombre: 'Corte de cabello caballero',
    descripcion: 'Corte clásico o moderno, con perfilado y acabado a tu gusto.',
    duracionMin: 30,
    precio: 30000,
  },
  {
    id: 'tinte',
    nombre: 'Tinte y color',
    descripcion:
      'Aplicación de color completo o retoque de raíz con productos de calidad profesional.',
    duracionMin: 120,
    precio: 150000,
  },
  {
    id: 'mechas-balayage',
    nombre: 'Mechas y balayage',
    descripcion:
      'Iluminaciones, mechas o balayage para un color con dimensión y movimiento.',
    duracionMin: 210,
    precio: 280000,
  },
  {
    id: 'alisado-keratina',
    nombre: 'Alisado y keratina',
    descripcion:
      'Tratamiento de alisado con keratina para reducir el frizz y dar brillo y suavidad.',
    duracionMin: 180,
    precio: 250000,
  },
  {
    id: 'tratamiento-capilar',
    nombre: 'Tratamiento capilar',
    descripcion:
      'Hidratación o reconstrucción profunda para cabello seco, maltratado o debilitado.',
    duracionMin: 60,
    precio: 80000,
  },
  {
    id: 'maquillaje-social',
    nombre: 'Maquillaje social',
    descripcion:
      'Maquillaje para eventos y ocasiones especiales, en la comodidad de tu casa.',
    duracionMin: 60,
    precio: 90000,
  },
  {
    id: 'peinado',
    nombre: 'Peinado',
    descripcion:
      'Peinados para eventos o para el día a día, pensados para tu tipo de cabello.',
    duracionMin: 45,
    precio: 70000,
  },
  {
    id: 'definicion-de-rizos',
    nombre: 'Definición de rizos',
    descripcion:
      'Lavado, hidratación y definición para que tus rizos luzcan sanos y con forma.',
    duracionMin: 50,
    precio: 85000,
  },
  {
    id: 'manicure',
    nombre: 'Manicure',
    descripcion: 'Limpieza, forma y esmaltado de uñas de las manos.',
    duracionMin: 45,
    precio: 35000,
  },
  {
    id: 'pedicure',
    nombre: 'Pedicure',
    descripcion:
      'Limpieza, exfoliación, forma y esmaltado de uñas de los pies.',
    duracionMin: 60,
    precio: 40000,
  },
  {
    id: 'cejas',
    nombre: 'Diseño de cejas',
    descripcion: 'Diseño y depilación de cejas para enmarcar tu mirada.',
    duracionMin: 30,
    precio: 20000,
  },
];

export const steps: Step[] = [
  {
    titulo: 'Elige tus servicios',
    descripcion:
      'Combina corte, color, uñas o lo que necesites en una sola cita. Ves la duración y el precio total al instante.',
  },
  {
    titulo: 'Escoge fecha y hora',
    descripcion:
      'Solo aparecen los horarios libres, así no tienes que preguntar uno por uno.',
  },
  {
    titulo: 'Confirma tus datos',
    descripcion:
      'Deja tu nombre, teléfono y dirección. Recibes un resumen con qué, cuándo, dónde y cuánto.',
  },
];

export const zones: string[] = [
  'Bogotá, D. C.',
  'Todas las localidades',
  'Todos los barrios',
];

export const tips: Tip[] = [
  { texto: 'Un espacio con buena luz y una silla cómoda.', icono: 'luz' },
  { texto: 'Un toma corriente cerca del lugar de la cita.', icono: 'enchufe' },
  {
    texto:
      'Cuéntanos al reservar si hay portería, ascensor o algo que debamos saber para llegar.',
    icono: 'info',
  },
];

const priceFormatter = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

export function formatPrice(precio: number): string {
  return priceFormatter.format(precio);
}
