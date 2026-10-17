import Image from 'next/image';

import { cn } from '@/lib/utils';

// The logo uses dark brown strokes, so it sits on a light chip to stay
// readable in dark mode.
export function BrandLogo({
  className,
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src="/logo.webp"
      alt="Rulos y Rizos Hair Salon"
      width={1358}
      height={1158}
      priority={priority}
      className={cn(
        'h-12 w-auto rounded-lg bg-white px-1.5 py-0.5 ring-1 ring-foreground/10',
        className
      )}
    />
  );
}
