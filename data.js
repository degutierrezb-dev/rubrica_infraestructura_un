// ============================================================
// data.js — Datos de la rúbrica de infraestructura UniNorte
// 14 categorías con dimensiones y descriptores por nivel
// ============================================================

const CATEGORIES = [
  {
    id: "salon", name: "Salón de Clases", icon: "🏫",
    dimensions: [
      { id: "estructura", name: "Estructura y Acabados", descriptors: {
        5: "Paredes, piso y techo en perfecto estado. Pintura uniforme, sin manchas ni grietas. Piso nivelado y limpio.",
        4: "Paredes y piso en buen estado general. Marcas menores de uso. Pintura con desgaste mínimo.",
        3: "Pintura desgastada en algunas áreas. Grietas superficiales visibles. Piso con desgaste moderado.",
        2: "Humedad visible, descascaramiento de pintura o grietas notorias. Piso deteriorado.",
        1: "Daño estructural evidente (infiltraciones activas, grietas profundas, techo con riesgo). Piso inestable."
      }},
      { id: "mobiliario", name: "Mobiliario", descriptors: {
        5: "Todo el mobiliario en excelente estado, completo y funcional. Sillas ergonómicas, mesas estables, tableros limpios.",
        4: "Mobiliario en buen estado. Desgaste menor por uso normal. Todos los puestos funcionales.",
        3: "Algunos muebles con desgaste visible. 90%+ de los puestos funcionales.",
        2: "Mobiliario deteriorado: sillas rotas, mesas inestables, tableros dañados. 70-89% funcional.",
        1: "Más del 30% del mobiliario inutilizable. Impide el desarrollo normal de la clase."
      }},
      { id: "iluminacion", name: "Iluminación", descriptors: {
        5: "Iluminación uniforme y suficiente (≥300 lux). Todas las luminarias funcionando.",
        4: "Iluminación adecuada. Máximo 1-2 luminarias fundidas sin afectar significativamente.",
        3: "Iluminación desigual. Algunas zonas oscuras. 10-20% de luminarias sin funcionar.",
        2: "Iluminación insuficiente que dificulta lectura. >20% luminarias sin funcionar.",
        1: "Sin iluminación artificial funcional o extremadamente deficiente."
      }},
      { id: "ventilacion", name: "Ventilación y Climatización", descriptors: {
        5: "AC funcionando óptimamente. Temperatura 22-24°C. Sin ruidos excesivos. Filtros limpios.",
        4: "Climatización funcional con variaciones menores. Ruido leve.",
        3: "AC funciona con deficiencias (enfría irregularmente, gotea levemente, ruido moderado).",
        2: "Climatización deficiente: no enfría adecuadamente, goteo constante, ruido excesivo.",
        1: "Sin AC funcional en espacio cerrado. >30°C interior."
      }},
      { id: "tecnologia", name: "Equipos Tecnológicos", descriptors: {
        5: "Video beam, sonido, tomas eléctricas y conectividad WiFi/ethernet perfectos.",
        4: "Equipos funcionales con detalles menores (cables a la vista, control remoto gastado).",
        3: "Algún equipo intermitente. Al menos video beam y tomas funcionan.",
        2: "Equipos principales sin funcionar (video beam dañado). Tomas dañadas.",
        1: "Sin equipos tecnológicos funcionales. Sin tomas eléctricas. Sin conectividad."
      }},
      { id: "limpieza", name: "Limpieza e Higiene", descriptors: {
        5: "Espacio impecable. Sin basura, polvo o manchas. Papelera disponible y vacía.",
        4: "Limpio en general. Mínimo polvo. Papelera disponible.",
        3: "Limpieza aceptable con acumulación menor de polvo o basura.",
        2: "Suciedad visible en pisos, mesas o sillas. Papelera desbordada o ausente.",
        1: "Espacio sucio. Malos olores, plagas o residuos orgánicos."
      }},
      { id: "senalizacion", name: "Señalización y Accesibilidad", descriptors: {
        5: "Número de sala visible. Señalización de emergencia completa. Acceso para movilidad reducida. Ruta evacuación clara.",
        4: "Señalización presente y legible. Ruta de evacuación visible. Acceso adecuado.",
        3: "Señalización parcial (falta número de sala o señalización incompleta).",
        2: "Señalización ausente o ilegible. Sin ruta de evacuación visible. Obstáculos.",
        1: "Sin señalización. Barreras de accesibilidad significativas. Salidas bloqueadas."
      }}
    ]
  },
  {
    id: "laboratorio", name: "Laboratorio", icon: "🔬",
    dimensions: [
      { id: "estructura", name: "Estructura y Acabados", descriptors: {
        5: "Pisos antideslizantes en perfecto estado. Paredes lavables sin daños. Mesones íntegros. Instalaciones de agua/gas seguras.",
        4: "Estructura en buen estado. Desgaste mínimo en superficies. Instalaciones funcionales con mantenimiento al día.",
        3: "Superficies con desgaste moderado (manchas, rayones). Instalaciones funcionales con goteos menores.",
        2: "Mesones deteriorados o inestables. Pisos resbalosos. Instalaciones con fugas visibles.",
        1: "Daño estructural que compromete la seguridad. Instalaciones de agua/gas con riesgo de accidente."
      }},
      { id: "equipos", name: "Equipos y Dotación", descriptors: {
        5: "Equipos completos, calibrados y en perfecto funcionamiento. Inventario actualizado. Insumos suficientes.",
        4: "Equipos funcionales con mantenimiento preventivo al día. Insumos disponibles.",
        3: "Algunos equipos requieren calibración o reparación menor. Insumos limitados pero suficientes.",
        2: "Equipos clave fuera de servicio. Insumos insuficientes. Prácticas afectadas.",
        1: "Mayoría de equipos inoperativos o ausentes. Imposibilidad de realizar prácticas."
      }},
      { id: "seguridad", name: "Seguridad", descriptors: {
        5: "Ducha de emergencia y lavaojos funcionales. Extintores vigentes. Botiquín completo. EPP disponible. Hojas SDS actualizadas.",
        4: "Elementos de seguridad presentes y funcionales. Fechas vigentes. EPP disponible con desgaste menor.",
        3: "Elementos presentes pero con deficiencias menores (botiquín incompleto, EPP desgastado).",
        2: "Faltan elementos críticos (sin extintor, ducha bloqueada). EPP insuficiente o deteriorado.",
        1: "Sin elementos de seguridad funcionales. Riesgo inminente. Sustancias peligrosas sin control."
      }},
      { id: "ventilacion", name: "Ventilación y Extracción", descriptors: {
        5: "Sistema de extracción/campanas funcionando óptimamente. Ventilación adecuada. Sin olores químicos residuales.",
        4: "Sistemas funcionales con mantenimiento al día. Extracción efectiva con ruido leve.",
        3: "Ventilación funcional pero insuficiente en alta demanda. Olores químicos leves ocasionales.",
        2: "Campanas deficientes o parcialmente inoperativas. Olores químicos persistentes.",
        1: "Sin sistema de extracción funcional. Riesgo de exposición a vapores tóxicos."
      }},
      { id: "limpieza_senal", name: "Limpieza, Iluminación y Señalización", descriptors: {
        5: "Limpieza impecable. Iluminación ≥500 lux. Señalización de riesgos completa (pictogramas GHS, rutas, normas).",
        4: "Limpio y bien iluminado. Señalización presente y legible.",
        3: "Limpieza aceptable. Iluminación adecuada con zonas de penumbra. Señalización parcial.",
        2: "Residuos químicos sin limpiar. Iluminación deficiente. Señalización incompleta.",
        1: "Condiciones antihigiénicas. Sin iluminación adecuada. Sin señalización de riesgos."
      }}
    ]
  },
  {
    id: "sala_pc", name: "Sala de Computadores", icon: "💻",
    dimensions: [
      { id: "mobiliario", name: "Mobiliario y Ergonomía", descriptors: {
        5: "Mesas amplias y estables. Sillas ergonómicas ajustables. Monitores a altura adecuada. Cableado canalizado.",
        4: "Mobiliario en buen estado. Ergonomía aceptable. Cableado mayormente organizado.",
        3: "Mobiliario funcional con desgaste. Algunos cables expuestos. Espacio algo reducido entre puestos.",
        2: "Mobiliario deteriorado. Cables desordenados (riesgo de tropiezo). Hacinamiento.",
        1: "Mobiliario inservible. Cableado peligroso. Impide el uso adecuado."
      }},
      { id: "equipos_computo", name: "Equipos de Cómputo", descriptors: {
        5: "100% equipos funcionales. Hardware actualizado (máx 5 años). Rendimiento fluido. Periféricos completos.",
        4: "95%+ equipos funcionales. Hardware adecuado. Periféricos completos.",
        3: "85-94% equipos funcionales. Rendimiento lento pero utilizable. Algunos periféricos faltantes.",
        2: "70-84% equipos funcionales. Equipos obsoletos o muy lentos. Periféricos incompletos.",
        1: "<70% equipos funcionales. Equipos inoperativos o extremadamente obsoletos."
      }},
      { id: "software", name: "Software y Conectividad", descriptors: {
        5: "Software académico licenciado e instalado. SO actualizado. WiFi y ethernet rápidos y estables.",
        4: "Software necesario instalado y funcional. Conectividad estable con velocidad adecuada.",
        3: "Software parcialmente actualizado. Conectividad intermitente o lenta en horas pico.",
        2: "Software desactualizado o faltante. Conectividad deficiente.",
        1: "Sin software académico necesario. Sin conectividad. Equipos sin SO funcional."
      }},
      { id: "clima_ilum", name: "Climatización, Iluminación y Limpieza", descriptors: {
        5: "AC óptimo (20-24°C). Iluminación antireflejos. Espacio limpio y sin polvo en equipos.",
        4: "Climatización adecuada. Iluminación correcta. Limpieza general buena.",
        3: "Climatización funcional con variaciones. Reflejos ocasionales. Polvo acumulado en algunos equipos.",
        2: "Temperatura >26°C (riesgo para equipos). Iluminación que genera fatiga visual. Polvo excesivo.",
        1: "Sin climatización. Iluminación deficiente. Suciedad generalizada."
      }}
    ]
  },
  {
    id: "fachada", name: "Fachada de Edificio", icon: "🏢",
    dimensions: [
      { id: "pintura", name: "Pintura y Revestimiento", descriptors: {
        5: "Pintura/revestimiento uniforme, sin descascaramiento ni decoloración. Colores institucionales definidos.",
        4: "Pintura en buen estado con decoloración mínima por exposición solar. Sin descascaramiento.",
        3: "Decoloración moderada. Zonas con pintura desgastada pero sin descascaramiento extenso.",
        2: "Descascaramiento visible. Manchas de humedad notorias. Pérdida de color institucional.",
        1: "Fachada severamente deteriorada. Descascaramiento extenso, grafitis sin remover."
      }},
      { id: "integridad", name: "Integridad Estructural Visible", descriptors: {
        5: "Sin grietas, fisuras ni desprendimientos. Juntas y sellos en perfecto estado.",
        4: "Microfisuras superficiales sin implicación estructural. Juntas en buen estado.",
        3: "Grietas superficiales visibles. Algunos sellos deteriorados. Sin riesgo estructural aparente.",
        2: "Grietas significativas. Elementos decorativos desprendidos. Requiere evaluación estructural.",
        1: "Grietas estructurales evidentes. Riesgo de desprendimiento. Peligro para transeúntes."
      }},
      { id: "ventaneria", name: "Ventanería y Elementos Exteriores", descriptors: {
        5: "Ventanas limpias, sellos intactos, vidrios completos. Canaletas funcionales. Sin corrosión.",
        4: "Ventanas en buen estado con suciedad menor. Canaletas funcionales. Oxidación mínima.",
        3: "Ventanas con sellos deteriorados. Canaletas con obstrucciones parciales. Oxidación visible.",
        2: "Vidrios rotos o faltantes. Canaletas dañadas que generan humedades. Corrosión avanzada.",
        1: "Ventanería severamente dañada. Drenaje inoperante. Elementos con riesgo de desprendimiento."
      }},
      { id: "aspecto", name: "Limpieza y Aspecto General", descriptors: {
        5: "Fachada impecable. Sin telarañas, nidos ni manchas de agua. Aspecto institucional impecable.",
        4: "Fachada limpia con suciedad menor en zonas poco visibles.",
        3: "Suciedad acumulada visible. Telarañas en esquinas. Manchas de agua en zonas bajas.",
        2: "Fachada visiblemente sucia. Moho o algas en zonas húmedas. Aspecto descuidado.",
        1: "Fachada extremadamente sucia. Crecimiento vegetal invasivo. Impacto negativo en imagen."
      }}
    ]
  },
  {
    id: "cancha", name: "Cancha Deportiva", icon: "⚽",
    dimensions: [
      { id: "superficie", name: "Superficie de Juego", descriptors: {
        5: "Superficie en excelente estado. Demarcación completa y visible. Nivelación perfecta.",
        4: "Superficie en buen estado. Desgaste menor en zonas de alto tráfico. Demarcación legible.",
        3: "Desgaste moderado. Parches irregulares o fisuras menores. Demarcación parcialmente borrada.",
        2: "Superficie deteriorada (huecos, grietas extensas). Demarcación ilegible. Charcos tras lluvia.",
        1: "Superficie inutilizable. Riesgo de lesiones por irregularidades graves. Sin demarcación."
      }},
      { id: "equipamiento", name: "Equipamiento Deportivo", descriptors: {
        5: "Arcos, mallas, tableros y postes completos, firmes y en excelente estado. Graderías seguras.",
        4: "Equipamiento completo y funcional con desgaste menor. Graderías en buen estado.",
        3: "Equipamiento funcional con detalles (mallas rotas parcialmente, tableros desgastados).",
        2: "Equipamiento incompleto o dañado (arcos sin malla, tableros rotos). Graderías con daños.",
        1: "Sin equipamiento o completamente inservible. Graderías inseguras."
      }},
      { id: "ilum_drenaje", name: "Iluminación, Drenaje y Servicios", descriptors: {
        5: "Iluminación nocturna completa. Drenaje eficiente. Bebederos y baños cercanos.",
        4: "Iluminación funcional. Drenaje adecuado. Servicios complementarios disponibles.",
        3: "Iluminación parcial. Drenaje lento pero funcional. Servicios limitados.",
        2: "Iluminación insuficiente para uso nocturno. Encharcamientos frecuentes. Sin servicios.",
        1: "Sin iluminación. Sin drenaje (inundación frecuente). Sin servicios."
      }},
      { id: "seguridad_cerr", name: "Seguridad y Cerramientos", descriptors: {
        5: "Cerramientos/mallas perimetrales completos e íntegros. Superficie libre de objetos peligrosos.",
        4: "Cerramientos en buen estado con reparaciones menores. Espacio seguro.",
        3: "Cerramientos con daños parciales (huecos en mallas). Algunos objetos por retirar.",
        2: "Cerramientos significativamente dañados. Elementos peligrosos cerca del área de juego.",
        1: "Sin cerramientos donde se requieren. Riesgo alto de lesiones."
      }}
    ]
  },
  {
    id: "jardin", name: "Jardín / Zona Verde", icon: "🌳",
    dimensions: [
      { id: "vegetacion", name: "Estado de la Vegetación", descriptors: {
        5: "Grama cortada uniformemente. Árboles y arbustos podados. Plantas ornamentales saludables.",
        4: "Vegetación cuidada con mantenimiento reciente. Grama uniforme. Árboles saludables.",
        3: "Grama irregular (requiere corte). Arbustos con crecimiento excesivo. Estrés hídrico.",
        2: "Grama muy crecida o con zonas secas extensas. Ramas secas sin podar. Plantas muertas.",
        1: "Vegetación abandonada. Maleza invasiva. Árboles con riesgo de caída. Descuido total."
      }},
      { id: "mobiliario_ext", name: "Mobiliario Exterior y Senderos", descriptors: {
        5: "Bancas y mesas en excelente estado. Senderos bien pavimentados y nivelados. Pérgolas funcionales.",
        4: "Mobiliario en buen estado con desgaste menor. Senderos transitables sin obstáculos.",
        3: "Algunos muebles deteriorados. Senderos con irregularidades menores (baldosas sueltas).",
        2: "Mobiliario roto o vandalizado. Senderos con huecos o adoquines levantados. Riesgo de tropiezo.",
        1: "Sin mobiliario funcional. Senderos intransitables. Charcos permanentes."
      }},
      { id: "limpieza_riego", name: "Limpieza y Riego", descriptors: {
        5: "Espacios limpios. Sin basura. Papeleras disponibles y vacías. Riego funcional y programado.",
        4: "Limpieza adecuada. Papeleras disponibles. Riego regular.",
        3: "Basura ocasional. Papeleras llenas. Riego irregular.",
        2: "Basura acumulada. Papeleras desbordadas o ausentes. Zonas secas por falta de riego.",
        1: "Espacio usado como basurero informal. Sin papeleras. Vegetación muerta por falta de riego."
      }},
      { id: "ilum_seg", name: "Iluminación y Seguridad", descriptors: {
        5: "Iluminación peatonal completa. Cámaras de seguridad visibles. Senderos delimitados.",
        4: "Iluminación adecuada en rutas principales. Seguridad visible.",
        3: "Iluminación parcial (zonas oscuras en senderos secundarios). Seguridad variable.",
        2: "Iluminación insuficiente. Zonas aisladas sin vigilancia. Sensación de inseguridad.",
        1: "Sin iluminación funcional. Zona percibida como insegura."
      }}
    ]
  },
  {
    id: "acceso", name: "Entrada / Salida / Acceso", icon: "🚪",
    dimensions: [
      { id: "estado_fisico", name: "Estado Físico de la Infraestructura", descriptors: {
        5: "Puertas, portones, torniquetes y barreras en perfecto estado. Pisos antideslizantes. Techado adecuado.",
        4: "Infraestructura en buen estado. Desgaste menor en elementos de alto uso.",
        3: "Elementos funcionales con desgaste visible. Techado parcial. Pisos con irregularidades menores.",
        2: "Puertas/portones con dificultad de operación. Torniquetes averiados. Pisos resbalosos.",
        1: "Infraestructura severamente dañada o inoperable. Riesgo de caídas o atrapamiento."
      }},
      { id: "control_acceso", name: "Control de Acceso y Seguridad", descriptors: {
        5: "Sistema electrónico funcional (carnet, biometría). Personal de seguridad. Cámaras operativas.",
        4: "Control funcional con fallas esporádicas. Seguridad en horarios principales.",
        3: "Control intermitente. Cobertura parcial. Cámaras con ángulos limitados.",
        2: "Control frecuentemente inoperante. Seguridad insuficiente. Acceso sin verificación.",
        1: "Sin control de acceso funcional. Sin seguridad. Acceso libre e incontrolado."
      }},
      { id: "senalizacion_flujo", name: "Señalización y Flujo", descriptors: {
        5: "Señalización clara de entrada/salida vehicular y peatonal. Reductores funcionales.",
        4: "Señalización adecuada. Separación clara de flujos.",
        3: "Señalización parcial. Conflictos menores entre peatones y vehículos.",
        2: "Señalización confusa o ausente. Conflictos frecuentes peatón-vehículo.",
        1: "Sin señalización. Mezcla peligrosa de flujos. Riesgo de accidentes."
      }},
      { id: "accesibilidad", name: "Accesibilidad Universal", descriptors: {
        5: "Rampas ≤8%. Pisos podotáctiles. Ancho para sillas de ruedas. Señalización inclusiva.",
        4: "Accesibilidad adecuada con detalles menores.",
        3: "Rampas presentes pero con pendiente pronunciada o desgaste. Accesibilidad parcial.",
        2: "Accesibilidad limitada. Rampas insuficientes. Barreras para personas con discapacidad.",
        1: "Sin consideraciones de accesibilidad. Imposible el acceso para movilidad reducida."
      }}
    ]
  },
  {
    id: "parqueadero", name: "Parqueadero", icon: "🅿️",
    dimensions: [
      { id: "superficie_dem", name: "Superficie y Demarcación", descriptors: {
        5: "Pavimento excelente. Demarcación completa y visible. Topes presentes.",
        4: "Pavimento en buen estado. Demarcación legible con desgaste menor.",
        3: "Pavimento con fisuras menores. Demarcación parcialmente borrada.",
        2: "Pavimento deteriorado con huecos. Demarcación ilegible. Charcos frecuentes.",
        1: "Pavimento severamente dañado. Sin demarcación. Riesgo de daño a vehículos."
      }},
      { id: "ilum_seg", name: "Iluminación y Seguridad", descriptors: {
        5: "Iluminación completa. Cámaras con cobertura total. Personal de vigilancia.",
        4: "Iluminación adecuada. Cámaras funcionales. Vigilancia regular.",
        3: "Iluminación parcial. Cámaras con cobertura limitada. Vigilancia intermitente.",
        2: "Iluminación deficiente. Pocas cámaras. Sin vigilancia regular.",
        1: "Sin iluminación nocturna. Sin cámaras ni vigilancia. Zona de alto riesgo."
      }},
      { id: "senal_circ", name: "Señalización y Circulación", descriptors: {
        5: "Señales de dirección, velocidad y pasos peatonales claros. Reductores de velocidad.",
        4: "Señalización funcional. Circulación organizada. Pasos peatonales visibles.",
        3: "Señalización parcial. Circulación funcional con confusión.",
        2: "Señalización insuficiente. Circulación confusa. Conflictos peatón-vehículo.",
        1: "Sin señalización. Circulación caótica. Riesgo elevado de accidentes."
      }},
      { id: "techado_dren", name: "Techado, Drenaje y Servicios", descriptors: {
        5: "Techos sin goteras. Drenaje eficiente. Bicicleteros seguros. Zonas accesibles señalizadas.",
        4: "Techado funcional. Drenaje adecuado. Servicios disponibles.",
        3: "Techado con goteras menores. Drenaje lento. Bicicleteros insuficientes.",
        2: "Techado dañado. Encharcamientos frecuentes. Sin bicicleteros.",
        1: "Techado colapsado. Inundaciones recurrentes. Sin servicios ni accesibilidad."
      }}
    ]
  },
  {
    id: "bano", name: "Baño", icon: "🚻",
    dimensions: [
      { id: "aparatos", name: "Aparatos Sanitarios", descriptors: {
        5: "Sanitarios, lavamanos y orinales completos y funcionando. Sin fugas. Grifería perfecta.",
        4: "Aparatos funcionales con desgaste menor. Sin fugas significativas.",
        3: "Algunos aparatos intermitentes. Un aparato fuera de servicio.",
        2: "Varios aparatos fuera de servicio. Fugas visibles. Grifería deteriorada.",
        1: "Mayoría inoperativos. Fugas graves. Condiciones insalubres."
      }},
      { id: "limpieza_hig", name: "Limpieza e Higiene", descriptors: {
        5: "Impecable. Olor neutro. Pisos secos. Jabón, papel higiénico y papel manos llenos.",
        4: "Limpio. Olor aceptable. Suministros disponibles (>50%).",
        3: "Limpieza aceptable. Olor leve. Dispensadores parcialmente vacíos.",
        2: "Suciedad visible. Mal olor. Dispensadores vacíos. Pisos mojados.",
        1: "Condiciones antihigiénicas. Olor nauseabundo. Sin suministros. Plagas."
      }},
      { id: "infraestructura", name: "Infraestructura y Acabados", descriptors: {
        5: "Divisiones íntegras con cerraduras funcionales. Pisos y paredes perfectos. Ventilación adecuada.",
        4: "Divisiones y cerraduras funcionales. Acabados en buen estado.",
        3: "Algunas cerraduras dañadas. Desgaste en paredes. Ventilación limitada.",
        2: "Divisiones dañadas. Varias cerraduras rotas. Humedad en paredes.",
        1: "Divisiones destruidas. Sin privacidad. Daño severo. Moho visible."
      }},
      { id: "accesibilidad", name: "Accesibilidad", descriptors: {
        5: "Baño accesible con barras de apoyo, espacio para silla de ruedas, lavamanos adaptado.",
        4: "Baño accesible funcional con detalles menores.",
        3: "Baño accesible con deficiencias (barras flojas, espacio reducido).",
        2: "Baño accesible inoperativo o con barreras significativas.",
        1: "Sin baño accesible disponible. Incumplimiento normativo."
      }}
    ]
  },
  {
    id: "pasillo", name: "Pasillo / Escalera / Área Común", icon: "🏛️",
    dimensions: [
      { id: "pisos", name: "Pisos y Superficies", descriptors: {
        5: "Pisos impecables, nivelados y antideslizantes. Escaleras con cintas. Barandas firmes.",
        4: "Pisos en buen estado. Escaleras seguras. Barandas funcionales.",
        3: "Pisos con desgaste. Baldosas sueltas. Cintas antideslizantes desgastadas.",
        2: "Pisos resbalosos o con huecos. Escaleras sin cintas. Barandas flojas.",
        1: "Pisos peligrosos. Escaleras inseguras (escalones rotos, sin baranda)."
      }},
      { id: "ilum_vent", name: "Iluminación y Ventilación", descriptors: {
        5: "Iluminación uniforme. Ventilación adecuada. Luces de emergencia funcionales.",
        4: "Iluminación adecuada. Ventilación aceptable. Luces de emergencia presentes.",
        3: "Iluminación parcial (zonas oscuras). Ventilación limitada.",
        2: "Iluminación deficiente. Escaleras oscuras. Mala ventilación.",
        1: "Sin iluminación en zonas de tránsito. Sin ventilación. Sin luces de emergencia."
      }},
      { id: "senal_emerg", name: "Señalización y Emergencias", descriptors: {
        5: "Rutas de evacuación completas e iluminadas. Extintores vigentes. Mapas de evacuación.",
        4: "Señalización de emergencia presente y legible. Extintores vigentes.",
        3: "Señalización parcial. Algunos extintores vencidos.",
        2: "Señalización ausente o ilegible. Extintores vencidos u obstruidos.",
        1: "Sin señalización de emergencia. Sin extintores. Rutas bloqueadas."
      }},
      { id: "ascensores", name: "Ascensores (si aplica)", descriptors: {
        5: "Ascensores funcionales, limpios, certificación vigente. Botones en braille.",
        4: "Ascensores funcionales con desgaste menor. Certificación vigente.",
        3: "Ascensores con fallas ocasionales. Cabina desgastada. Tiempos largos.",
        2: "Ascensores frecuentemente fuera de servicio. Certificación vencida.",
        1: "Ascensores inoperativos. Sin alternativa accesible."
      }}
    ]
  },
  {
    id: "cafeteria", name: "Cafetería / Zona de Alimentación", icon: "🍽️",
    dimensions: [
      { id: "infraestructura", name: "Infraestructura y Mobiliario", descriptors: {
        5: "Mesas y sillas excelentes, suficientes para la demanda. Pisos antideslizantes. Zonas diferenciadas.",
        4: "Mobiliario en buen estado con desgaste menor. Distribución funcional.",
        3: "Mobiliario con desgaste visible. Espacio ajustado en horas pico.",
        2: "Mobiliario dañado. Hacinamiento. Pisos resbalosos o deteriorados.",
        1: "Mobiliario inutilizable. Infraestructura riesgosa. Inaceptable para consumo de alimentos."
      }},
      { id: "higiene", name: "Higiene y Manipulación de Alimentos", descriptors: {
        5: "Manipuladores con dotación completa. Superficies impecables. Temperaturas adecuadas. Certificados visibles.",
        4: "Buenas prácticas observadas. Higiene adecuada. Certificados vigentes.",
        3: "Manipulación aceptable con falencias menores. Superficies con desgaste.",
        2: "Deficiencias notorias en manipulación. Superficies sucias. Alimentos sin protección.",
        1: "Condiciones antihigiénicas graves. Riesgo de ETA. Sin certificados."
      }},
      { id: "equipos_serv", name: "Equipos y Servicios", descriptors: {
        5: "Lavamanos con jabón y papel. Refrigeración/cocción perfectos. Punto de reciclaje visible.",
        4: "Equipos funcionales. Lavamanos disponible. Servicios presentes.",
        3: "Lavamanos sin suministros completos. Equipos con deficiencias menores.",
        2: "Sin lavamanos o inoperante. Equipos con fallas.",
        1: "Equipos inoperativos o peligrosos. Sin servicios. Incumple normativa."
      }},
      { id: "ventilacion_plagas", name: "Ventilación y Control de Plagas", descriptors: {
        5: "Ventilación adecuada sin olores. Control de plagas documentado y al día. Mallas protectoras.",
        4: "Ventilación funcional. Control de plagas con certificaciones al día.",
        3: "Ventilación limitada (olores en horas pico). Control vigente pero evidencia menor de insectos.",
        2: "Ventilación deficiente (olores persistentes). Insectos visibles. Control vencido.",
        1: "Sin ventilación. Presencia de roedores o infestación. Riesgo sanitario grave."
      }}
    ]
  },
  {
    id: "biblioteca", name: "Biblioteca / Sala de Estudio", icon: "📚",
    dimensions: [
      { id: "infraestructura", name: "Infraestructura y Mobiliario", descriptors: {
        5: "Mobiliario ergonómico excelente. Estantería sólida. Espacios diferenciados.",
        4: "Mobiliario en buen estado. Distribución funcional. Desgaste menor.",
        3: "Mobiliario funcional con desgaste. Estantería con deformaciones menores.",
        2: "Mobiliario deteriorado. Estanterías inestables. Insuficiente para la demanda.",
        1: "Mobiliario roto o inutilizable. Estantería con riesgo de colapso."
      }},
      { id: "colecciones", name: "Colecciones y Recursos", descriptors: {
        5: "Colección física y digital actualizada. Catálogo en línea funcional. Bases de datos accesibles.",
        4: "Colección adecuada con actualizaciones regulares. Catálogo funcional.",
        3: "Colección parcialmente desactualizada. Catálogo con inconsistencias.",
        2: "Colección desactualizada. Libros dañados o extraviados. Organización deficiente.",
        1: "Colección obsoleta. Sin catálogo funcional. Sin acceso a bases de datos."
      }},
      { id: "tecnologia", name: "Tecnología y Conectividad", descriptors: {
        5: "Computadores funcionales. WiFi rápido. Tomas eléctricas suficientes. Escáner e impresora.",
        4: "Tecnología funcional. Conectividad estable. Tomas adecuadas.",
        3: "Algunos computadores lentos. WiFi intermitente. Tomas insuficientes.",
        2: "Computadores obsoletos. WiFi deficiente. Pocas tomas funcionales.",
        1: "Sin computadores. Sin WiFi. Sin tomas eléctricas."
      }},
      { id: "ambiente", name: "Ambiente de Estudio", descriptors: {
        5: "Iluminación ≥500 lux. Climatización 22-24°C. Control acústico efectivo.",
        4: "Iluminación y climatización adecuadas. Ruido aceptable.",
        3: "Iluminación desigual. Climatización con variaciones. Ruido intermitente.",
        2: "Iluminación insuficiente. Climatización deficiente. Ruido constante.",
        1: "Condiciones ambientales inaceptables para estudio."
      }},
      { id: "senalizacion", name: "Señalización y Accesibilidad", descriptors: {
        5: "Señalización clara de secciones, normas y evacuación. Acceso universal. Horarios visibles.",
        4: "Señalización funcional. Accesibilidad adecuada con detalles menores.",
        3: "Señalización parcial. Accesibilidad limitada en algunas zonas.",
        2: "Señalización confusa o ausente. Barreras de accesibilidad significativas.",
        1: "Sin señalización. Sin accesibilidad para personas con discapacidad."
      }}
    ]
  },
  {
    id: "auditorio", name: "Auditorio / Sala de Eventos", icon: "🎭",
    dimensions: [
      { id: "estructura_asientos", name: "Estructura y Asientos", descriptors: {
        5: "Silletería excelente (tapizado íntegro, plegado funcional, numeración visible). Escenario sin daños.",
        4: "Silletería en buen estado con desgaste menor. Escenario funcional.",
        3: "Asientos con tapizado desgastado. Escenario con marcas de uso.",
        2: "Silletería dañada (asientos rotos, respaldos sueltos). Escenario con daños.",
        1: "Silletería inutilizable (>20%). Pisos peligrosos. Escenario inseguro."
      }},
      { id: "audiovisual", name: "Equipos Audiovisuales y Acústica", descriptors: {
        5: "Sonido profesional. Pantalla alta resolución. Micrófonos funcionales. Acústica tratada.",
        4: "Equipos funcionales con calidad adecuada. Acústica aceptable.",
        3: "Equipos con deficiencias menores (micrófono con ruido, brillo reducido). Eco leve.",
        2: "Equipos con fallas significativas (sonido distorsionado). Acústica deficiente.",
        1: "Equipos inoperativos. Acústica inaceptable. No apto para eventos."
      }},
      { id: "iluminacion", name: "Iluminación Escénica y General", descriptors: {
        5: "Iluminación regulable (dimmer). Iluminación escénica completa. Luces de emergencia. Control centralizado.",
        4: "Iluminación funcional con regulación. Luces de emergencia presentes.",
        3: "Iluminación general sin regulación. Escénica básica.",
        2: "Iluminación insuficiente o sin regulación. Sin escénica.",
        1: "Iluminación deficiente que impide eventos. Sin luces de emergencia."
      }},
      { id: "clima_servicios", name: "Climatización y Servicios", descriptors: {
        5: "Climatización silenciosa para aforo completo. Baños cercanos. Accesibilidad completa.",
        4: "Climatización adecuada. Servicios disponibles. Accesibilidad funcional.",
        3: "Climatización insuficiente con aforo completo. Baños distantes.",
        2: "Climatización deficiente o ruidosa. Servicios limitados.",
        1: "Sin climatización. Sin servicios. Sin accesibilidad."
      }}
    ]
  },
  {
    id: "cuarto_tecnico", name: "Cuarto Técnico / Área de Servicio", icon: "⚙️",
    dimensions: [
      { id: "orden", name: "Orden y Organización", descriptors: {
        5: "Espacio ordenado y limpio. Equipos inventariados. Circulación libre. Estantería rotulada.",
        4: "Orden adecuado. Materiales organizados. Circulación libre.",
        3: "Orden parcial. Algunos materiales sin organizar. Circulación con restricciones.",
        2: "Desorden significativo. Materiales acumulados sin criterio. Circulación difícil.",
        1: "Completamente desordenado. Imposible circular. Acumulación riesgosa."
      }},
      { id: "seguridad_elec", name: "Seguridad e Instalaciones Eléctricas", descriptors: {
        5: "Tableros cerrados y rotulados con diagramas unifilares. Puesta a tierra funcional. Extintor adecuado.",
        4: "Instalaciones en buen estado y rotuladas. Seguridad vigente.",
        3: "Tableros cerrados pero rotulación incompleta. Extintor próximo a vencer.",
        2: "Tableros abiertos o sin tapa. Cables expuestos. Extintor vencido o ausente.",
        1: "Instalaciones peligrosas. Riesgo de electrocución/incendio. Sin extintor."
      }},
      { id: "ventilacion_ctrl", name: "Ventilación y Control Ambiental", descriptors: {
        5: "Ventilación adecuada. Temperatura controlada. Sin humedad excesiva. Detección de incendios funcional.",
        4: "Ventilación funcional. Temperatura aceptable. Detectores presentes.",
        3: "Ventilación limitada. Temperatura elevada sin riesgo inmediato.",
        2: "Ventilación insuficiente. Humedad que afecta equipos. Detectores inoperativos.",
        1: "Sin ventilación. Temperatura extrema. Moho activo. Sin detección de incendios."
      }},
      { id: "senal_acceso", name: "Señalización y Acceso Restringido", descriptors: {
        5: "Puerta con cerradura/control de acceso. Señalización de peligro visible. Registro de ingreso.",
        4: "Acceso controlado. Señalización presente. Registro funcional.",
        3: "Puerta con cerradura pero sin registro. Señalización parcial.",
        2: "Puerta sin cerradura o frecuentemente abierta. Sin señalización.",
        1: "Acceso libre a zona de alto riesgo. Sin señalización. Sin controles."
      }}
    ]
  }
];

const CLASSIFICATIONS = [
  { min: 4.5, max: 5.0, label: "Excelente", color: "#22c55e", emoji: "🟢", action: "Mantener mantenimiento preventivo." },
  { min: 3.5, max: 4.49, label: "Bueno", color: "#3b82f6", emoji: "🔵", action: "Programar mantenimiento preventivo." },
  { min: 2.5, max: 3.49, label: "Aceptable", color: "#eab308", emoji: "🟡", action: "Mantenimiento correctivo (1-3 meses)." },
  { min: 1.5, max: 2.49, label: "Deficiente", color: "#f97316", emoji: "🟠", action: "Intervención prioritaria (1-4 semanas)." },
  { min: 1.0, max: 1.49, label: "Crítico", color: "#ef4444", emoji: "🔴", action: "Intervención inmediata (1-7 días)." }
];

function getClassification(score) {
  if (score === null || isNaN(score)) return null;
  for (const c of CLASSIFICATIONS) {
    if (score >= c.min && score <= c.max) return c;
  }
  return CLASSIFICATIONS[CLASSIFICATIONS.length - 1];
}
