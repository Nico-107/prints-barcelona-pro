import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";

export default function Unsubscribe() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const [status, setStatus] = useState<"pending" | "done" | "error">("pending");

  useEffect(() => {
    if (!token) { setStatus("error"); return; }
    (supabase as any)
      .from("saved_quotes")
      .update({ unsubscribed: true })
      .eq("token", token)
      .then(({ error }: { error: any }) => {
        setStatus(error ? "error" : "done");
      });
  }, [token]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container px-4 py-16 max-w-lg text-center">
        {status === "pending" && <p className="text-muted-foreground">Procesando…</p>}
        {status === "done" && (
          <>
            <h1 className="text-2xl font-semibold mb-3">Listo</h1>
            <p className="text-muted-foreground">Ya no recibirás recordatorios para este presupuesto.</p>
          </>
        )}
        {status === "error" && (
          <>
            <h1 className="text-2xl font-semibold mb-3">Enlace no válido</h1>
            <p className="text-muted-foreground">El enlace ha caducado o ya fue utilizado.</p>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
