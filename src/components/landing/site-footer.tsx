import Link from 'next/link';

type SiteFooterProps = {
  brandName: string;
  privacyHref: string;
  loginHref: string;
};

const linkClassName =
  'inline-flex min-h-11 items-center rounded-sm outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50';

export function SiteFooter({
  brandName,
  privacyHref,
  loginHref,
}: SiteFooterProps) {
  return (
    <footer className="border-t">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between md:px-8">
        <p>© 2026 {brandName} · Reservas en línea</p>
        <ul className="flex flex-col md:flex-row md:gap-6">
          <li>
            <Link href={privacyHref} className={linkClassName}>
              Política de privacidad (Ley 1581 de 2012)
            </Link>
          </li>
          <li>
            <Link href={loginHref} className={linkClassName}>
              ¿Eres el prestador? Ingresa
            </Link>
          </li>
        </ul>
      </div>
    </footer>
  );
}
