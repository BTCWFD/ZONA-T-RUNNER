# ZONA T RUNNER — Plan de producción a 90 días

Consolidado por el Game Director a partir de la evaluación de los 10 expertos del equipo
(workflow `zonat-production-review`). Este documento manda sobre las prioridades del trimestre.

## Diagnóstico ejecutivo

ZONA T RUNNER tiene un problema de asimetría, no de talento: hay meses de construcción sobre tres cosas que nadie ha verificado — una build que no se ha ejecutado desde el refactor a roster.json, un proyecto de Unity cuyo C# jamás pasó por el compilador, y un diferenciador (11 DJs reales con nombre, imagen y música) cuyos derechos no poseemos. Los diez expertos convergen sin querer en el mismo cuello de botella: no existe ni un solo activo capturado del juego, y sin él no hay reunión con club, ni deck, ni pitch a Anthropic. La segunda verdad incómoda es que la música hoy es decorado y no reloj: mientras los obstáculos se generen por metros y no por beats, esto es un runner con música encima, y los primeros en detectarlo serán precisamente los DJs y los dueños de club a los que hay que convencer. La decisión ejecutiva de estos 90 días es de renuncia, no de ambición: UN DJ (Letal), UNA superficie de producción (web-runner como producto real del piloto, no como maqueta), UN entregable (hero clip de 45-60s capturado del juego + un piloto de 4 semanas con un club), con Unity mantenido vivo solo por el gate barato de "compila, corre en un teléfono y mide". Todo lo demás —los otros 10 DJs, iOS, Addressables remoto, key art foto-real, 4 rigs de personaje— se congela explícitamente hasta que el piloto entregue números.

## Sprint 0 — Días 1-14 (en este orden)

### 1. Sesión de verificación cero-hipótesis y respaldo remoto: arrancar node server.js y jugar el web-runner de punta a punta en Chrome desktop, Safari iOS y Chrome Android (táctil, teclado, mando, los 4 DJs active, muerte y reinicio); abrir Unity y compilar hasta cero errores; hacer un clon limpio en carpeta nueva y verificar que git-lfs baja los .glb/.fbx; commitear y pushear TODO a remoto. Registrar cada resultado con fecha y dispositivo en docs/TEST_LOG.md.
**Responsable:** QA Lead (founder ejecuta, media jornada)  
**Por qué:** Hoy el estado real del proyecto es desconocido, no bueno: todo el plan posterior se apoya en la hipótesis no verificada de que la build funciona tras el refactor a fetch de roster.json, y el único respaldo del proyecto es un disco de Windows. Es media jornada que decide si el resto del sprint es construir o reparar.

### 2. Escribir y publicar docs/DECISIONS.md con el alcance congelado de 90 días, no re-litigable: UN DJ héroe (Letal), UNA superficie de producción (web-runner), UN entregable (hero clip + piloto con un club). Unity queda en modo gate ('compila y corre en un teléfono'), sin inversión de arte hasta el día 60. Se cierran además cinco decisiones abiertas: música original encargada en vez de catálogo publicado; un solo continuo estilizado-premium (se mata la pista de key art foto-real); tokens no comprables con dinero real; canje validado en servidor; iOS y Addressables remoto diferidos.
**Responsable:** Game Director / Founder  
**Por qué:** Diez expertos pidieron veinte cosas razonables y hay una persona. Sin una regla escrita de renuncia, el proyecto seguirá avanzando por lo que es interesante construir en vez de por lo que desbloquea el siguiente acuerdo — que es exactamente el patrón que ya dejó el core loop sin jugar.

### 3. Enviar el papeleo del diferenciador: release de nombre/likeness/marca de 2 páginas + acuerdo SEPARADO de música (tema original o inédito cedido, con garantía escrita de samples limpios y sin exclusiva de sello) a Letal primero y luego a Núñez, Tatán y Fresar. En el mismo mensaje pedir 3-5 fotos de referencia (frente, perfil y ESPALDA), el outfit con el que quieren aparecer, y el inventario técnico de audio (¿stems o solo máster 2-track?).
**Responsable:** Productor / BD (founder)  
**Por qué:** Es lo más barato de la lista, lo que más tarda en volver por calendario, y el gate de todo lo demás: sin firma no hay key art, no hay demo pública, no hay tienda y no se puede mostrar el repo a Anthropic. Además el inventario de stems decide si el sistema musical es posible o si Fever/Drop hay que rediseñarlo sobre filtros.

