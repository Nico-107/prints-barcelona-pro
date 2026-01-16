import Header from "@/components/Header";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import Gallery from "@/components/Gallery";
import Reviews from "@/components/Reviews";
import ExpressPrinting from "@/components/ExpressPrinting";
import WhyChooseUs from "@/components/WhyChooseUs";
import FileUpload from "@/components/FileUpload";
import ServiceInfo from "@/components/ServiceInfo";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <Hero />
        <HowItWorks />
        <Gallery />
        <WhyChooseUs />
        <ExpressPrinting />
        <Reviews />
        <FileUpload />
        <ServiceInfo />
      </main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
};

export default Index;
