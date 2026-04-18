import Header from "@/components/Header";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import WhatCanWePrint from "@/components/WhatCanWePrint";
import Materials from "@/components/Materials";
import FileUpload from "@/components/FileUpload";
import WhyChooseUs from "@/components/WhyChooseUs";
import ExpressPrinting from "@/components/ExpressPrinting";
import Reviews from "@/components/Reviews";
import Projects from "@/components/Projects";
import PricingInfo from "@/components/PricingInfo";
import ServiceInfo from "@/components/ServiceInfo";
import FAQ from "@/components/FAQ";
import CallToAction from "@/components/CallToAction";
import LocationMap from "@/components/LocationMap";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <Hero />
        <HowItWorks />
        <WhatCanWePrint />
        <Materials />
        <Projects />
        <FileUpload />
        <PricingInfo />
        <WhyChooseUs />
        <ExpressPrinting />
        <Reviews />
        <ServiceInfo />
        <FAQ />
        <CallToAction />
        <LocationMap />
      </main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
};

export default Index;