### 4. Extender data/djs/dj_schema.json y roster.json ANTES de escribir código de audio: bloque audio por DJ (bpm, first_beat_offset_ms, time_signature, key, loop_bars, sections[] con intro/build/drop por compás, stems[] con rol y tier), campo rights_status (none/verbal/signed) y un data/visual/dj_visuals.json con acento, fog, LUT, umbral y curva de bloom.
**Responsable:** Director de Audio + Diseñador de Juego  
**Por qué:** Es la acción de mayor apalancamiento por menos esfuerzo: game.js, DJRosterLoader y ContentSync ya leen data/ como fuente única, así que ambos motores heredan gratis el sistema musical y el de look, y se mata de raíz la divergencia visual entre escaparate y producto. Sin first_beat_offset_ms todo el sync va corrido, y son datos que puede rellenar el propio DJ.

### 5. Implementar el Conductor en web-runner: el tiempo de la simulación se lee de AudioContext.currentTime (nunca acumulando deltaTime, nunca AudioSource.time) y expone beat/compás/frase. Migrar la generación de obstáculos de metros a REJILLA DE BEATS, con la velocidad del corredor derivada del BPM de forma que los metros-por-beat sean constantes entre DJs. Neón, bloom, banking y pulso de UI pasan a consumir ese reloj.
**Responsable:** Director Técnico (web-runner)  
**Por qué:** Es la decisión que convierte la música en gameplay: si los obstáculos caen en el beat, saltar ya es bailar. De regalo elimina el problema de que elegir a Fresar (138) sea secretamente más difícil que Núñez (128), porque la ventana de reacción medida en beats se vuelve idéntica y la dificultad pasa a ser un parámetro explícito. Acumular tiempo por frame deriva audiblemente en menos de 60 segundos.

### 6. Playtest real y pase de tuning documentado en docs/CORE_LOOP_TUNING.md: velocidad base y curva de aceleración expresadas en metros-por-beat, snappiness del cambio de carril, ventanas de reacción de salto/deslizar, air time, duración del slide y espaciado/densidad de obstáculos por compás. Definir además la rampa de los primeros 60 segundos pensada para la demo.
**Responsable:** Diseñador de Juego  
**Por qué:** Es la fundación no verificada sobre la que se apila todo: sin estos números, el artista de personajes no puede autorizar un ciclo de carrera sin patinaje, el de entornos no sabe dónde no puede poner props, y QA no tiene criterios de aceptación. Y 'divertido en 30 segundos' es literalmente lo que se pitchea.

### 7. Validador de datos + CI mínimo en GitHub Actions que corra en cada push: roster.json contra dj_schema.json, invariantes semánticas que el schema no cubre (id y accentColor únicos y con contraste suficiente, BPM en rango jugable, todo DJ 'active' obliga a rights_status='signed' + habilidad implementada + rutas de audio existentes), node --check de game.js/server.js y compilación headless de Unity con ContentSync ejecutado. Mostrar el hash del roster en la pantalla de debug.
**Responsable:** QA Lead  
**Por qué:** roster.json alimenta dos motores y se copia a StreamingAssets (gitignoreado) solo si alguien se acuerda: es la vía directa a una build corriendo datos viejos y a un DJ sin habilidad delante de un club. Con 1-2 personas, el validador automático es el único QA que trabaja mientras duermen — y el gate de rights_status convierte el riesgo legal en un error de compilación.

### 8. Comprar 2 dispositivos de referencia nombrados por SoC concreto: un Android de gama media colombiana (clase Moto G / Galaxy A15 con Snapdragon 6xx) y un iPhone SE 2020 como piso iOS. Montar el harness de medición: overlay con frame time p99 y 1% low, contador de frames >33ms, RAM pico y GC por frame.
**Responsable:** Founder (decisión de compra)  
**Por qué:** 'Snapdragon 600+' abarca desde un 660 hasta un 8 Gen 3: sin un aparato físico nombrado no hay presupuesto de frame real, y el fallo típico de un runner no es el FPS pico sino el throttling al minuto 8. Dos teléfonos usados cuestan menos que un día perdido rehaciendo arte tarde, y son lo único que convierte los 60 FPS de promesa de pitch en hecho defendible.

