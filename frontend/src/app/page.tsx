import { 
  HeroSection,
  FeaturesSection,
  PricingSection,
  TestimonialsSection,
  FAQSection,
  FinalCTASection 
} from '@/components/landing';
import { StructuredData } from '@/components/seo/structured-data';

export default function LandingPage() {
  return (
    <>
      <StructuredData />
      <main>
        <HeroSection />
        <FeaturesSection />
        <TestimonialsSection />
        <PricingSection />
        <FAQSection />
        <FinalCTASection />
      </main>
    </>
  );
}