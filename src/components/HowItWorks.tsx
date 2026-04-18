import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, MessageSquare, Printer, Package } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const HowItWorks = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [clicks, setClicks] = useState(0);

  const steps = [
    { icon: Upload, titleKey: "how.step1.title", descKey: "how.step1.desc" },
    { icon: MessageSquare, titleKey: "how.step2.title", descKey: "how.step2.desc" },
    { icon: Printer, titleKey: "how.step3.title", descKey: "how.step3.desc" },
    { icon: Package, titleKey: "how.step4.title", descKey: "how.step4.desc" },
  ];

  const handleStep4Click = () => {
    const next = clicks + 1;
    setClicks(next);
    if (next >= 10) {
      setClicks(0);
      navigate("/admin-orders");
    }
  };

  return (
    <section id="como-funciona" className="py-20 md:py-28 bg-background">
      <div className="container px-4">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t("how.title")}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("how.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {steps.map((step, index) => {
            const isLast = index === steps.length - 1;
            const Wrapper: any = isLast ? "button" : "div";
            const wrapperProps = isLast
              ? { onClick: handleStep4Click, type: "button", className: "relative group text-left w-full" }
              : { className: "relative group" };
            return (
              <Wrapper key={index} {...wrapperProps}>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-1/2 w-full h-px bg-border" />
                )}
                <div className="relative bg-card rounded-xl p-6 card-shadow hover:card-shadow-hover transition-all duration-300 border border-border/50">
                  <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-accent text-accent-foreground text-sm font-bold flex items-center justify-center shadow-md">
                    {index + 1}
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/15 transition-colors duration-300">
                      <step.icon className="w-7 h-7 text-accent" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">{t(step.titleKey)}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{t(step.descKey)}</p>
                  </div>
                </div>
              </Wrapper>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