### 9. Producir el sistema de marca mínimo y el style guide de 1-2 páginas: wordmark/logo, tipografía, y la gramática visual firma escrita como reglas binarias verificables (neón emisivo reactivo al BPM, reflejos de asfalto mojado por geometría espejada — nunca planar reflection ni SSR, banking y kick de cámara al beat, qué post es obligatorio y qué se degrada en Mobile Low).
**Responsable:** Director Creativo  
**Por qué:** Sin wordmark está bloqueado el splash, los iconos de tienda, el kit de UI y cualquier one-pager para clubes — el flujo de arranque literalmente no puede empezar. Y sin reglas binarias, QA no puede dictaminar si el vertical slice cumple la barra de calidad: se discute por gusto, que es lo que un equipo de una persona no se puede permitir.

### 10. Rediseñar el arranque y hacer el pase de accesibilidad: eliminar la selección de DJ como puerta de la primera sesión (logo saltable → tap-to-run con Letal preseleccionada → corriendo en <8s, onboarding en movimiento y nunca un modal); y añadir modo reducir-destellos (<3 Hz, bloom bajo), reducir-movimiento (apaga shake y banking) y señalización de obstáculos por silueta y no solo por color.
**Responsable:** Diseñador UX/UI  
**Por qué:** El contexto real de prueba es un club ruidoso con un desconocido sosteniendo el teléfono 60 segundos: si hay que elegir DJ y leer un tutorial antes de correr, el pitch se muere ahí. Y el estroboscopio a 130-138 BPM con bloom es un riesgo de fotosensibilidad real y un motivo de fricción en review de tiendas: ahora es una tarde de reglas, después de 11 mundos es un rework estructural.

## Roadmap a 90 días

### H1 · Días 1-14 — VERDAD Y DERECHOS (Sprint 0): saber qué funciona de verdad y desbloquear legalmente al DJ héroe

- Verificación cero-hipótesis de las tres superficies + backup remoto verificado
- Congelar alcance por escrito y publicarlo como regla no re-litigable
- Enviar el papeleo de likeness y de música original a los 4 DJs, priorizando Letal
- Playtest documentado y tuning del core loop
- Contrato de datos: bloque audio + rights_status + dj_visuals.json
- Validador + CI mínimo en GitHub Actions
- Compra de los 2 dispositivos de referencia
- Style guide de 1-2 páginas + wordmark y pase de accesibilidad

**Criterios de salida:** docs/TEST_LOG.md con la build ejecutada de punta a punta en Chrome desktop + Safari iOS + Chrome Android; Unity compila con cero errores; clon limpio del repo abre con LFS íntegro; todo pusheado a remoto y CI en verde en cada push. docs/DECISIONS.md firmado con el alcance congelado. Release de likeness + acuerdo de música ENVIADOS a los 4 DJs y al menos Letal con respuesta positiva. docs/CORE_LOOP_TUNING.md con valores canónicos medidos jugando, no inventados. dj_schema.json extendido con bloque audio y rights_status, validado en CI. 2 teléfonos de referencia comprados y nombrados por SoC.

### H2 · Días 15-32 — EL JUEGO SE VUELVE MUSICAL: el reloj de audio manda sobre la simulación

- Conductor: reloj de audio como autoridad de tiempo de la simulación en web-runner
- Migrar TrackSpawner de metros a rejilla de beats; velocidad derivada del BPM
- Spec e implementación de Fever/Drop como evento musical cuantizado a frase
- Pantalla de calibración de latencia con offset persistido por dispositivo
- Neón, bloom, banking y pulso de UI consumiendo ESE reloj, no un FFT propio
- Medición de latencia real por ruta (altavoz/cable/Bluetooth) en los 2 teléfonos

