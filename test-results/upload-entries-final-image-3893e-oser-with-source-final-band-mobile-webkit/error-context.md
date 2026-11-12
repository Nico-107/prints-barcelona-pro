# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: upload-entries.spec.ts >> final image band CTA opens file chooser with source=final_band
- Location: e2e/upload-entries.spec.ts:143:1

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 1
Received: 0
```

# Page snapshot

```yaml
- generic [ref=e2]:
  - region "Notifications (F8)":
    - list
  - region "Notifications alt+T"
  - generic [ref=e3]:
    - link "Skip to content" [ref=e4]:
      - /url: "#main-content"
    - banner [ref=e5]:
      - generic [ref=e7]:
        - link "Dimension3D" [ref=e8]:
          - /url: /
        - generic [ref=e31]:
          - button "es – Español" [ref=e33] [cursor=pointer]:
            - generic [ref=e37]: es
          - button "Abrir menú" [ref=e38] [cursor=pointer]
    - main [ref=e40]:
      - generic [ref=e42]:
        - generic [ref=e44]:
          - generic [ref=e45]:
            - generic [ref=e46]: ★★★★★ 4,8
            - generic [ref=e47]: ·
            - generic [ref=e48]: 250+ PEDIDOS ENTREGADOS
            - generic [ref=e49]: ·
            - generic [ref=e50]: BARCELONA
          - heading "Impresión 3D de calidad en Barcelona." [level=1] [ref=e51]
          - paragraph [ref=e52]: Sube un archivo o una foto y ve tu precio al instante. Tu pieza lista en 24–48 h, para recoger en Les Corts o con envío a toda España.
          - button "Ver mi precio — desde 10 €" [ref=e53] [cursor=pointer]
          - link "Escribirnos por WhatsApp" [ref=e57]:
            - /url: https://wa.me/34672051147
          - button "¿El archivo está en tu ordenador? Te enviamos el enlace →" [ref=e58] [cursor=pointer]
          - generic [ref=e59]:
            - generic [ref=e60]: Sin registro
            - generic [aria-hidden] [ref=e61]: ·
            - generic [ref=e62]: STL, OBJ, 3MF o una foto
            - generic [aria-hidden] [ref=e63]: ·
            - generic [ref=e64]: Archivos confidenciales
          - button "¿No tienes archivo? Lo diseñamos desde una foto →" [ref=e65] [cursor=pointer]
        - generic [ref=e67]:
          - generic [ref=e68]:
            - generic [ref=e69]: Desde 10 €
            - text: PEDIDO MÍNIMO, SIN TARIFAS
          - generic [ref=e70]:
            - generic [ref=e71]: 24–48 h
            - text: ENTREGA HABITUAL
          - generic [ref=e72]:
            - generic [ref=e73]: ±0,2 mm
            - text: TOLERANCIA DE IMPRESIÓN
          - generic [ref=e74]:
            - generic [ref=e75]: "\"Calidad impecable y atención personalizada.\""
            - text: ALEX A. · CLIENTE
      - generic [ref=e78]:
        - heading "Cómo funciona" [level=2] [ref=e79]
        - paragraph [ref=e80]: "Cuatro pasos. El primero te lleva 10 segundos: haz clic y elige tu archivo."
        - generic [ref=e81]:
          - button "Sube tu archivo o foto STL, OBJ, 3MF… o una foto de lo que necesitas. Elegir archivo ahora →" [ref=e82] [cursor=pointer]:
            - generic [aria-hidden] [ref=e84]: "1"
            - heading "Sube tu archivo o foto" [level=3] [ref=e89]
            - paragraph [ref=e90]: STL, OBJ, 3MF… o una foto de lo que necesitas.
            - generic [ref=e91]: Elegir archivo ahora →
          - generic [ref=e92]:
            - generic [aria-hidden] [ref=e94]: "2"
            - heading "Ve el precio al instante" [level=3] [ref=e99]
            - paragraph [ref=e100]: Elige material y color. Sin sorpresas al pagar.
          - generic [ref=e101]:
            - generic [aria-hidden] [ref=e103]: "3"
            - heading "La imprimimos" [level=3] [ref=e106]
            - paragraph [ref=e107]: Una persona revisa tu pieza antes. Producción en Barcelona.
          - generic [ref=e108]:
            - generic [aria-hidden] [ref=e110]: "4"
            - heading "Recoge o recibe" [level=3] [ref=e116]
            - paragraph [ref=e117]: Recogida con cita en Les Corts o envío por 5,90 €.
      - generic [ref=e120]:
        - generic [ref=e121]:
          - generic [ref=e122]: PRECIO AL INSTANTE — DESDE 10 €
          - heading "Sube tus archivos y ve el precio ahora." [level=2] [ref=e123]
          - paragraph [ref=e124]: Sin cuenta y sin compromiso. Pedido mínimo 10 € por pedido, sin tarifa de preparación.
          - generic [ref=e125]: "Ejemplo real: adaptador VESA, PLA, 40 g → 12,10 €"
          - generic [ref=e126]: "Ejemplo real: prototipo, PETG, 150 g → 42,35 €"
        - generic [ref=e131]:
          - generic [ref=e133]:
            - generic [ref=e134] [cursor=pointer]:
              - paragraph [ref=e137]: Suelta tus archivos aquí
              - paragraph [ref=e138]: STL, OBJ, 3MF, GLB — o una foto de lo que necesitas
              - generic [ref=e139]:
                - generic [ref=e140]: 1 Sube
                - generic [ref=e141]: ·
                - generic [ref=e142]: 2 Precio al instante
                - generic [ref=e143]: ·
                - generic [ref=e144]: 3 Te lo enviamos
            - paragraph [ref=e145]:
              - text: ¿Sin archivo 3D?
              - link "Lo diseñamos desde una foto o tu idea" [ref=e146]:
                - /url: /disena-tu-pieza-3d
          - generic [ref=e148]:
            - generic [ref=e149]:
              - paragraph [ref=e150]: Ajustes por defecto para todas las piezas
              - generic [ref=e151]:
                - button "Simple" [ref=e152] [cursor=pointer]
                - button "Avanzado" [ref=e153] [cursor=pointer]
            - generic [ref=e155]:
              - generic [ref=e156]: Material
              - combobox "Material" [ref=e157]:
                - option "PLA — calidad, acabado limpio" [selected]
                - option "PETG — resistente, uso general"
                - option "HIPS — ligero, soportes"
                - option "ABS — duro, mecanizable"
                - option "ASA — exterior, resistente UV"
                - option "TPU — flexible, piezas de goma"
                - option "Nylon — mecánico, alta resistencia"
                - option "PC — impactos, alta temperatura"
                - option "PVA — soportes solubles en agua"
                - option "PLA-CF — fibra de carbono, rígido"
                - option "PETG-CF — fibra de carbono, ligero"
                - option "Nylon-CF — técnico, ultra-resistente"
            - generic [ref=e158]:
              - generic [ref=e159]: Preferencia de color
              - textbox "ej. negro, blanco, rojo, cualquiera" [ref=e160]
      - generic [ref=e162]:
        - heading "Qué imprimimos" [level=2] [ref=e163]
        - paragraph [ref=e164]: Desde prototipos funcionales hasta piezas finales de uso diario.
        - generic [ref=e165]:
          - link "Prototipos funcionales Valida tu diseño antes de producir →" [ref=e166]:
            - /url: /prototipos-3d-barcelona
            - generic [ref=e167]:
              - strong [ref=e168]: Prototipos funcionales
              - text: Valida tu diseño antes de producir
            - generic [ref=e169]: →
          - link "Piezas de repuesto Electrodomésticos, máquinas, vehículos →" [ref=e170]:
            - /url: /recambios-impresion-3d-barcelona
            - generic [ref=e171]:
              - strong [ref=e172]: Piezas de repuesto
              - text: Electrodomésticos, máquinas, vehículos
            - generic [ref=e173]: →
          - link "Soportes y adaptadores Montajes y soluciones a medida →" [ref=e174]:
            - /url: /piezas-personalizadas-3d-barcelona
            - generic [ref=e175]:
              - strong [ref=e176]: Soportes y adaptadores
              - text: Montajes y soluciones a medida
            - generic [ref=e177]: →
          - link "Piezas técnicas RC, drones, automoción y mecánica →" [ref=e178]:
            - /url: /piezas-funcionales-barcelona
            - generic [ref=e179]:
              - strong [ref=e180]: Piezas técnicas
              - text: RC, drones, automoción y mecánica
            - generic [ref=e181]: →
          - link "Proyectos personalizados Hobby, decoración o uso personal →" [ref=e182]:
            - /url: /piezas-personalizadas-3d-barcelona
            - generic [ref=e183]:
              - strong [ref=e184]: Proyectos personalizados
              - text: Hobby, decoración o uso personal
            - generic [ref=e185]: →
          - link "Diseños originales Si lo puedes imaginar, lo podemos imprimir →" [ref=e186]:
            - /url: /disena-tu-pieza-3d
            - generic [ref=e187]:
              - strong [ref=e188]: Diseños originales
              - text: Si lo puedes imaginar, lo podemos imprimir
            - generic [ref=e189]: →
      - generic [ref=e192]:
        - generic [ref=e193]:
          - heading "Materiales y precios" [level=2] [ref=e194]
          - generic [ref=e195]:
            - table [ref=e197]:
              - rowgroup [ref=e198]:
                - row [ref=e199]:
                  - columnheader "MATERIAL" [ref=e200]
                  - columnheader "PARA QUÉ" [ref=e201]
                  - columnheader "MATERIAL + MÁQUINA" [ref=e202]
              - rowgroup [ref=e203]:
                - row [ref=e204]:
                  - cell "PLA" [ref=e205]
                  - cell "Prototipos, decoración, figuras" [ref=e206]
                  - cell "0,017 €/g" [ref=e207]
                - row [ref=e208]:
                  - cell "PETG" [ref=e209]
                  - cell "Piezas funcionales, exterior" [ref=e210]
                  - cell "0,019 €/g" [ref=e211]
                - row [ref=e212]:
                  - cell "ABS / ASA" [ref=e213]
                  - cell "Calor, sol, automoción" [ref=e214]
                  - cell "0,021 €/g" [ref=e215]
                - row [ref=e216]:
                  - cell "TPU" [ref=e217]
                  - 'cell "Flexible: juntas, fundas" [ref=e218]'
                  - cell "0,025 €/g" [ref=e219]
                - row [ref=e220]:
                  - cell "Nylon CF" [ref=e221]
                  - cell "Alta resistencia mecánica" [ref=e222]
                  - cell "0,038 €/g" [ref=e223]
            - button "Calcular el precio de mi pieza" [ref=e224] [cursor=pointer]
          - paragraph [ref=e225]:
            - text: ¿No sabes qué material elegir?
            - link "WhatsApp" [ref=e226]:
              - /url: https://wa.me/34672051147
          - generic [ref=e227]: BAMBU LAB X2D · ±0,2 MM · HASTA 5 COLORES · 256 MM
        - img "Impresora Bambu Lab X2D sobre escritorio con una pieza recién impresa" [ref=e228]
      - generic [ref=e230]:
        - heading "¿Por qué Dimension3D?" [level=2] [ref=e231]
        - generic [ref=e232]:
          - generic [ref=e233]:
            - paragraph [ref=e234]: Local en Barcelona
            - paragraph [ref=e235]: Fabricamos en Les Corts. Recogida con cita o envío a toda España.
          - generic [ref=e236]:
            - paragraph [ref=e237]: 24–48 h
            - paragraph [ref=e238]: Entrega habitual. Servicio express disponible sin coste adicional.
          - generic [ref=e239]:
            - paragraph [ref=e240]: Una persona real
            - paragraph [ref=e241]: Nico revisa cada archivo antes de imprimir y te escribe por WhatsApp.
          - generic [ref=e242]:
            - paragraph [ref=e243]: Alta calidad
            - paragraph [ref=e244]: Bambu Lab X2D. ±0,2 mm. Hasta 5 colores en la misma pieza.
      - generic [ref=e246]:
        - heading "Proyectos de clientes" [level=2] [ref=e247]
        - link "Ver más proyectos" [ref=e253]:
          - /url: https://wa.me/34672051147
      - generic [ref=e256]:
        - generic [ref=e257]: ★★★★★ 4,8 · 17 RESEÑAS GOOGLE
        - blockquote [ref=e258]:
          - text: "\"What an amazing place! Mikolaj helped me with an urgent order on a Friday afternoon, and it was ready the very next morning. He not only delivered my pieces with a professional finish, but he even came over to where I was to hand them to me. Absolutely fantastic.\""
          - generic [ref=e259]: — Sara Dospassos
        - generic [ref=e260]:
          - blockquote [ref=e261]:
            - text: "\"I'm working for a construction company. We needed a special round shadow gap profile for a wall, but there was no way to buy one because nobody sells it. So we decided to make it with the help of 3D printing. It was fast, affordable, and worked perfectly.\""
            - generic [ref=e262]: — Kirill Gromskiy
          - blockquote [ref=e263]:
            - text: "\"I had some parts printed for a project, and in addition to the excellent service and constant support, they helped me by doing resized tests so the printed nut would fit perfectly. The price was great, and it really saved me from a tight spot.\""
            - generic [ref=e264]: — Yasser Chyoukha
          - blockquote [ref=e265]:
            - text: "\"Amazing! They were able to accurately 3D print this car part in TPU, a flexible material. Great quality and service.\""
            - generic [ref=e266]: — Filip Copaescu
      - generic [ref=e270]:
        - heading "Para empresas" [level=2] [ref=e271]
        - generic [ref=e272]:
          - link "DISEÑO + PROTOTIPO De idea a prototipo en menos de 48 h Diseñamos desde una foto o un briefing. Archivos editables que son tuyos. Enviar mi proyecto →" [ref=e273]:
            - /url: /disena-tu-pieza-3d
            - generic [ref=e274]: DISEÑO + PROTOTIPO
            - generic [ref=e275]: De idea a prototipo en menos de 48 h
            - paragraph [ref=e276]: Diseñamos desde una foto o un briefing. Archivos editables que son tuyos.
            - generic [ref=e277]: Enviar mi proyecto →
          - link "PRODUCCIÓN EN SERIE 10, 100 o 1.000 piezas, sin moldes Calidad constante entre lotes y precio por volumen. Pedir precio por volumen →" [ref=e278]:
            - /url: /impresion-3d-empresas-barcelona
            - generic [ref=e279]: PRODUCCIÓN EN SERIE
            - generic [ref=e280]: 10, 100 o 1.000 piezas, sin moldes
            - paragraph [ref=e281]: Calidad constante entre lotes y precio por volumen.
            - generic [ref=e282]: Pedir precio por volumen →
      - generic [ref=e284]:
        - img "Impresora Bambu Lab X2D imprimiendo una pieza" [ref=e285]
        - generic [ref=e286]:
          - generic [ref=e287]: QUIÉN IMPRIME TU PIEZA
          - heading "Hola, soy Nico. No somos una plataforma." [level=2] [ref=e288]
          - paragraph [ref=e289]: Llevo 4 años imprimiendo en 3D y desde 2024 lo hago para clientes en Barcelona. Reviso cada archivo antes de imprimir, te aviso si algo no va a salir bien y te escribo yo por WhatsApp.
          - generic [ref=e290]:
            - generic [ref=e291]: LES CORTS, BARCELONA
            - generic [ref=e292]: RECOGIDA CON CITA
            - generic [ref=e293]: RESPUESTA EN <1 H
          - link "Escribirme por WhatsApp →" [ref=e294]:
            - /url: https://wa.me/34672051147
      - generic [ref=e296]:
        - generic [ref=e297]:
          - heading "Servicio de impresión 3D en Barcelona" [level=2] [ref=e298]
          - paragraph [ref=e299]: Dimension3D es un servicio profesional de impresión 3D bajo pedido. Producción local en Barcelona con envíos a toda España.
        - generic [ref=e300]:
          - generic [ref=e301]:
            - paragraph [ref=e302]: Pedidos 100% online
            - paragraph [ref=e303]: Gestión digital completa. Sube tu archivo y recibe presupuesto.
          - generic [ref=e304]:
            - paragraph [ref=e305]: Producción en Barcelona
            - paragraph [ref=e306]: Fabricación local con tiempos de entrega reducidos.
          - generic [ref=e307]:
            - paragraph [ref=e308]: Recogida con cita previa
            - paragraph [ref=e309]: Coordina día y hora para recoger tu pedido en Barcelona.
          - generic [ref=e310]:
            - paragraph [ref=e311]: Envíos a toda España
            - paragraph [ref=e312]: Entrega a domicilio en cualquier punto de la península.
      - generic [ref=e314]:
        - generic [ref=e315]:
          - generic [ref=e316]: IMPRESIÓN EXPRESS
          - heading "Tu pieza lista en 24–48 h." [level=2] [ref=e317]
          - paragraph [ref=e318]: 24–48 h · Sin coste adicional · Mismo acabado
        - link "Cómo funciona el servicio express →" [ref=e319]:
          - /url: /blog/impresion-3d-urgente-barcelona
      - generic [ref=e323]:
        - heading "Preguntas frecuentes" [level=2] [ref=e324]
        - generic [ref=e325]:
          - button "¿Cuánto tarda un pedido?" [ref=e327] [cursor=pointer]:
            - text: ¿Cuánto tarda un pedido?
            - generic [aria-hidden] [ref=e328]: +
          - button "¿Qué materiales usáis?" [ref=e330] [cursor=pointer]:
            - text: ¿Qué materiales usáis?
            - generic [aria-hidden] [ref=e331]: +
          - button "¿Cómo envío mi archivo?" [ref=e333] [cursor=pointer]:
            - text: ¿Cómo envío mi archivo?
            - generic [aria-hidden] [ref=e334]: +
          - button "¿Hacéis pedidos urgentes?" [ref=e336] [cursor=pointer]:
            - text: ¿Hacéis pedidos urgentes?
            - generic [aria-hidden] [ref=e337]: +
          - button "¿Dónde estáis?" [ref=e339] [cursor=pointer]:
            - text: ¿Dónde estáis?
            - generic [aria-hidden] [ref=e340]: +
      - generic [ref=e342]:
        - img "Boquillas de la impresora Bambu Lab X2D de cerca" [ref=e343]
        - generic [ref=e344]:
          - generic [ref=e345]: Dirección
          - heading "Impresión 3D local en Barcelona" [level=2] [ref=e346]
          - generic [ref=e347]: "Recogida en Les Corts con cita previa: cuando tu pieza esté lista, reservamos contigo por WhatsApp una hora de recogida. Horario flexible, normalmente todos los días."
          - generic [ref=e348]: "Barrios con entrega local: Les Corts · Eixample · Gràcia · Sarrià · Sants · Sant Martí · Nou Barris"
          - link "Ver en Google Maps" [ref=e350]:
            - /url: https://www.google.com/maps/search/?api=1&query=Dimension+3D+BCN+Barcelona
      - img "Boquillas de la impresora Bambu Lab X2D de cerca" [ref=e351]:
        - generic [ref=e352]:
          - heading "Sube tu archivo. En 10 segundos sabes el precio." [level=2] [ref=e353]
          - button "Ver mi precio — desde 10 €" [ref=e354] [cursor=pointer]
          - generic [ref=e355]: Sin registro · STL, OBJ, 3MF o una foto · Archivos confidenciales
      - generic [ref=e357]:
        - heading "¿Tienes dudas? Lee nuestras guías" [level=2] [ref=e358]
        - generic [ref=e359]:
          - link "¿Cuánto cuesta la impresión 3D en Barcelona? Precios reales por tamaño y material, con ejemplos y tabla de tarifas. →" [ref=e360]:
            - /url: /blog/precio-impresion-3d-barcelona
            - generic [ref=e361]:
              - strong [ref=e362]: ¿Cuánto cuesta la impresión 3D en Barcelona?
              - text: Precios reales por tamaño y material, con ejemplos y tabla de tarifas.
            - generic [ref=e363]: →
          - link "Impresión 3D urgente — entrega en 24-48h Cómo funciona el servicio express y qué materiales están disponibles. →" [ref=e364]:
            - /url: /blog/impresion-3d-urgente-barcelona
            - generic [ref=e365]:
              - strong [ref=e366]: Impresión 3D urgente — entrega en 24-48h
              - text: Cómo funciona el servicio express y qué materiales están disponibles.
            - generic [ref=e367]: →
          - link "Recambios y piezas rotas en 3D De la foto o la pieza rota a un recambio impreso en 3D en Barcelona. →" [ref=e368]:
            - /url: /blog/recambios-piezas-rotas-impresion-3d-barcelona
            - generic [ref=e369]:
              - strong [ref=e370]: Recambios y piezas rotas en 3D
              - text: De la foto o la pieza rota a un recambio impreso en 3D en Barcelona.
            - generic [ref=e371]: →
          - link "20% de descuento para estudiantes Impresión 3D con descuento universitario. Sin pedido mínimo, mismo servicio express. →" [ref=e372]:
            - /url: /impresion-3d-estudiantes-barcelona
            - generic [ref=e373]:
              - strong [ref=e374]: 20% de descuento para estudiantes
              - text: Impresión 3D con descuento universitario. Sin pedido mínimo, mismo servicio express.
            - generic [ref=e375]: →
          - link "Pedido mínimo 10 € — desde 1 pieza Una sola pieza al mismo precio por unidad que un lote. Pedido mínimo 10 €. →" [ref=e376]:
            - /url: /impresion-3d-sin-pedido-minimo
            - generic [ref=e377]:
              - strong [ref=e378]: Pedido mínimo 10 € — desde 1 pieza
              - text: Una sola pieza al mismo precio por unidad que un lote. Pedido mínimo 10 €.
            - generic [ref=e379]: →
          - link "Repuesto descatalogado — lo imprimimos en 3D ¿El fabricante ya no lo vende? Reproducimos desde foto o la pieza original. →" [ref=e380]:
            - /url: /repuesto-descatalogado
            - generic [ref=e381]:
              - strong [ref=e382]: Repuesto descatalogado — lo imprimimos en 3D
              - text: ¿El fabricante ya no lo vende? Reproducimos desde foto o la pieza original.
            - generic [ref=e383]: →
      - generic [ref=e385]:
        - heading "Servicios de Impresión 3D en Barcelona" [level=2] [ref=e386]
        - generic [ref=e387]:
          - link "Prototipos 3D" [ref=e388]:
            - /url: /prototipos-3d-barcelona
          - link "Prototipado Rápido" [ref=e389]:
            - /url: /prototipado-rapido-barcelona
          - link "Para Empresas" [ref=e390]:
            - /url: /impresion-3d-empresas-barcelona
          - link "Piezas a Medida" [ref=e391]:
            - /url: /piezas-personalizadas-3d-barcelona
          - link "Precios" [ref=e392]:
            - /url: /precio-impresion-3d-barcelona
          - link "Servicio Urgente" [ref=e393]:
            - /url: /impresion-3d-urgente-barcelona
          - link "Piezas Funcionales" [ref=e394]:
            - /url: /piezas-funcionales-barcelona
          - link "Recambios 3D" [ref=e395]:
            - /url: /recambios-impresion-3d-barcelona
          - link "Tiradas Cortas" [ref=e396]:
            - /url: /tiradas-cortas-impresion-3d-barcelona
          - link "Descuento Estudiantes" [ref=e397]:
            - /url: /impresion-3d-estudiantes-barcelona
        - heading "Envíos Internacionales" [level=2] [ref=e398]
        - generic [ref=e399]:
          - link "🇩🇪 3D-Druck Service (DE)" [ref=e400]:
            - /url: /de/3d-druck-service
          - link "🇫🇷 Impression 3D (FR)" [ref=e401]:
            - /url: /fr/impression-3d-en-ligne
          - link "🇳🇱 3D Printen (NL)" [ref=e402]:
            - /url: /nl/3d-printen-laten-maken
          - link "🇮🇹 Stampa 3D (IT)" [ref=e403]:
            - /url: /it/stampa-3d-online
          - link "🇵🇹 Impressão 3D (PT)" [ref=e404]:
            - /url: /pt/impressao-3d-online
          - link "🇩🇪 Envío a Berlín" [ref=e405]:
            - /url: /3d-printing-delivery-berlin
          - link "🇫🇷 Envío a París" [ref=e406]:
            - /url: /3d-printing-delivery-paris
          - link "🇳🇱 Envío a Amsterdam" [ref=e407]:
            - /url: /3d-printing-delivery-amsterdam
          - link "🇮🇹 Envío a Milán" [ref=e408]:
            - /url: /3d-printing-delivery-milan
          - link "🇵🇹 Envío a Lisboa" [ref=e409]:
            - /url: /3d-printing-delivery-lisbon
          - link "🇪🇸 Envío a Madrid" [ref=e410]:
            - /url: /madrid
          - link "🇪🇸 Envío a Valencia" [ref=e411]:
            - /url: /impresion-3d-con-entrega-a-valencia
    - contentinfo [ref=e412]:
      - generic [ref=e413]:
        - generic [ref=e414]:
          - generic [ref=e415]:
            - generic [ref=e416]: Ubicación
            - paragraph [ref=e421]: Barcelona, España
            - paragraph [ref=e422]: Recogida local con cita previa
          - generic [ref=e423]:
            - generic [ref=e424]: Envíos
            - paragraph [ref=e431]: España y países de la UE
            - paragraph [ref=e432]: Con seguimiento incluido
          - generic [ref=e433]:
            - generic [ref=e434]: Respuesta
            - paragraph [ref=e439]: Presupuesto en menos de 1h
            - paragraph [ref=e440]: Express disponible (24-48h)
          - generic [ref=e441]:
            - generic [ref=e442]: Enlaces rápidos
            - generic [ref=e443]:
              - link "Para Empresas" [ref=e444]:
                - /url: /impresion-3d-empresas-barcelona
              - link "Inicio" [ref=e445]:
                - /url: /
              - link "Para Makers" [ref=e446]:
                - /url: /makers
              - link "Guía del Maker" [ref=e447]:
                - /url: /maker-guide
              - link "International service" [ref=e448]:
                - /url: /3d-printing-service
              - link "Rastrear Pedido" [ref=e449]:
                - /url: /track
              - link "Sobre el creador" [ref=e450]:
                - /url: /creator
              - link "Política de privacidad" [ref=e451]:
                - /url: /privacy
              - button "Preferencias de cookies" [ref=e452] [cursor=pointer]
              - link "Política de devoluciones" [ref=e453]:
                - /url: /politica-devoluciones
        - generic [ref=e454]:
          - generic [ref=e455]:
            - paragraph [ref=e456]: Servicios
            - list [ref=e457]:
              - listitem [ref=e458]:
                - link "Impresión 3D en Barcelona" [ref=e459]:
                  - /url: /
              - listitem [ref=e460]:
                - link "Piezas Personalizadas" [ref=e461]:
                  - /url: /piezas-personalizadas-3d-barcelona
              - listitem [ref=e462]:
                - link "Prototipos 3D" [ref=e463]:
                  - /url: /prototipos-3d-barcelona
              - listitem [ref=e464]:
                - link "Impresión Urgente" [ref=e465]:
                  - /url: /impresion-3d-urgente-barcelona
              - listitem [ref=e466]:
                - link "Recambios 3D" [ref=e467]:
                  - /url: /recambios-impresion-3d-barcelona
              - listitem [ref=e468]:
                - link "Precios" [ref=e469]:
                  - /url: /precio-impresion-3d-barcelona
          - generic [ref=e470]:
            - paragraph [ref=e471]: Materiales
            - list [ref=e472]:
              - listitem [ref=e473]:
                - link "Impresión PLA" [ref=e474]:
                  - /url: /impresion-pla-barcelona
              - listitem [ref=e475]:
                - link "Impresión PETG" [ref=e476]:
                  - /url: /impresion-petg-barcelona
              - listitem [ref=e477]:
                - link "TPU Flexible" [ref=e478]:
                  - /url: /impresion-tpu-barcelona
          - generic [ref=e479]:
            - paragraph [ref=e480]: Para Empresas
            - list [ref=e481]:
              - listitem [ref=e482]:
                - link "Impresión 3D para Empresas" [ref=e483]:
                  - /url: /impresion-3d-empresas-barcelona
              - listitem [ref=e484]:
                - link "Prototipado Rápido" [ref=e485]:
                  - /url: /prototipado-rapido-barcelona
              - listitem [ref=e486]:
                - link "Tiradas Cortas" [ref=e487]:
                  - /url: /tiradas-cortas-impresion-3d-barcelona
              - listitem [ref=e488]:
                - link "Piezas Funcionales" [ref=e489]:
                  - /url: /piezas-funcionales-barcelona
          - generic [ref=e490]:
            - paragraph [ref=e491]: Especialidades
            - list [ref=e492]:
              - listitem [ref=e493]:
                - link "Miniaturas y Figuras" [ref=e494]:
                  - /url: /miniaturas-3d-barcelona
          - generic [ref=e495]:
            - paragraph [ref=e496]: Popular
            - list [ref=e497]:
              - listitem [ref=e498]:
                - link "Sin Pedido Mínimo" [ref=e499]:
                  - /url: /impresion-3d-sin-pedido-minimo
              - listitem [ref=e500]:
                - link "Repuesto Descatalogado" [ref=e501]:
                  - /url: /repuesto-descatalogado
              - listitem [ref=e502]:
                - link "Adaptador VESA Monitor" [ref=e503]:
                  - /url: /adaptador-vesa-monitor
              - listitem [ref=e504]:
                - link "Embudo Café 58mm" [ref=e505]:
                  - /url: /embudo-dosificador-cafe-58mm
              - listitem [ref=e506]:
                - link "Rueda Lavavajillas Bosch" [ref=e507]:
                  - /url: /rueda-cesto-lavavajillas-bosch
              - listitem [ref=e508]:
                - link "Adaptador Manguera Gardena" [ref=e509]:
                  - /url: /adaptador-manguera-gardena
          - generic [ref=e510]:
            - paragraph [ref=e511]: Guías
            - list [ref=e512]:
              - listitem [ref=e513]:
                - link "Cómo Elegir un Servicio" [ref=e514]:
                  - /url: /como-elegir-servicio-impresion-3d-barcelona
              - listitem [ref=e515]:
                - link "Guía de Materiales" [ref=e516]:
                  - /url: /guia-materiales-impresion-3d
              - listitem [ref=e517]:
                - link "Cómo Preparar tu Archivo" [ref=e518]:
                  - /url: /como-preparar-archivo-impresion-3d
              - listitem [ref=e519]:
                - link "Mejor Servicio en Barcelona" [ref=e520]:
                  - /url: /mejor-servicio-impresion-3d-barcelona
              - listitem [ref=e521]:
                - link "Comparativa de Materiales" [ref=e522]:
                  - /url: /comparativa-materiales-impresion-3d
              - listitem [ref=e523]:
                - link "Comparativa de Plazos" [ref=e524]:
                  - /url: /comparativa-plazos-impresion-3d
              - listitem [ref=e525]:
                - link "FDM vs SLA vs SLS" [ref=e526]:
                  - /url: /comparativa-tecnologias-impresion-3d
              - listitem [ref=e527]:
                - link "Diseño a medida" [ref=e528]:
                  - /url: /disena-tu-pieza-3d
              - listitem [ref=e529]:
                - link "Verificar archivo" [ref=e530]:
                  - /url: /verificador-archivo-3d
              - listitem [ref=e531]:
                - link "Catálogo" [ref=e532]:
                  - /url: /catalogo
              - listitem [ref=e533]:
                - link "Ganar dinero con impresora 3D" [ref=e534]:
                  - /url: /como-ganar-dinero-con-impresora-3d
              - listitem [ref=e535]:
                - link "¿Es rentable la impresión 3D?" [ref=e536]:
                  - /url: /es-rentable-negocio-impresion-3d
              - listitem [ref=e537]:
                - link "Conseguir clientes de impresión 3D" [ref=e538]:
                  - /url: /como-conseguir-clientes-impresion-3d
        - generic [ref=e539]:
          - generic [ref=e540]:
            - paragraph [ref=e541]: Ciudades y Envíos
            - list [ref=e542]:
              - listitem [ref=e543]:
                - link "Madrid" [ref=e544]:
                  - /url: /madrid
              - listitem [ref=e545]:
                - link "Impresión 3D Madrid" [ref=e546]:
                  - /url: /3d-printing-madrid
              - listitem [ref=e547]:
                - link "Envío a Valencia" [ref=e548]:
                  - /url: /impresion-3d-con-entrega-a-valencia
              - listitem [ref=e549]:
                - link "Envío a París" [ref=e550]:
                  - /url: /3d-printing-delivery-paris
              - listitem [ref=e551]:
                - link "Envío a Londres" [ref=e552]:
                  - /url: /3d-printing-delivery-london
              - listitem [ref=e553]:
                - link "Envío a Ámsterdam" [ref=e554]:
                  - /url: /3d-printing-delivery-amsterdam
              - listitem [ref=e555]:
                - link "Envío a Berlín" [ref=e556]:
                  - /url: /3d-printing-delivery-berlin
              - listitem [ref=e557]:
                - link "Envío a Milán" [ref=e558]:
                  - /url: /3d-printing-delivery-milan
              - listitem [ref=e559]:
                - link "Envío a Roma" [ref=e560]:
                  - /url: /3d-printing-delivery-rome
              - listitem [ref=e561]:
                - link "Envío a Lisboa" [ref=e562]:
                  - /url: /3d-printing-delivery-lisbon
              - listitem [ref=e563]:
                - link "Envío a Nueva York" [ref=e564]:
                  - /url: /3d-printing-delivery-new-york
              - listitem [ref=e565]:
                - link "Impresión 3D Sevilla" [ref=e566]:
                  - /url: /impresion-3d-sevilla
          - generic [ref=e567]:
            - paragraph [ref=e568]: Productos Populares
            - list [ref=e569]:
              - listitem [ref=e570]:
                - link "Jarrón Personalizado" [ref=e571]:
                  - /url: /catalogo/jarron-personalizado
              - listitem [ref=e572]:
                - link "Placa con Nombre" [ref=e573]:
                  - /url: /catalogo/placa-nombre
              - listitem [ref=e574]:
                - link "Soporte de Teléfono" [ref=e575]:
                  - /url: /catalogo/soporte-telefono
              - listitem [ref=e576]:
                - link "Topper de Boda" [ref=e577]:
                  - /url: /catalogo/topper-boda
        - generic [ref=e578]:
          - paragraph [ref=e579]: Países a los que enviamos
          - list [ref=e580]:
            - listitem [ref=e581]:
              - link "🇩🇪 3D-Druck Service" [ref=e582]:
                - /url: /de/3d-druck-service
              - generic [ref=e583]: ·
              - link "Delivery to Germany" [ref=e584]:
                - /url: /3d-printing-delivery-berlin
            - listitem [ref=e585]:
              - link "🇳🇱 3D Printen" [ref=e586]:
                - /url: /nl/3d-printen-laten-maken
              - generic [ref=e587]: ·
              - link "Delivery to Netherlands" [ref=e588]:
                - /url: /3d-printing-delivery-amsterdam
            - listitem [ref=e589]:
              - link "🇫🇷 Impression 3D" [ref=e590]:
                - /url: /fr/impression-3d-en-ligne
              - generic [ref=e591]: ·
              - link "Delivery to France" [ref=e592]:
                - /url: /3d-printing-delivery-paris
            - listitem [ref=e593]:
              - link "🇮🇹 Stampa 3D" [ref=e594]:
                - /url: /it/stampa-3d-online
              - generic [ref=e595]: ·
              - link "Delivery to Italy" [ref=e596]:
                - /url: /3d-printing-delivery-milan
            - listitem [ref=e597]:
              - link "🇵🇹 Impressão 3D" [ref=e598]:
                - /url: /pt/impressao-3d-online
              - generic [ref=e599]: ·
              - link "Delivery to Portugal" [ref=e600]:
                - /url: /3d-printing-delivery-lisbon
            - listitem [ref=e601]:
              - generic [ref=e602]: "Fuera de la UE:"
              - link "🇬🇧 London" [ref=e603]:
                - /url: /3d-printing-delivery-london
              - link "🇺🇸 New York" [ref=e604]:
                - /url: /3d-printing-delivery-new-york
        - generic [ref=e605]:
          - generic [ref=e606]:
            - generic [ref=e607]: Dimension3D Barcelona
            - paragraph [ref=e613]: Servicio profesional de impresión 3D en Barcelona
            - paragraph [ref=e614]: Producción local · Clientes de Barcelona y toda España
          - button "Contactar por WhatsApp" [ref=e615] [cursor=pointer]
        - generic [ref=e618]:
          - paragraph [ref=e619]: © 2026 Dimension3D Barcelona. Servicio de impresión 3D en Barcelona, España.
          - paragraph [ref=e620]:
            - text: Built by
            - link "Mikołaj Szczełkun" [ref=e621]:
              - /url: https://nico-portfolio-gold.vercel.app
    - link "Habla con una persona real" [ref=e622]:
      - /url: https://wa.me/34672051147?text=Hola%2C%20me%20gustar%C3%ADa%20solicitar%20un%20presupuesto%20para%20impresi%C3%B3n%203D
