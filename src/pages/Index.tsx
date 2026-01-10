import Header from "@/components/Header";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
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
        <FileUpload />
        <ServiceInfo />
      </main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
};

export default Index;