**Criterios de salida:** Los obstáculos se generan en rejilla de beats con metros-por-beat constante entre DJs (la dificultad deja de depender del BPM); el Conductor lee AudioContext.currentTime y no acumula deltaTime — cero deriva audible tras 5 minutos continuos. Fever se arma y entra cuantizado al límite de frase o al drop marcado en sections[]; al chocar cae el stem de drums un compás con filtro pasa-bajos. docs/FEVER_DROP_SPEC.md y docs/AUDIO_DIRECTION.md escritos y co-firmados. Ventana de acción en beat ±120 ms con offset calibrable, que premia pero nunca castiga. Corre a 60 FPS estables en el Android de referencia con la sesión de 20 minutos sin caer bajo el presupuesto de p99.

### H3 · Días 25-45 — HERO CLIP DE LETAL: convertir la visión en un activo que se puede enseñar

- Trim sheet + atlas único de Zona T y re-UV del blockout al atlas compartido
- Curved-world por desplazamiento de vértices; NADA de modelar segmentos curvos
- Dressing kit de Letal (8-12 props, rig de luz, niebla, paleta emisiva) y prueba de contraste con Fresar
- Rig Humanoid + skinning de Letal, ciclo de carrera con zancada sincronizada al tuning y foot-lock al beat
- Pase de silueta desde la cámara real: motivos firma reubicados a la espalda
- Reconciliar la UI: flujo de arranque, HUD y game over del canvas implementados en la build
- Captura, montaje y grado del hero clip

**Criterios de salida:** Un clip de 45-60s capturado DEL JUEGO (no de renders de Blender) que aguante verse en pantalla grande sin disculpas: mundo de Letal vestido, Fever entrando en el drop, personaje con ciclo de carrera sin patinaje, HUD y arranque conformes al diseño. Camino logo→corriendo medido en <8s y primer obstáculo a los ~12s, verificado con un desconocido sosteniendo el teléfono. Fresar existe como prueba de contraste (mismo kit, otro LUT/fog/props) suficiente para demostrar que el sistema de mundos escala sin arte nuevo.

### H4 · Días 40-58 — PLAY-TO-PARTY DEJA DE SER UNA DIAPOSITIVA: economía, canje y paquete comercial

- Economía de tokens: fuentes, sumideros y escalera de conversión con anti-farming
- Backend mínimo de canje: emisión server-authoritative, expiración, un solo uso
- UI de Play-to-Party: wallet, catálogo de beneficios, canje con QR y vista del staff del club
- docs/BUSINESS_MODEL.md con P&L del club y precio de piloto
- Deck + one-pagers diferenciados (club / DJ-manager / marca) + term sheet firmable en la mesa
- Reuniones presenciales: 1 club a la vez, con el hero clip en el teléfono

**Criterios de salida:** docs/BUSINESS_MODEL.md con aritmética real: P&L del canje desde la óptica del club, techo de canjes por noche, tabla tokens→beneficio con fuentes y sumideros, y la regla dura de que los tokens no son comprables con dinero. Emisión de códigos de un solo uso validada en servidor, con expiración y vista de staff que valida en menos de 3 segundos, probada de forma adversarial (replay, doble canje, reloj manipulado, sin señal). Deck de 10 slides + tres one-pagers + term sheet de una página. Salida binaria del hito: UNA carta de intención firmada con un club de Zona T y fecha de piloto en el calendario.

### H5 · Días 55-85 — PILOTO REAL DE 4 SEMANAS EN UN CLUB (web-runner en producción)

- Instalación del piloto: QR en mesa/entrada, modo kiosco, fallback offline duro
- Operación nocturna y soporte al staff durante 4 semanas
- Explotación de la telemetría como instrumento de producto (muerte por tipo de obstáculo, distancia media, abandono)
- Iteración semanal de tuning y de la escalera de beneficios con datos reales
- Cierre: informe del piloto con costo por visita atribuida y propuesta de renovación

**Criterios de salida:** Datos defendibles de 4 semanas: escaneos de QR, partidas, duración media, abandono en los primeros 60s, tokens ganados, códigos emitidos, códigos canjeados en puerta y costo por visita atribuida. Cero incidentes de fraude no detectados. Checklist de demo cumplido todas las noches (arranca sin red, sin pantalla de error posible, modo kiosco con reinicio automático). El club dice por escrito si renueva y a qué precio — un 'no' con razones también es salida válida del hito.