```

# Test source

```ts
  63  | 
  64  | // ── Entry point: hero CTA (V2 split-image hero) ───────────────────────────────
  65  | 
  66  | test("V2 hero CTA opens file chooser with source=hero", async ({ page }) => {
  67  |   const getCaptures = await spyOnCapture(page);
  68  |   await page.goto("/?xp=home_v2:B");
  69  |   await waitForV2(page);
  70  | 
  71  |   // V2 button text is "Subir archivo y ver precio"
  72  |   const heroBtn = page.locator(".xp-home-v2-only button").filter({ hasText: /Subir archivo/i }).first();
  73  |   const [fileChooser] = await Promise.all([
  74  |     page.waitForEvent("filechooser", { timeout: 6000 }),
  75  |     heroBtn.click(),
  76  |   ]);
  77  | 
  78  |   expect(fileChooser).toBeTruthy();
  79  |   await page.waitForTimeout(400);
  80  | 
  81  |   const captures = getCaptures();
  82  |   const heroUploads = captures.filter((c) => c.event === "upload_entry_click" && c.source === "hero");
  83  |   expect(heroUploads.length).toBe(1);
  84  | });
  85  | 
  86  | // ── Entry point: header upload button (desktop) ───────────────────────────────
  87  | 
  88  | test("header CTA opens file chooser with source=header", async ({ page }) => {
  89  |   const viewport = page.viewportSize();
  90  |   // The amber header CTA is desktop-only (xl:flex hidden on mobile nav)
  91  |   if (viewport && viewport.width < 1280) {
  92  |     test.skip(true, "Header amber CTA is desktop-only (hidden below xl breakpoint)");
  93  |     return;
  94  |   }
  95  |   const getCaptures = await spyOnCapture(page);
  96  |   await page.goto("/");
  97  | 
  98  |   // Header desktop CTA: amber button with "Precio al instante" or "Precios desde 10 €"
  99  |   // Both are inside a <span data-xp-slot="header_btn_r2">; find the parent button
  100 |   const headerBtn = page.locator("header button", { hasText: /Precio/i }).first();
  101 |   const [fileChooser] = await Promise.all([
  102 |     page.waitForEvent("filechooser", { timeout: 6000 }),
  103 |     headerBtn.click(),
  104 |   ]);
  105 | 
  106 |   expect(fileChooser).toBeTruthy();
  107 |   await page.waitForTimeout(400);
  108 | 
  109 |   const captures = getCaptures();
  110 |   const headerUploads = captures.filter((c) => c.event === "upload_entry_click" && c.source === "header");
  111 |   expect(headerUploads.length).toBe(1);
  112 | });
  113 | 
  114 | // ── Entry point: step card CTA (V1 "how it works" section) ───────────────────
  115 | 
  116 | test("step card CTA opens file chooser with source=step_card", async ({ page }) => {
  117 |   const getCaptures = await spyOnCapture(page);
  118 |   await page.goto("/");
  119 | 
  120 |   // Step card 1 CTA: "Elegir archivo ahora →"
  121 |   const stepCardBtn = page.locator("button", { hasText: /Elegir archivo ahora/i }).first();
  122 |   await stepCardBtn.scrollIntoViewIfNeeded();
  123 | 
  124 |   const [fileChooser] = await Promise.all([
  125 |     page.waitForEvent("filechooser", { timeout: 6000 }),
  126 |     stepCardBtn.click(),
  127 |   ]);
  128 | 
  129 |   expect(fileChooser).toBeTruthy();
  130 |   await page.waitForTimeout(400);
  131 | 
  132 |   const captures = getCaptures();
  133 |   const stepCaptures = captures.filter((c) => c.event === "upload_entry_click" && c.source === "step_card");
  134 |   // Exactly one event: confirms no duplicate firing from old handleScrollToCalc
  135 |   expect(stepCaptures.length).toBe(1);
  136 |   // And no spurious hero events fired alongside it
  137 |   const heroCaptures = captures.filter((c) => c.event === "upload_entry_click" && c.source === "hero");
  138 |   expect(heroCaptures.length).toBe(0);
  139 | });
  140 | 
  141 | // ── Entry point: final image band CTA ────────────────────────────────────────
  142 | 
  143 | test("final image band CTA opens file chooser with source=final_band", async ({ page }) => {
  144 |   const getCaptures = await spyOnCapture(page);
  145 |   await page.goto("/");
  146 | 
  147 |   // ImageBand CTA: same text as hero "Ver mi precio — desde 10 €"
  148 |   // It's near the bottom of the page; scroll to it first
  149 |   // The ImageBand is in the V1-visible section; use its section wrapper
  150 |   const imageBandBtn = page.locator("button", { hasText: /Ver mi precio/i }).last();
  151 |   await imageBandBtn.scrollIntoViewIfNeeded();
  152 | 
  153 |   const [fileChooser] = await Promise.all([
  154 |     page.waitForEvent("filechooser", { timeout: 6000 }),
  155 |     imageBandBtn.click(),
  156 |   ]);
  157 | 
  158 |   expect(fileChooser).toBeTruthy();
  159 |   await page.waitForTimeout(400);
  160 | 
  161 |   const captures = getCaptures();
  162 |   const bandCaptures = captures.filter((c) => c.event === "upload_entry_click" && c.source === "final_band");
> 163 |   expect(bandCaptures.length).toBe(1);
      |                               ^ Error: expect(received).toBe(expected) // Object.is equality
  164 | });
  165 | 
  166 | // ── Entry point: path card CTA (V2 only) ─────────────────────────────────────
  167 | 
  168 | test("V2 path card CTA opens file chooser with source=path_card", async ({ page }) => {
  169 |   const getCaptures = await spyOnCapture(page);
  170 |   await page.goto("/?xp=home_v2:B");
  171 |   await waitForV2(page);
  172 | 
  173 |   // PathCard amber CTA: "Calcular precio →"
  174 |   const pathCardBtn = page.locator("button", { hasText: /Calcular precio/i }).first();
  175 |   await pathCardBtn.scrollIntoViewIfNeeded();
  176 | 
  177 |   const [fileChooser] = await Promise.all([
  178 |     page.waitForEvent("filechooser", { timeout: 6000 }),
  179 |     pathCardBtn.click(),
  180 |   ]);
  181 | 
  182 |   expect(fileChooser).toBeTruthy();
  183 |   await page.waitForTimeout(400);
  184 | 
  185 |   const captures = getCaptures();
  186 |   const pathCaptures = captures.filter((c) => c.event === "upload_entry_click" && c.source === "path_card");
  187 |   expect(pathCaptures.length).toBe(1);
  188 | });
  189 | 
  190 | // ── V2 hero appearance ────────────────────────────────────────────────────────
  191 | 
  192 | test("?xp=home_v2:B renders split-image hero (V2 visible, V1 hidden)", async ({ page }) => {
  193 |   await page.goto("/?xp=home_v2:B");
  194 |   await waitForV2(page);
  195 | 
  196 |   const v2Section = page.locator(".xp-home-v2-only").first();
  197 |   const v1Section = page.locator(".xp-home-v1-only").first();
  198 | 
  199 |   await expect(v2Section).toBeVisible();
  200 |   await expect(v1Section).toBeHidden();
  201 | 
  202 |   // Split-image hero must include an <img> element (the machine photo)
  203 |   const splitImg = page.locator(".xp-home-v2-only img").first();
  204 |   await expect(splitImg).toBeVisible();
  205 | });
  206 | 
  207 | // ── Page-level drag and drop fires source=page_drop ──────────────────────────
  208 | 
  209 | test("page-level drag and drop fires upload_entry_click source=page_drop", async ({ page }) => {
  210 |   const getCaptures = await spyOnCapture(page);
  211 |   await page.goto("/");
  212 | 
  213 |   // Dispatch a drag sequence on the document
  214 |   await page.evaluate(() => {
  215 |     const buf = new ArrayBuffer(8);
  216 |     const file = new File([buf], "test.stl", { type: "application/octet-stream" });
  217 |     const dt = new DataTransfer();
  218 |     dt.items.add(file);
  219 | 
  220 |     document.dispatchEvent(new DragEvent("dragenter", { bubbles: true, cancelable: true, dataTransfer: dt }));
  221 |   });
  222 |   await page.waitForTimeout(100);
  223 |   await page.evaluate(() => {
  224 |     const buf = new ArrayBuffer(8);
  225 |     const file = new File([buf], "test.stl", { type: "application/octet-stream" });
  226 |     const dt = new DataTransfer();
  227 |     dt.items.add(file);
  228 |     document.dispatchEvent(new DragEvent("drop", { bubbles: true, cancelable: true, dataTransfer: dt }));
  229 |   });
  230 | 
  231 |   await page.waitForTimeout(500);
  232 |   const captures = getCaptures();
  233 |   const dropCaptures = captures.filter((c) => c.event === "upload_entry_click" && c.source === "page_drop");
  234 |   // The page-level drop handler fires exactly one upload_entry_click
  235 |   expect(dropCaptures.length).toBe(1);
  236 | });
  237 | 
  238 | // ── Mobile sticky bar CTA (mobile viewport) ───────────────────────────────────
  239 | 
  240 | test("mobile sticky bar CTA opens file chooser with source=sticky_bar", async ({ page }) => {
  241 |   await page.setViewportSize({ width: 390, height: 844 });
  242 |   const getCaptures = await spyOnCapture(page);
  243 |   await page.goto("/");
  244 | 
  245 |   // Scroll past the hero to trigger the sticky bar (IntersectionObserver)
  246 |   await page.evaluate(() => window.scrollTo({ top: 1200, behavior: "instant" }));
  247 |   await page.waitForTimeout(500);
  248 | 
  249 |   // Wait for sticky bar to appear in the DOM (it's conditionally rendered)
  250 |   const stickyBarBtn = page.locator("div.fixed.bottom-0 button").first();
  251 |   await expect(stickyBarBtn).toBeVisible({ timeout: 4000 });
  252 | 
  253 |   const [fileChooser] = await Promise.all([
  254 |     page.waitForEvent("filechooser", { timeout: 6000 }),
  255 |     stickyBarBtn.click(),
  256 |   ]);
  257 | 
  258 |   expect(fileChooser).toBeTruthy();
  259 |   await page.waitForTimeout(400);
  260 | 
  261 |   const captures = getCaptures();
  262 |   const stickyCaptures = captures.filter((c) => c.event === "upload_entry_click" && c.source === "sticky_bar");
  263 |   expect(stickyCaptures.length).toBe(1);
```