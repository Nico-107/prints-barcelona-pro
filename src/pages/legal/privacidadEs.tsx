import { LEGAL_IDENTITY } from "@/config/legalIdentity";

/** Política de privacidad — binding Spanish version (RGPD + LOPDGDD). */
export default function PrivacidadEsBody() {
  return (
    <>
      <h2>1. Responsable del tratamiento</h2>
      <ul>
        <li>Responsable: {LEGAL_IDENTITY.ownerFullName} ({LEGAL_IDENTITY.tradingName})</li>
        <li>NIF: {LEGAL_IDENTITY.nif}</li>
        <li>Dirección: {LEGAL_IDENTITY.address.full}</li>
        <li>Correo: <a href={`mailto:${LEGAL_IDENTITY.email}`}>{LEGAL_IDENTITY.email}</a></li>
      </ul>

      <h2>2. Datos que tratamos</h2>
      <ul>
        <li>Nombre, email, teléfono y dirección de envío que nos facilitas en el formulario de presupuesto o checkout.</li>
        <li>Archivos 3D y fotografías que nos envías para cotizar y producir tu pedido.</li>
        <li>Datos de pedido y de pago (importe, método, referencia de pago). El número de tarjeta se procesa directamente en Stripe; no lo almacenamos.</li>
        <li>Mensajes enviados por los formularios o por WhatsApp.</li>
        <li>Datos de uso anónimos del sitio (páginas vistas, errores) con el fin de mejorar el servicio.</li>
      </ul>

      <h2>3. Finalidades y bases legales</h2>
      <ul>
        <li><strong>Gestionar pedidos y presupuestos</strong> — base: ejecución del contrato (art. 6.1.b RGPD).</li>
        <li><strong>Facturación y obligaciones contables</strong> — base: cumplimiento de obligación legal (art. 6.1.c RGPD); conservación 6 años (art. 30 Código de Comercio).</li>
        <li><strong>Atención al cliente antes y después de la venta</strong> — base: ejecución del contrato o interés legítimo (art. 6.1.f RGPD).</li>
        <li><strong>Analítica web</strong> — base: consentimiento del usuario a través del banner de cookies (art. 6.1.a RGPD).</li>
      </ul>

      <h2>4. Destinatarios</h2>
      <p>Compartimos los datos estrictamente necesarios con los siguientes encargados del tratamiento:</p>
      <ul>
        <li>Stripe Payments Europe Ltd. — procesamiento de pagos con tarjeta, Apple Pay y Google Pay.</li>
        <li>Correos de España, InPost, UPS (a través de Sendcloud o Packlink) — transporte de los pedidos.</li>
        <li>Vercel Inc. — alojamiento del sitio web.</li>
        <li>Supabase Inc. — base de datos y almacenamiento temporal de los archivos 3D.</li>
        <li>PostHog — analítica de uso del sitio (modo cookieless antes del consentimiento; modo completo tras aceptar).</li>
      </ul>

      <h2>5. Transferencias internacionales</h2>
      <p>
        Alguno de los proveedores anteriores (Vercel, Stripe, PostHog) procesa datos
        en infraestructura ubicada fuera del Espacio Económico Europeo. Las
        transferencias se realizan al amparo de las Cláusulas Contractuales Tipo
        de la Comisión Europea.
      </p>

      <h2>6. Plazos de conservación</h2>
      <ul>
        <li>Datos de facturación: 6 años (plazo contable).</li>
        <li>Datos de contacto y presupuesto: hasta 2 años desde el último contacto, salvo obligación legal superior.</li>
        <li>Archivos 3D del cliente: se conservan el tiempo necesario para completar el pedido y atender incidencias posteriores, y se eliminan a petición del cliente.</li>
      </ul>

      <h2>7. Derechos</h2>
      <p>
        Puedes ejercer en cualquier momento los derechos de acceso, rectificación,
        supresión, oposición, limitación del tratamiento y portabilidad escribiendo
        a <a href={`mailto:${LEGAL_IDENTITY.email}`}>{LEGAL_IDENTITY.email}</a>.
        Si consideras que tus datos no han sido tratados correctamente, puedes
        presentar una reclamación ante la Agencia Española de Protección de Datos
        (<a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer">aepd.es</a>).
      </p>

      <h2>8. Archivos 3D</h2>
      <p>
        Los archivos 3D que subes se utilizan exclusivamente para producir tu
        pedido. No se comparten con terceros ajenos a la cadena de producción, no
        se publican, no se reutilizan para otros proyectos y se eliminan a
        petición del cliente.
      </p>
    </>
  );
}