### H6 · Días 60-90 (en paralelo) — UNITY ALCANZA AL WEB Y SE PITCHEA LA HISTORIA

- Cablear los prefabs del kit en una escena Gameplay_Letal con TrackSpawner y personaje
- Congelar y validar automáticamente el contrato del kit (pivote, escala, ejes, socket a 40m)
- Portar el Conductor a AudioSettings.dspTime + PlayScheduled, con re-tuning del feel (no es un port, es un re-tuning)
- Gate de rendimiento medido: HUD de ProfilerRecorder, test de 0 GC, soak de 10 min, shader stripping y prewarm
- DJVisualProfile leyendo dj_visuals.json para que web y Unity dejen de divergir
- Writeup y pitch a Anthropic como caso de producción asistida por IA
- Gate go/no-go para escalar a los DJs 2-4 y a iOS (que exige decidir Mac o runner macOS)

**Criterios de salida:** APK ARM64/IL2CPP <60MB instalado en el teléfono de referencia con Letal jugable 3 minutos sin crash; contrato del kit congelado y verificado por un validador bpy que encadena 20 segmentos sin costura >1mm; test de rendimiento que falla con >0 B de GC.Alloc en 600 frames; soak de 10 minutos reportando p99 dentro de presupuesto. Writeup reproducible de producción asistida por IA + hero clip + números del piloto, enviado a Anthropic por la puerta correcta (developer marketing / programa de startups), y NUNCA antes de tener las cesiones firmadas. Gate de decisión escrito: se abren DJs 2-4 solo si el piloto renovó o si hay un segundo club firmado.

## Riesgos críticos y mitigación

### ⚠️ CREDIBILIDAD OPERATIVA: se está pitcheando un producto cuya build nadie ha ejecutado desde el refactor a roster.json, y cuyo C# de Unity nunca compiló. El modo de fallo más probable en la reunión que importa es una pantalla de error por fetch fallido.
**Mitigación:** Sesión de verificación cero-hipótesis en el día 1 del Sprint 0 (3 navegadores + Unity compilando + clon limpio con LFS), registrada en docs/TEST_LOG.md. Roster embebido como fallback duro en game.js y modo demo 100% offline con service worker. Regla de demo: nunca se enseña una build que no se ejecutó completa el mismo día, y siempre existe un plan B en vídeo en el teléfono.

### ⚠️ DERECHOS DE MÚSICA (bloqueador de lanzamiento absoluto y el más subestimado): cero licencias firmadas. Un track ya editado arrastra máster + edición + samples de packs + gestión colectiva (Sayco/Acinpro). Si el catálogo cae, cae el tuning por BPM, el Fever/Drop y la premisa 'cada DJ es un mundo'.
**Mitigación:** Decisión tomada: NO se construye sobre catálogo publicado. Se encarga un tema ORIGINAL/inédito por DJ, cedido para uso interactivo + sync, con garantía escrita de samples limpios y sin exclusiva de sello. Hasta que Letal firme, todo el tuning se hace sobre un placeholder propio del mismo BPM y el sistema es data-driven (bpm, first_beat_offset_ms, sections[]) para que cambiar el archivo no cueste rehacer diseño.

### ⚠️ LIKENESS Y TRADE DRESS: 11 DJs reales y 10 fachadas de clubes reales en el producto sin un solo release firmado. Hoy duerme porque el repo es privado; se despierta el día que se publique, se muestre a Anthropic o se imprima key art.
**Mitigación:** Campo rights_status (none/verbal/signed) en dj_schema.json con gate en CI: ningún DJ pasa a 'active' sin 'signed'. Release de 2 páginas (nombre + likeness + marca) enviado a los 4 en la semana 1, empezando por Letal. Fachadas de club con el letrero como slot de textura intercambiable: si un club no firma, se cambia la textura y la geometría sobrevive. Nada de key art foto-real hasta firma.

