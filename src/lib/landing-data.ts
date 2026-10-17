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

// Placeholder until the stylist's real WhatsApp number is defined.
export const WHATSAPP_URL = 'https://wa.me/570000000000';

// Must match the 24-hour window enforced by the cancellation function in Supabase.
export const CANCELLATION_HOURS = 24;

// Placeholders until those pages exist.
export const PRIVACY_HREF = '/politica-de-privacidad';
export const PROVIDER_LOGIN_HREF = '/auth/login';

export const BOOKING_HREF = '/reservar';

export const brand: Brand = {
  nombre: "Rulos y Rizos Pa'ti",
  iniciales: 'RR',
  lema: 'Rizos y peinado a domicilio',
};

export const navLinks: NavLink[] = [
  { label: 'Servicios', href: '#servicios' },
  { label: 'Cómo reservar', href: '#como-reservar' },
  { label: 'Zonas de atención', href: '#zonas' },
  { label: 'Contacto', href: '#contacto' },
];

export const heroBenefits: string[] = [
  'Precio y duración antes de reservar',
  'Solo ves los horarios disponibles',
  'Cancelas desde el enlace de tu cita',
];

export const resumenEjemplo: ResumenCita = {
  servicios: 'Peinado + Maquillaje social',
  duracionMin: 105,
  dia: 'Sáb.',
  hora: '10:30 a. m.',
  total: 160000,
  estado: 'Confirmada',
};

export const services: Service[] = [
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
];

export const steps: Step[] = [
  {
    titulo: 'Elige tus servicios',
    descripcion:
      'Combina varios en una sola cita. Ves la duración y el precio total al instante.',
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
  '[Ciudad]',
  '[Barrio o zona 1]',
  '[Barrio o zona 2]',
  '[Barrio o zona 3]',
];

export const tips: Tip[] = [
  { texto: 'Un espacio con buena luz y una silla cómoda.', icono: 'luz' },
  { texto: 'Un toma corriente cerca del lugar de la cita.', icono: 'enchufe' },
  {
    texto:
      'Cuéntame al reservar si hay portería, ascensor o algo que deba saber para llegar.',
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
