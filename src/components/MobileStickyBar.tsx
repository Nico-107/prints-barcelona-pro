import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { capture } from "@/lib/analytics";

interface Props {
  heroCTARef?: React.RefObject<HTMLElement | null>;
  onUploadClick: () => void;
}

const MobileStickyBar = ({ onUploadClick }: Props) => {
  const { t } = useLanguage();
  const [visible, setVisible] = useState(false);
  const [calcInView, setCalcInView] = useState(false);
  const firedRef = useRef(false);

  // Show only after the hero primary button (data-hero-cta) is fully above the viewport.
  // Using querySelector so we don't need a forwarded ref from the parent.
  useEffect(() => {
    const findAndObserve = () => {
      // querySelectorAll + visible check: when V2 is active, V1's button is
      // display:none so offsetParent===null — skip it to avoid observing a
      // hidden element (which is never intersecting, so bar shows immediately).
      const btn = Array.from(document.querySelectorAll<HTMLElement>("[data-hero-cta]"))
        .find(el => el.offsetParent !== null);
      if (!btn) return null;
      const obs = new IntersectionObserver(
        ([entry]) => setVisible(!entry.isIntersecting),
        { threshold: 0 }
      );
      obs.observe(btn);
      return obs;
    };

    // The button may not be rendered until after hydration; try after a tick.
    let obs = findAndObserve();
    if (!obs) {
      const t = setTimeout(() => { obs = findAndObserve(); }, 200);
      return () => { clearTimeout(t); obs?.disconnect(); };
    }
    return () => obs?.disconnect();
  }, []);

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
        onClick={onUploadClick}
        className="h-11 w-full rounded-xl bg-[#F5A524] text-[#0F172A] font-semibold text-sm shadow-lg hover:bg-[#F5A524]/90 transition-colors"
        aria-label={t("xp.header.v2")}
      >
        {t("xp.header.v2")}
      </button>
    </div>
  );
};

export default MobileStickyBar;
