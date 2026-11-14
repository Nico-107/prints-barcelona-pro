import { LEGAL_IDENTITY } from "@/config/legalIdentity";

/** Condiciones de venta — binding Spanish version. */
export default function CondicionesEsBody() {
  return (
    <>
      <h2>1. Identificación del vendedor</h2>
      <p>
        {LEGAL_IDENTITY.ownerFullName}, {LEGAL_IDENTITY.tradingName}, NIF {LEGAL_IDENTITY.nif},
        con domicilio en {LEGAL_IDENTITY.address.full} (negocio registrado como
        autónomo en la Agencia Tributaria desde el 13 de noviembre de 2026).
        Contacto: <a href={`mailto:${LEGAL_IDENTITY.email}`}>{LEGAL_IDENTITY.email}</a>.
      </p>

      <h2>2. Precios, IVA y pedido mínimo</h2>
      <ul>
        <li>Todos los precios se muestran en EUR e incluyen el IVA (21%) para los envíos a España.</li>
        <li>Pedido mínimo: 10 € por pedido.</li>
        <li>Envío peninsular: 5,90 € (tarifa plana). Recogida gratuita en {LEGAL_IDENTITY.address.city}, con cita previa.</li>
        <li>Si el precio real que calcula nuestro motor difiere de los importes indicados aquí, prevalece el precio del motor.</li>
      </ul>

      <h2>3. Checkout instantáneo</h2>
      <p>
        El checkout instantáneo (compra directa con tarjeta, Apple Pay o Google
        Pay) está disponible para pedidos hasta 100 €. Los pedidos por encima de
        ese importe requieren un presupuesto confirmado por correo electrónico o
        WhatsApp antes de pagar; el objetivo es revisar el archivo y confirmar el
        plazo exacto.
      </p>

      <h2>4. Métodos de pago</h2>
      <ul>
        <li>Tarjeta de crédito / débito, Apple Pay y Google Pay a través de Stripe.</li>
        <li>Transferencia bancaria y Bizum disponibles para pedidos de empresas y pedidos a medida bajo presupuesto.</li>
      </ul>

      <h2>5. Plazos de producción y envío</h2>
      <ul>
        <li>Producción estándar: 24–48 h laborables desde la confirmación del archivo.</li>
        <li>Envío peninsular: 1–2 días laborables (Correos / InPost / UPS según destino).</li>
        <li>Envío internacional dentro de la Unión Europea: 3–6 días laborables; no se aplican aranceles por tratarse de un envío intracomunitario.</li>
        <li>Para pedidos urgentes (Express / Urgente) contacta antes de pagar para confirmar el plazo real.</li>
      </ul>

      <h2>6. Derecho de desistimiento</h2>
      <p>
        <strong>Pedidos personalizados o fabricados a medida:</strong> quedan
        excluidos del derecho de desistimiento de 14 días previsto en la
        normativa de consumidores, de conformidad con el art. 103.c del Texto
        Refundido de la Ley General para la Defensa de los Consumidores y
        Usuarios. Es el caso de la práctica totalidad de nuestros encargos
        (impresiones a partir del archivo del cliente, modelos a medida,
        prototipos).
      </p>
      <p>
        <strong>Artículos del catálogo estándar</strong> (sin personalización):
        14 días naturales para desistir desde la recepción; los gastos de
        devolución corren a cargo del cliente.
      </p>

      <h2>7. Garantía</h2>
      <p>
        Garantía legal de 3 años para productos defectuosos (art. 120 TRLGDCU).
        Comunica cualquier defecto por email con fotografías; respondemos en
        menos de 1 hora laborable con la solución (reimpresión o reembolso según
        el caso).
      </p>

      <h2>8. Responsabilidad sobre los archivos del cliente</h2>
      <p>
        El cliente es responsable de tener los derechos sobre los archivos y
        diseños que nos envía. No imprimimos piezas que infrinjan derechos de
        propiedad intelectual, que se comercialicen como oficiales sin licencia
        o que la ley prohíba (armas, utensilios ilegales, etc.).
      </p>

      <h2>9. Reclamaciones</h2>
      <p>
        Puedes presentar reclamaciones escribiendo a{" "}
        <a href={`mailto:${LEGAL_IDENTITY.email}`}>{LEGAL_IDENTITY.email}</a>.
        Disponemos de hojas oficiales de reclamación a disposición del
        consumidor; las enviamos a solicitud.
      </p>

      <h2>10. Facturación</h2>
      <p>
        Para empresas y autónomos emitimos factura con IVA desglosado. Indícanos
        la razón social y el NIF/CIF al pagar o en el email de confirmación.
      </p>

      <h2>11. Ley aplicable y jurisdicción</h2>
      <p>
        Estas condiciones se rigen por la legislación española. Las personas
        consumidoras conservan las protecciones imperativas de su país de
        residencia. En caso de controversia, las partes se someten a los
        Juzgados y Tribunales de {LEGAL_IDENTITY.address.city}.
      </p>
    </>
  );
}
