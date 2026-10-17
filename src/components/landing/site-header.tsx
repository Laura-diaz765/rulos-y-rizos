import { MessageCircle } from 'lucide-react';

import { BrandLogo } from '@/components/brand-logo';
import { ModeToggle } from '@/components/toggle-mode';
import { Button } from '@/components/ui/button';
import type { Brand, NavLink } from '@/lib/landing-data';

type SiteHeaderProps = {
  brand: Brand;
  navLinks: NavLink[];
  whatsappUrl: string;
  bookingHref: string;
};

export function SiteHeader({
  brand,
  navLinks,
  whatsappUrl,
  bookingHref,
}: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 md:px-8">
        <a
          href="#inicio"
          className="flex min-h-11 items-center gap-3 rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <BrandLogo priority />
          <span className="flex flex-col">
            <span className="text-sm leading-5 font-semibold">
              {brand.nombre}
            </span>
            <span className="text-xs leading-4 text-muted-foreground">
              {brand.lema}
            </span>
          </span>
        </a>

        <nav aria-label="Principal" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Button
                  variant="ghost"
                  nativeButton={false}
                  render={<a href={link.href} />}
                  className="h-11 px-3 text-muted-foreground"
                >
                  {link.label}
                </Button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            nativeButton={false}
            render={
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" />
            }
            aria-label="Escríbeme por WhatsApp"
            className="size-11 text-primary"
          >
            <MessageCircle className="size-5" />
          </Button>
          <ModeToggle />
          <Button
            nativeButton={false}
            render={<a href={bookingHref} />}
            className="hidden h-11 px-4 md:inline-flex"
          >
            Reserva tu cita
          </Button>
        </div>
      </div>
    </header>
  );
}
