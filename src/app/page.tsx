import { ModeToggle } from '@/components/toggle-mode';

export default function Page() {
  return (
    <main>
      <section className="flex min-h-screen items-center justify-center">
        <h1 className="text-7xl font-bold">Rulos y Rizos</h1>
        <ModeToggle />
      </section>
    </main>
  );
}