### ⚠️ DISPERSIÓN: la tentación estructural de este proyecto es avanzar en 11 DJs, dos motores y tres superficies a la vez con 1 persona. Es el patrón que ya dejó el core loop sin jugar tras un refactor.
**Mitigación:** Regla de alcance congelada por escrito (docs/DECISIONS.md) y no re-litigable durante 90 días: UN DJ (Letal), UNA superficie de producción (web-runner), UN entregable (hero clip + piloto). Unity se mantiene vivo solo con el gate barato 'compila y corre en un teléfono', sin inversión de arte hasta el día 60. Cualquier trabajo en DJs 2-4 está bloqueado hasta que el piloto entregue datos.

### ⚠️ RENDIMIENTO Y TÉRMICA DESCUBIERTOS TARDE: '60 FPS en Snapdragon 600+, <300MB, 0 GC' son aspiraciones sin una sola medición. El fallo real de un runner no es el FPS pico sino el throttling al minuto 8 y los hitches de 200 ms al hacer spawn — exactamente la duración de una demo en un club.
**Mitigación:** Comprar 2 dispositivos de referencia nombrados en el Sprint 0 (un Snapdragon 6xx clase Moto G/Galaxy A15 y un iPhone SE 2020 como piso iOS). Protocolo de soak de 20 minutos reportando p99 y 1% low, frames >33 ms, RAM pico y GC/frame a los minutos 1, 8 y 15. Congelar ya la receta de render: cero luces realtime, cero SSR/planar reflections (asfalto mojado = geometría espejada de tiras emisivas + fade), bloom en cadena downsampleada, render scale como primera perilla. Presupuestar OVERDRAW explícitamente en QUALITY_TIERS.md junto a los tris.

### ⚠️ FRAUDE Y OPERATIVA DE CANJE: si los tokens son estado de cliente, el canje se falsifica con una captura de pantalla, un reloj cambiado o un APK modificado. El punto de fallo real no es el servidor: es el bartender a las 2am con mala cobertura.
**Mitigación:** El canje es server-authoritative desde el primer piloto, no después: código de un solo uso con expiración corta, emitido por servidor, validado en la vista de staff (marca como usado en el acto, con modo offline de cola firmada). Los tokens NUNCA se pueden comprar con dinero real — evita Apple 3.1.1 y la zona gris de promoción/sorteo bajo regulación colombiana. Prueba de campo adversarial (replay, doble canje en dos clubes, reloj manipulado, sin señal) antes de la primera noche real.

### ⚠️ SOBRE-PROMESA MARKETING vs IN-GAME: key art foto-real (Higgsfield) contra un juego estilizado lee como bait-and-switch ante clubes, prensa y jugadores — y encima es justo lo que los derechos bloquean.
**Mitigación:** Decisión cerrada: un solo continuo 'estilizado-premium'. Se mata la pista foto-real. Todo el material comercial se captura DEL JUEGO, no de renders offline de Blender. Regla de style guide: si un frame no se puede reproducir en la build, no se usa para vender.

### ⚠️ DIVERGENCIA DE VERDADES (datos, look y UI): StreamingAssets/data está en .gitignore con copiado manual; el look vive duplicado entre Three.js y Unity; la UI del canvas y la de game.js no se han reconciliado. Todo esto falla en silencio y se descubre delante de un cliente.
**Mitigación:** data/ es la única fuente de verdad, ampliada a audio (bloque audio por DJ) y a look (dj_visuals.json: acento, fog, LUT, curva de bloom) y a tokens de UI. ContentSync pasa de opción de menú a hook IPreprocessBuildWithReport. Validador en CI en cada push (schema + invariantes semánticas + rutas de assets existentes + node --check + compilación headless de Unity). Hash del roster visible en la pantalla de debug para detectar deriva de un vistazo.

### ⚠️ SALUD Y REVISIÓN DE TIENDAS: neón estroboscópico a 128-138 BPM con bloom, screen shake y banking de cámara, sin ningún modo de reducción. Riesgo de fotosensibilidad real (agravado si se proyecta en pantalla grande dentro de un club), de mareo a los 30 segundos y de fricción en review.
**Mitigación:** Pase de accesibilidad en el Sprint 0, no al final: limitar destellos a <3 Hz en modo reducir-destellos, reducir-movimiento que apaga shake y banking, y señalización de obstáculos por SILUETA (las 3 formas del kit ya lo permiten), nunca solo por color de acento. Escrito como regla binaria en el style guide para que QA pueda dictaminar en vez de opinar.

