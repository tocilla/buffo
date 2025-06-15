'use client';

import { useEffect, useState } from 'react';
// Commented out landing page components - keeping for future use
// import { CTASection } from '@/components/home/sections/cta-section';
// // import { FAQSection } from "@/components/sections/faq-section";
// import { FooterSection } from '@/components/home/sections/footer-section';
// import { HeroSection } from '@/components/home/sections/hero-section';
// import { OpenSourceSection } from '@/components/home/sections/open-source-section';
// import { PricingSection } from '@/components/home/sections/pricing-section';
// import { UseCasesSection } from '@/components/home/sections/use-cases-section';
// import { ModalProviders } from '@/providers/modal-providers';

export default function Home() {
  // Landing page is temporarily disabled - redirects handled by middleware
  // This page should not be reached due to middleware redirect
  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Redirecting...</p>
    </div>
  );
}

// Original landing page code - commented out for future use
/*
export default function Home() {
  return (
    <>
      <ModalProviders />
      <main className="flex flex-col items-center justify-center min-h-screen w-full">
        <div className="w-full divide-y divide-border">
          <HeroSection />
          <UseCasesSection />
          <PricingSection />
          <CTASection />
          <FooterSection />
        </div>
      </main>
    </>
  );
}
*/
