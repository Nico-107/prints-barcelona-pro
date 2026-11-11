import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { capture } from "@/lib/analytics";

interface Props {
  heroCTARef: React.RefObject<HTMLElement | null>;
  onUploadClick: () => void;
}

const MobileStickyBar = ({ heroCTARef, onUploadClick }: Props) => {
  const { t } = useLanguage();
  const [visible, setVisible] = useState(false);
  const [calcInView, setCalcInView] = useState(false);
  const firedRef = useRef(false);

  useEffect(() => {
    const heroEl = heroCTARef.current;
    if (!heroEl) return;

    const heroObs = new IntersectionObserver(
      ([entry]) => {
        setVisible(!entry.isIntersecting);
      },
      { threshold: 0 }
    );
    heroObs.observe(heroEl);
    return () => heroObs.disconnect();
  }, [heroCTARef]);

  useEffect(() => {
    const calcEl = document.getElementById("calculator");
    if (!calcEl) return;

    const calcObs = new IntersectionObserver(
      ([entry]) => setCalcInView(entry.isIntersecting),
      { threshold: 0.3 }
    );
    calcObs.observe(calcEl);
    return () => calcObs.disconnect();
  }, []);

  const show = visible && !calcInView;

  useEffect(() => {
    if (show && !firedRef.current) {
      firedRef.current = true;
      capture("sticky_bar_shown", { page_path: window.location.pathname });
    }
    if (show) {
      document.body.setAttribute("data-sticky-bar", "visible");
    } else {
      document.body.removeAttribute("data-sticky-bar");
    }
    return () => document.body.removeAttribute("data-sticky-bar");
  }, [show]);

  if (!show) return null;

  return (
    <div
      className="xl:hidden fixed bottom-0 left-0 z-[45] flex items-center px-4"
      style={{
        height: "calc(56px + env(safe-area-inset-bottom))",
        paddingBottom: "env(safe-area-inset-bottom)",
        right: "80px",
      }}
    >
      <button
        onClick={() => {
          capture("upload_entry_click", { source: "sticky_bar", page_path: window.location.pathname });
          onUploadClick();
        }}
        className="h-11 w-full rounded-xl bg-[#F5A524] text-[#0F172A] font-semibold text-sm shadow-lg hover:bg-[#F5A524]/90 transition-colors"
        aria-label={t("xp.header.v2")}
      >
        {t("xp.header.v2")}
      </button>
    </div>
  );
};

export default MobileStickyBar;
