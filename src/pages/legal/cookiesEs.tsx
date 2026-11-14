import { LEGAL_IDENTITY } from "@/config/legalIdentity";

/** Política de cookies — binding Spanish version. */
export default function CookiesEsBody() {
  return (
    <>
      <h2>1. ¿Qué es una cookie?</h2>
      <p>
        Una cookie es un pequeño fichero que un sitio web puede guardar en tu
        dispositivo para recordar preferencias (idioma, carrito) o medir cómo se
        usa el sitio. También usamos técnicas equivalentes (localStorage) para
        esas mismas funciones; a efectos de esta política las llamamos todas
        "almacenamiento".
      </p>

      <h2>2. Nuestro enfoque</h2>
      <p>
        Queremos que todas las visitas se cuenten, incluso cuando rechazas las
        cookies. Por eso usamos el <strong>modo sin cookies</strong> ("cookieless")
        de PostHog antes de que respondas al banner y después de que lo rechaces:
        PostHog funciona en memoria, sin identificador persistente, y sigue
        enviando eventos de página y de interacción sin escribir nada en tu
        dispositivo. El modo normal (con identificador persistente y grabación de
        sesión) solo se activa si aceptas.
      </p>

      <h2>3. Qué almacena este sitio</h2>
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Finalidad</th>
            <th>Duración</th>
            <th>Cuándo se activa</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>cookie-consent</code></td>
            <td>Guarda tu respuesta al banner (aceptar / rechazar).</td>
            <td>12 meses</td>
            <td>Al pulsar "Aceptar" o "Rechazar".</td>
          </tr>
          <tr>
            <td><code>preferred-language</code></td>
            <td>Idioma seleccionado en el selector.</td>
            <td>Permanente hasta que lo borres</td>
            <td>Al cambiar de idioma.</td>
          </tr>
          <tr>
            <td><code>dim3d-vid</code></td>
            <td>Identificador anónimo para repartir las variantes A/B del sitio de forma estable.</td>
            <td>Permanente hasta que lo borres</td>
            <td>En la primera visita.</td>
          </tr>
          <tr>
            <td><code>dim3d-first-touch</code></td>
            <td>Guarda la primera referencia de llegada para medir de qué fuente vienen los pedidos.</td>
            <td>Permanente hasta que lo borres</td>
            <td>En la primera visita.</td>
          </tr>
          <tr>
            <td><code>posthog-*</code></td>
            <td>Analítica de uso (solo tras aceptar).</td>
            <td>12 meses</td>
            <td>Solo tras aceptar en el banner.</td>
          </tr>
          <tr>
            <td><code>_ga*</code> (Google Analytics)</td>
            <td>Métricas de tráfico agregadas (solo tras aceptar).</td>
            <td>Hasta 24 meses</td>
            <td>Solo tras aceptar en el banner.</td>
          </tr>
          <tr>
            <td>Stripe (<code>__stripe_*</code>)</td>
            <td>Prevención de fraude cuando pagas.</td>
            <td>12 meses</td>
            <td>Solo al abrir el checkout de Stripe.</td>
          </tr>
        </tbody>
      </table>

      <h2>4. Estadísticas anónimas en modo sin cookies</h2>
      <p>
        Para que las decisiones del negocio reflejen a todos los visitantes,
        enviamos eventos anónimos de página vista y de interacción (subidas de
        archivo, clics de compra, clics de WhatsApp) sin identificador
        persistente. Estos eventos no permiten identificarte, no se vinculan entre
        visitas y no escriben nada en tu dispositivo. Esta base jurídica es el
        interés legítimo del responsable en medir el rendimiento del servicio.
      </p>

      <h2>5. Cambiar de opinión</h2>
      <p>
        Puedes cambiar tu respuesta en cualquier momento desde el enlace
        "Preferencias de cookies" del pie de página o desde la{" "}
        <a href="/politica-de-privacidad">Política de privacidad</a>.
      </p>

      <h2>6. Contacto</h2>
      <p>
        Dudas sobre cookies: <a href={`mailto:${LEGAL_IDENTITY.email}`}>{LEGAL_IDENTITY.email}</a>.
      </p>
    </>
  );
}
