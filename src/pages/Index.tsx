import Header from "@/components/Header";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import WhatCanWePrint from "@/components/WhatCanWePrint";
import Materials from "@/components/Materials";
import Reviews from "@/components/Reviews";
import ExpressPrinting from "@/components/ExpressPrinting";
import WhyChooseUs from "@/components/WhyChooseUs";
import FileUpload from "@/components/FileUpload";
import ServiceInfo from "@/components/ServiceInfo";
import FAQ from "@/components/FAQ";
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
        <WhyChooseUs />
        <ExpressPrinting />
        <Reviews />
        <FileUpload />
        <ServiceInfo />
        <FAQ />
      </main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
};

export default Index;