### ⚠️ BUS FACTOR 1 Y PÉRDIDA DE TRABAJO: el founder es producto, ingeniería, arte, ventas y legal a la vez; hay trabajo sin commitear y el único respaldo es un disco de Windows. Además el pipeline de personajes por script borra rig, UVs y weights en cada re-ejecución.
**Mitigación:** Push a remoto verificado en la hora 1 del Sprint 0 y CI que prueba el clon limpio. Bifurcar el personaje AHORA: el output del script pasa a .blend versionado en LFS como fuente única y el script deja de ser autoritativo. Congelar la versión exacta del editor Unity (ProjectVersion.txt) durante los 90 días. Bloques de agenda separados: nunca negociar con 4 DJs y 3 clubes en paralelo — 1 DJ + 1 club a la vez.

## Por qué este orden

El orden lo dicta una sola pregunta: qué desbloquea a más gente por menos horas. Primero verdad (nada se planifica sobre una build que nadie ejecutó y un repo sin respaldo), luego derechos (todo el valor del proyecto descansa sobre personas que aún no han firmado, y el papeleo tarda semanas de calendario pero cuesta horas de trabajo — por eso se envía el día 3, no el día 60). Después el reloj musical, porque es la única pieza que es simultáneamente el diferenciador del pitch, la solución al problema de que elegir un DJ de 138 BPM sea secretamente más difícil, y el ancla sin la cual el Fever, el neón reactivo y el pulso de UI son animaciones adivinadas: construir arte antes que el reloj obliga a re-cronometrarlo todo. El hero clip va tercero y no primero porque un clip sin gameplay musical vende una mentira que el producto no entrega. La decisión más contraintuitiva y la más importante es tratar el web-runner como el producto real durante 60 días: es la única superficie que ya corre, no tiene review de tienda, itera en horas y permite pilotear en un club el mes que viene en lugar del año que viene — mientras Unity se mantiene vivo con el gate más barato posible (compilar y medir en un teléfono) para que su andamiaje no se pudra en silencio ni se descubra tarde que era 60% reescritura. Y el pitch a Anthropic va deliberadamente al final: es una sola bala, se dispara con clip + datos de piloto + cesiones firmadas, y presentarlo como caso de producción asistida por IA en vez de como oportunidad de inversión es la diferencia entre una puerta abierta y una puerta quemada.

## Expertos que evaluaron

- **Director Creativo** — Dirección creativa, dirección de arte y coherencia de marca — que ZONA T RUNNER se sienta como un videoclip in
- **Diseñador de Juego** — Diseño de Juego — core loop, balance, sistema de DJs/habilidades, economía de tokens, power-ups, Fever/Drop, u
- **Director Técnico (Unity/URP)** — Dirección Técnica — Unity 6 LTS + URP, rendimiento (60 FPS / 0 GC), arquitectura content-driven, input multipl
- **Artista de Entornos** — Arte de Entornos — mapa Zona T, kit modular de pista, fachadas de clubes y pipeline Blender→motor
- **Artista de Personajes** — Arte de Personajes / Rig y Animación de los 4 DJs (Letal, Núñez, Tatán, Fresar)
- **Technical Artist** — Technical Art — shaders URP, materiales PBR, VFX de neón, post reactivo al BPM, reflejos por tier
- **Director de Audio** — Audio y música — stems, sincronía a BPM, SFX electrónicos, Drop/Fever y licenciamiento de la música de los DJs
- **Diseñador UX/UI** — Diseño UX/UI — flujo de arranque, selección de DJ, HUD, game over, onboarding, accesibilidad y la capa de inte
- **Productor / BD** — Producción / Business Development — roadmap, monetización, alianzas (clubes y DJs), go-to-market, pitch a Anth
- **QA Lead** — QA / Calidad, rendimiento en dispositivo, validación de datos y definición de "terminado"

_Evaluaciones completas por rol en el journal del workflow wf_8789bffe-463._
