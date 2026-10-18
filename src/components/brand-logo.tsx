import Image from 'next/image';

import { cn } from '@/lib/utils';

// The logo has a white background. In light mode it blends into the page
// (multiply), in dark mode it keeps a soft white backing so the dark brown
// strokes stay readable.
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
        'h-12 w-auto mix-blend-multiply dark:rounded-2xl dark:bg-white dark:p-1.5 dark:mix-blend-normal',
        className
      )}
    />
  );
}
