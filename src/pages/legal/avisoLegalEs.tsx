import { LEGAL_IDENTITY } from "@/config/legalIdentity";

/** Aviso legal — binding Spanish version (LSSI art. 10 + consumer law). */
export default function AvisoLegalEsBody() {
  return (
    <>
      <h2>1. Titular del sitio</h2>
      <p>
        El responsable y titular de este sitio web es <strong>{LEGAL_IDENTITY.ownerFullName}</strong>,
        actuando con la denominación comercial <strong>{LEGAL_IDENTITY.tradingName}</strong>.
      </p>
      <ul>
        <li>NIF: {LEGAL_IDENTITY.nif}</li>
        <li>Domicilio: {LEGAL_IDENTITY.address.full}</li>
        <li>Correo electrónico: <a href={`mailto:${LEGAL_IDENTITY.email}`}>{LEGAL_IDENTITY.email}</a></li>
        <li>Actividad: {LEGAL_IDENTITY.activity}</li>
        <li>Alta como autónomo en la Agencia Tributaria desde el 13 de noviembre de 2026.</li>
      </ul>
      <p>
        El titular ejerce su actividad como autónomo (profesional por cuenta propia).
        No es una sociedad mercantil y, por tanto, no está inscrito en el Registro
        Mercantil; está dado de alta en el Censo de Empresarios, Profesionales y
        Retenedores de la Agencia Tributaria y afiliado al RETA (Régimen Especial de
        Trabajadores Autónomos).
      </p>

      <h2>2. Condiciones de uso</h2>
      <p>
        El acceso al sitio es libre y gratuito. El uso del sitio y la contratación
        de los servicios implica aceptar estas condiciones y las{" "}
        <a href="/condiciones-de-venta">Condiciones de venta</a>. Está prohibido el
        uso del sitio con fines fraudulentos, para difundir contenidos ilegales o
        que vulneren derechos de terceros.
      </p>

      <h2>3. Propiedad intelectual</h2>
      <p>
        Los textos, imágenes de maquinaria, fotografías de piezas producidas por el
        titular, logotipos y código del sitio son propiedad de {LEGAL_IDENTITY.tradingName} o
        están licenciados para su uso. Su reproducción, distribución o comunicación
        pública sin autorización no está permitida.
      </p>
      <p>
        Los archivos 3D que el cliente sube al sitio son propiedad del cliente. El
        cliente mantiene todos los derechos sobre su diseño; el titular los emplea
        únicamente para producir el pedido y no los reutiliza, publica ni comparte.
      </p>

      <h2>4. Responsabilidad</h2>
      <p>
        El titular se compromete a prestar el servicio de impresión 3D con la
        diligencia profesional habitual del sector, pero no garantiza que el
        resultado funcione para cualquier uso específico; la selección del material
        y el diseño es responsabilidad del cliente. El titular no responde de los
        daños indirectos, lucro cesante o pérdida de datos derivados del uso del
        sitio o de las piezas impresas.
      </p>

      <h2>5. Enlaces a terceros</h2>
      <p>
        El sitio puede contener enlaces a páginas de terceros (proveedores de
        pago, transporte, reseñas). El titular no se responsabiliza de su
        contenido, políticas o disponibilidad.
      </p>

      <h2>6. Legislación aplicable y jurisdicción</h2>
      <p>
        Este aviso se rige por la legislación española. Las partes se someten a
        los Juzgados y Tribunales de Barcelona, sin perjuicio de los derechos
        irrenunciables que la ley reconozca a los consumidores en su país de
        residencia.
      </p>
    </>
  );
}
