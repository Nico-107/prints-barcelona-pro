import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Upload, FileBox, X, MessageCircle, Send, CheckCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const WHATSAPP_URL = "https://wa.me/34672051147";
const WHATSAPP_MESSAGE = encodeURIComponent("Hi, I'd like to request a 3D printing service and send a file.");

const FileUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

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
        title: "Formato no válido",
        description: "Por favor, sube un archivo 3D válido (STL, OBJ, 3MF, STEP)",
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
        title: "Campos requeridos",
        description: "Por favor, sube un archivo y añade tu email",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Generate unique file path
      const timestamp = Date.now();
      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filePath = `${timestamp}-${sanitizedFileName}`;

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('print-requests')
        .upload(filePath, file);

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw new Error("Error al subir el archivo");
      }

      // Call edge function to send email
      const { error: functionError } = await supabase.functions.invoke('send-print-request', {
        body: {
          fileName: file.name,
          filePath: filePath,
          userEmail: email,
          message: message || undefined,
        },
      });

      if (functionError) {
        console.error("Function error:", functionError);
        throw new Error("Error al enviar la notificación");
      }

      setIsSubmitted(true);
      toast({
        title: "¡Solicitud enviada!",
        description: "Te contactaremos pronto con el presupuesto",
      });
    } catch (error: any) {
      console.error("Submit error:", error);
      toast({
        title: "Error al enviar",
        description: error.message || "Hubo un problema al procesar tu solicitud. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleWhatsApp = () => {
    window.open(`${WHATSAPP_URL}?text=${WHATSAPP_MESSAGE}`, "_blank");
  };

  const resetForm = () => {
    setIsSubmitted(false);
    setFile(null);
    setEmail("");
    setMessage("");
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
              ¡Archivo recibido!
            </h2>
            <p className="text-muted-foreground mb-8">
              Hemos recibido tu solicitud. Revisaremos el diseño y te contactaremos pronto con el presupuesto.
            </p>
            <Button onClick={resetForm} variant="outline">
              Enviar otro archivo
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
            Sube tu archivo 3D
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Envíanos tu diseño y te contactaremos con el presupuesto
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
                    Arrastra tu archivo aquí
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    o haz clic para seleccionar
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Formatos: STL, OBJ, 3MF, STEP
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
                Tu email *
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                className="h-12"
                disabled={isLoading}
              />
            </div>

            {/* Message textarea */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-foreground mb-2">
                Mensaje (opcional)
              </label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Detalles sobre el material, color, cantidad..."
                rows={3}
                disabled={isLoading}
              />
            </div>

            <Button type="submit" size="lg" className="w-full mb-4" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Enviar solicitud
                </>
              )}
            </Button>

            {/* WhatsApp alternative */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  ¿No tienes archivo?
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
              Escríbenos por WhatsApp
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default FileUpload;
