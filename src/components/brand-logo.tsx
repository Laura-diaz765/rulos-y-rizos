import Image from 'next/image';

import logo from '@/assets/logo.webp';
import { cn } from '@/lib/utils';

// The logo has a white background. In light mode it blends into the page
// (multiply), in dark mode it keeps a soft white backing so the dark brown
// strokes stay readable. It is imported statically so a missing file breaks
// the build instead of shipping a broken image.
export function BrandLogo({
  className,
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src={logo}
      alt="Rulos y Rizos Hair Salon"
      priority={priority}
      className={cn(
        'h-12 w-auto mix-blend-multiply dark:rounded-2xl dark:bg-white dark:p-1.5 dark:mix-blend-normal',
        className
      )}
    />
  );
}
