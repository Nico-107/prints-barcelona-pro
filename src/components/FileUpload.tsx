import { useState, useCallback, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Upload, FileBox, X, MessageCircle, Send, CheckCircle, Loader2, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";

const WHATSAPP_URL = "https://wa.me/34672051147";

const FileUpload = () => {
  const { t, language } = useLanguage();
  const [file, setFile] = useState<File | null>(null);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const formStartTimeRef = useRef<number>(Date.now());
  const { toast } = useToast();

  const whatsappMessage = encodeURIComponent(
    language === "en"
      ? "Hello, I would like to request a 3D printing service with Reality 3D BCN."
      : "Hola, me gustaría solicitar un servicio de impresión 3D con Reality 3D BCN."
  );

  useEffect(() => {
    formStartTimeRef.current = Date.now();
  }, [isSubmitted]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      validateAndSetFile(droppedFile);
    }
  }, []);

  const validateAndSetFile = (selectedFile: File) => {
    const validExtensions = ['.stl', '.obj', '.3mf', '.step', '.stp', '.iges', '.igs'];
    const fileExtension = selectedFile.name.toLowerCase().substring(selectedFile.name.lastIndexOf('.'));
    
    if (validExtensions.includes(fileExtension) || selectedFile.name.toLowerCase().includes('.')) {
      setFile(selectedFile);
    } else {
      toast({
        title: language === "en" ? "Invalid format" : "Formato no válido",
        description: language === "en" ? "Please upload a valid 3D file (STL, OBJ, 3MF, STEP)" : "Por favor, sube un archivo 3D válido (STL, OBJ, 3MF, STEP)",
        variant: "destructive",
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      validateAndSetFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file || !email) {
      toast({
        title: t("upload.error.fields"),
        description: t("upload.error.fieldsDesc"),
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const timestamp = Date.now();
      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filePath = `${timestamp}-${sanitizedFileName}`;

      const { error: uploadError } = await supabase.storage
        .from('print-requests')
        .upload(filePath, file);

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw new Error("Error al subir el archivo");
      }

      const { error: functionError } = await supabase.functions.invoke('send-print-request', {
        body: {
          fileName: file.name,
          filePath: filePath,
          userEmail: email,
          message: message || undefined,
          isUrgent: isUrgent,
          website: honeypot,
          formStartTime: formStartTimeRef.current,
        },
      });

      if (functionError) {
        console.error("Function error:", functionError);
        throw new Error("Error al enviar la notificación");
      }

      setIsSubmitted(true);
      toast({
        title: t("upload.success.title"),
        description: t("upload.success.desc"),
      });
    } catch (error: any) {
      console.error("Submit error:", error);
      toast({
        title: t("upload.error.title"),
        description: t("upload.error.desc"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleWhatsApp = () => {
    window.open(`${WHATSAPP_URL}?text=${whatsappMessage}`, "_blank");
  };

  const resetForm = () => {
    setIsSubmitted(false);
    setFile(null);
    setEmail("");
    setMessage("");
    setIsUrgent(false);
    setHoneypot("");
    formStartTimeRef.current = Date.now();
  };

  if (isSubmitted) {
    return (
      <section id="upload" className="py-20 md:py-28 bg-secondary/30">
        <div className="container px-4">
          <div className="max-w-xl mx-auto text-center">
            <div className="w-20 h-20 rounded-full bg-whatsapp/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-whatsapp" />
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-4">
              {language === "en" ? "File received!" : "¡Archivo recibido!"}
            </h2>
            <p className="text-muted-foreground mb-8">
              {language === "en" 
                ? "We have received your request. The Reality 3D BCN team will review the design and contact you soon with the quote."
                : "Hemos recibido tu solicitud. El equipo de Reality 3D BCN revisará el diseño y te contactará pronto con el presupuesto."}
            </p>
            <Button onClick={resetForm} variant="outline">
              {language === "en" ? "Send another file" : "Enviar otro archivo"}
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="upload" className="py-20 md:py-28 bg-secondary/30">
      <div className="container px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t("upload.title")}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-3">
            {language === "en" 
              ? "Upload your 3D file and receive the final price in less than 1 hour"
              : "Sube tu archivo 3D y recibe el precio final en menos de 1 hora"}
          </p>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto">
            {language === "en"
              ? "No automatic prices. We review each project manually."
              : "Sin precios automáticos. Revisamos cada proyecto manualmente."}
          </p>
        </div>

        <div className="max-w-xl mx-auto">
          <form onSubmit={handleSubmit} className="bg-card rounded-2xl p-6 md:p-8 card-shadow border border-border/50">
            {/* Drop zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 mb-6 ${
                isDragging 
                  ? "border-primary bg-primary/5" 
                  : file 
                    ? "border-accent bg-accent/5" 
                    : "border-border hover:border-primary/50"
              }`}
            >
              {file ? (
                <div className="flex items-center justify-center gap-3">
                  <FileBox className="w-8 h-8 text-accent" />
                  <div className="text-left">
                    <p className="font-medium text-foreground">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="ml-2 p-1 rounded-full hover:bg-destructive/10 transition-colors"
                    disabled={isLoading}
                  >
                    <X className="w-5 h-5 text-destructive" />
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="font-medium text-foreground mb-1">
                    {language === "en" ? "Drag your file here" : "Arrastra tu archivo aquí"}
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    {language === "en" ? "or click to select" : "o haz clic para seleccionar"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {language === "en" ? "Formats: STL, OBJ, 3MF, STEP" : "Formatos: STL, OBJ, 3MF, STEP"}
                  </p>
                </>
              )}
              <input
                type="file"
                onChange={handleFileChange}
                accept=".stl,.obj,.3mf,.step,.stp,.iges,.igs"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={isLoading}
              />
            </div>

            {/* Email input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-foreground mb-2">
                {language === "en" ? "Your email *" : "Tu email *"}
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("upload.emailPlaceholder")}
                required
                className="h-12"
                disabled={isLoading}
              />
            </div>

            {/* Message textarea */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-foreground mb-2">
                {language === "en" ? "Message (optional)" : "Mensaje (opcional)"}
              </label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={language === "en" ? "Details about material, color, quantity..." : "Detalles sobre el material, color, cantidad..."}
                rows={3}
                disabled={isLoading}
                maxLength={2000}
              />
            </div>

            {/* Honeypot field */}
            <div className="absolute -left-[9999px] opacity-0 h-0 overflow-hidden" aria-hidden="true">
              <label htmlFor="website">Website</label>
              <input
                type="text"
                id="website"
                name="website"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            {/* Urgent order checkbox */}
            <div className="mb-6 p-4 rounded-xl bg-primary/5 border border-primary/20">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="urgent"
                  checked={isUrgent}
                  onCheckedChange={(checked) => setIsUrgent(checked === true)}
                  disabled={isLoading}
                  className="mt-0.5"
                />
                <div className="flex-1">
                  <label
                    htmlFor="urgent"
                    className="flex items-center gap-2 text-sm font-medium text-foreground cursor-pointer"
                  >
                    <Zap className="w-4 h-4 text-primary" />
                    {language === "en" ? "I need my part urgently (48h)" : "Necesito mi pieza con urgencia (48h)"}
                  </label>
                  <p className="text-xs text-muted-foreground mt-1">
                    {language === "en" 
                      ? "Priority delivery with a small supplement. Same quality guaranteed."
                      : "Entrega prioritaria con un pequeño suplemento. Misma calidad garantizada."}
                  </p>
                </div>
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full mb-2" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t("upload.submitting")}
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  {t("upload.submit")}
                </>
              )}
            </Button>
            
            <p className="text-xs text-center text-muted-foreground mb-4">
              {language === "en" ? "Quick quote, no commitment" : "Presupuesto rápido, sin compromiso"}
            </p>

            {/* WhatsApp alternative */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  {language === "en" ? "Questions or no file?" : "¿Dudas o sin archivo?"}
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full mt-4"
              onClick={handleWhatsApp}
              disabled={isLoading}
            >
              <MessageCircle className="w-4 h-4" />
              {language === "en" ? "Contact us on WhatsApp" : "Consúltanos por WhatsApp"}
            </Button>
            
            <p className="text-xs text-center text-muted-foreground mt-3">
              {language === "en" 
                ? "Not sure if your part is printable? Ask us without commitment"
                : "¿No sabes si tu pieza es imprimible? Pregúntanos sin compromiso"}
            </p>
          </form>
        </div>
      </div>
    </section>
  );
};

export default FileUpload;
