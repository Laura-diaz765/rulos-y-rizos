import { CancellationNotice } from '@/components/landing/cancellation-notice';
import { CtaSection } from '@/components/landing/cta-section';
import { HeroSection } from '@/components/landing/hero-section';
import { MobileBookingBar } from '@/components/landing/mobile-booking-bar';
import { ServicesSection } from '@/components/landing/services-section';
import { SiteFooter } from '@/components/landing/site-footer';
import { SiteHeader } from '@/components/landing/site-header';
import { StepsSection } from '@/components/landing/steps-section';
import { ZonesSection } from '@/components/landing/zones-section';
import {
  BOOKING_HREF,
  CANCELLATION_HOURS,
  PRIVACY_HREF,
  PROVIDER_LOGIN_HREF,
  WHATSAPP_URL,
  brand,
  heroBenefits,
  navLinks,
  resumenEjemplo,
  services,
  steps,
  tips,
  zones,
} from '@/lib/landing-data';

export default function Page() {
  return (
    // Bottom padding keeps the fixed mobile booking bar from covering the footer.
    <div className="pb-32 md:pb-0">
      <SiteHeader
        brand={brand}
        navLinks={navLinks}
        whatsappUrl={WHATSAPP_URL}
        bookingHref={BOOKING_HREF}
      />
      <main id="inicio">
        <HeroSection
          benefits={heroBenefits}
          resumen={resumenEjemplo}
          bookingHref={BOOKING_HREF}
        />
        <ServicesSection services={services} bookingHref={BOOKING_HREF} />
        <StepsSection steps={steps} />
        <ZonesSection zones={zones} tips={tips} whatsappUrl={WHATSAPP_URL} />
        <CancellationNotice hours={CANCELLATION_HOURS} />
        <CtaSection bookingHref={BOOKING_HREF} whatsappUrl={WHATSAPP_URL} />
      </main>
      <SiteFooter
        brandName={brand.nombre}
        privacyHref={PRIVACY_HREF}
        loginHref={PROVIDER_LOGIN_HREF}
      />
      <MobileBookingBar bookingHref={BOOKING_HREF} />
    </div>
  );
}
