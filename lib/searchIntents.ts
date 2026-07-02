const SEARCH_INTENTS = [
  {
    trade: 'plomero',
    aliases: [
      'plomero',
      'plomeria',
      'fontanero',
      'fuga',
      'fuga de agua',
      'gotera',
      'tuberia',
      'tuberias',
      'drenaje',
      'destapar',
      'destapado',
      'bano',
      'wc',
      'sanitario',
      'lavabo',
      'regadera',
      'tinaco',
      'cisterna',
      'calentador',
      'llave de agua',
      'humedad por agua'
    ]
  },
  {
    trade: 'electricista',
    aliases: [
      'electricista',
      'electricidad',
      'electrico',
      'electrica',
      'falla electrica',
      'corto',
      'corto circuito',
      'apagones',
      'sin luz',
      'luz',
      'contacto',
      'contactos',
      'enchufe',
      'apagador',
      'cableado',
      'instalacion electrica',
      'lampara',
      'pastilla',
      'breaker',
      'centro de carga'
    ]
  },
  {
    trade: 'pintor',
    aliases: [
      'pintor',
      'pintura',
      'pintar',
      'pinta casas',
      'pintor de casas',
      'quien pinta casas',
      'pintar casa',
      'pintar cuarto',
      'pintar pared',
      'paredes',
      'muros',
      'fachada',
      'interiores',
      'exteriores',
      'resanar pintura'
    ]
  },
  {
    trade: 'impermeabilizador',
    aliases: [
      'impermeabilizador',
      'impermeabilizacion',
      'impermeabilizar',
      'impermeable',
      'filtracion',
      'filtraciones',
      'gotera en techo',
      'techo con gotera',
      'azotea',
      'humedad en techo',
      'sellar techo'
    ]
  },
  {
    trade: 'albanil',
    aliases: [
      'albanil',
      'albanileria',
      'construccion',
      'remodelacion',
      'obra',
      'cemento',
      'losa',
      'tabique',
      'barda',
      'aplanado',
      'yeso',
      'acabados'
    ]
  },
  {
    trade: 'carpintero',
    aliases: [
      'carpintero',
      'carpinteria',
      'mueble',
      'muebles',
      'puerta',
      'puertas',
      'closet',
      'cocina integral',
      'reparar madera',
      'madera'
    ]
  },
  {
    trade: 'herrero',
    aliases: [
      'herrero',
      'herreria',
      'reja',
      'rejas',
      'porton',
      'barandal',
      'soldar',
      'estructura metalica'
    ]
  },
  {
    trade: 'mecanico',
    aliases: [
      'mecanico',
      'mecanica',
      'auto',
      'carro',
      'coche',
      'motor',
      'frenos',
      'afinacion'
    ]
  },
  {
    trade: 'jardinero',
    aliases: [
      'jardinero',
      'jardineria',
      'pasto',
      'podar',
      'poda',
      'jardin',
      'plantas'
    ]
  },
  {
    trade: 'cerrajero',
    aliases: ['cerrajero', 'cerrajeria', 'cerradura', 'abrir puerta', 'cambiar chapa', 'perdi mis llaves', 'duplicado de llaves']
  },
  {
    trade: 'fumigador',
    aliases: ['fumigador', 'fumigacion', 'fumigar', 'plagas', 'cucarachas', 'hormigas', 'termitas', 'control de plagas']
  },
  {
    trade: 'tecnico_ac',
    aliases: ['tecnico de aire acondicionado', 'aire acondicionado', 'clima', 'minisplit', 'instalar minisplit', 'reparar clima', 'tecnico ac']
  },
  {
    trade: 'vidriero',
    aliases: ['vidriero', 'vidrieria', 'vidrio', 'cristal', 'ventana rota', 'cancel de bano', 'espejo']
  },
  {
    trade: 'tapicero',
    aliases: ['tapicero', 'tapiceria', 'tapizar', 'retapizar', 'sillon', 'silla', 'muebles tapizados']
  },
  {
    trade: 'costurera',
    aliases: ['costurera', 'sastre', 'costura', 'arreglar ropa', 'ajuste de ropa', 'dobladillo', 'confeccion']
  },
  {
    trade: 'estilista_canino',
    aliases: ['estilista canino', 'peluqueria canina', 'bano para perro', 'corte para perro', 'estetica canina', 'grooming']
  },
  {
    trade: 'pisos',
    aliases: ['colocador de pisos', 'poner piso', 'instalar piso', 'loseta', 'azulejo', 'piso laminado', 'piso ceramico']
  },
  {
    trade: 'tablaroquero',
    aliases: ['tablaroquero', 'tablaroca', 'muro de tablaroca', 'plafon', 'panel de yeso', 'drywall']
  },
  {
    trade: 'tecnico_celulares',
    aliases: ['tecnico de celulares', 'reparar celular', 'celular roto', 'pantalla de celular', 'telefono movil', 'smartphone']
  },
  {
    trade: 'tecnico_pc',
    aliases: ['tecnico de pc', 'reparar computadora', 'computadora lenta', 'laptop', 'soporte tecnico', 'formatear computadora', 'reparacion de pc']
  },
  {
    trade: 'fletes',
    aliases: ['fletes', 'mudanza', 'mudanzas', 'mover muebles', 'camion de carga', 'transporte de muebles']
  },
  {
    trade: 'limpieza',
    aliases: ['personal de limpieza', 'limpieza', 'limpiar casa', 'aseo de casa', 'limpieza profunda', 'limpieza de oficina']
  },
  {
    trade: 'lavado_salas',
    aliases: ['lavado de salas', 'lavar sala', 'limpiar sillon', 'lavado de colchones', 'limpieza de tapiceria']
  },
  {
    trade: 'cocinero',
    aliases: ['cocinero', 'chef', 'comida para evento', 'cocinar', 'servicio de comida', 'banquete']
  },
  {
    trade: 'repostero',
    aliases: ['repostero', 'reposteria', 'pastel', 'pasteles', 'postres', 'mesa de postres']
  },
  {
    trade: 'mesero',
    aliases: ['mesero', 'meseros', 'servicio de meseros', 'mesero para evento', 'atencion de evento']
  },
  {
    trade: 'fotografo',
    aliases: ['fotografo', 'fotografia', 'fotos', 'sesion de fotos', 'fotografo para evento', 'video de evento']
  },
  {
    trade: 'albercas',
    aliases: ['mantenimiento de albercas', 'limpiar alberca', 'alberca', 'piscina', 'cloro para alberca', 'reparar alberca']
  },
  {
    trade: 'soldador',
    aliases: ['soldador', 'soldadura', 'soldar', 'reparar metal', 'estructura metalica']
  },
  {
    trade: 'vulcanizador',
    aliases: ['vulcanizador', 'vulcanizadora', 'ponchadura', 'llanta ponchada', 'reparar llanta', 'parchar llanta']
  },
  {
    trade: 'lavado_autos',
    aliases: ['lavado de autos', 'lavar carro', 'lavar coche', 'autolavado', 'detallado automotriz', 'limpieza de auto']
  },
  {
    trade: 'chofer',
    aliases: ['chofer', 'chofer privado', 'conductor', 'traslado privado', 'llevar personas', 'servicio de chofer']
  },
  {
    trade: 'enfermeria',
    aliases: ['enfermeria', 'enfermera', 'enfermero', 'cuidador de paciente', 'inyecciones', 'curaciones', 'cuidado a domicilio']
  },
  {
    trade: 'maquillista',
    aliases: ['maquillista', 'maquillaje', 'maquillaje para evento', 'maquillaje de novia', 'peinado y maquillaje']
  },
  {
    trade: 'barbero',
    aliases: ['barbero', 'barberia', 'corte de cabello', 'corte para hombre', 'arreglo de barba', 'afeitado']
  },
  {
    trade: 'masajista',
    aliases: ['masajista', 'masaje', 'masaje relajante', 'masaje terapeutico', 'dolor muscular']
  },
  {
    trade: 'entrenador',
    aliases: ['entrenador personal', 'entrenador', 'personal trainer', 'ejercicio', 'rutina de gimnasio', 'acondicionamiento fisico']
  },
  {
    trade: 'tutor',
    aliases: ['tutor', 'clases particulares', 'maestro particular', 'regularizacion', 'asesoria escolar', 'ayuda con tarea']
  }
];

export const normalizeSearchText = (value: string) => value
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9\s]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const SEARCH_STOP_WORDS = new Set([
  'a', 'al', 'de', 'del', 'el', 'en', 'la', 'las', 'los', 'mi', 'para', 'por',
  'que', 'quien', 'se', 'un', 'una', 'y'
]);

const getMeaningfulWords = (value: string) => normalizeSearchText(value)
  .split(' ')
  .filter(word => word && !SEARCH_STOP_WORDS.has(word));

const editDistance = (left: string, right: string) => {
  const previous = Array.from({ length: right.length + 1 }, (_, index) => index);

  for (let leftIndex = 1; leftIndex <= left.length; leftIndex += 1) {
    let diagonal = previous[0];
    previous[0] = leftIndex;

    for (let rightIndex = 1; rightIndex <= right.length; rightIndex += 1) {
      const above = previous[rightIndex];
      const substitutionCost = left[leftIndex - 1] === right[rightIndex - 1] ? 0 : 1;
      previous[rightIndex] = Math.min(
        previous[rightIndex] + 1,
        previous[rightIndex - 1] + 1,
        diagonal + substitutionCost
      );
      diagonal = above;
    }
  }

  return previous[right.length];
};

const wordsApproximatelyMatch = (left: string, right: string) => {
  if (left === right) return true;
  if (left.length <= 3 || right.length <= 3) return false;
  const allowedDistance = Math.max(left.length, right.length) >= 8 ? 2 : 1;
  return editDistance(left, right) <= allowedDistance;
};

const queryMatchesAlias = (query: string, alias: string) => {
  const normalizedQuery = normalizeSearchText(query);
  const normalizedAlias = normalizeSearchText(alias);
  if (normalizedQuery.includes(normalizedAlias)) return true;

  const queryWords = getMeaningfulWords(normalizedQuery);
  const aliasWords = getMeaningfulWords(normalizedAlias);
  if (queryWords.length === 0 || aliasWords.length === 0) return false;

  return aliasWords.every(aliasWord => (
    queryWords.some(queryWord => wordsApproximatelyMatch(queryWord, aliasWord))
  ));
};

export const getSearchIntentTrades = (query: string) => {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return [];

  return SEARCH_INTENTS
    .filter(({ aliases }) => aliases.some(alias => queryMatchesAlias(normalizedQuery, alias)))
    .map(({ trade }) => trade);
};

export const matchesSearchIntent = (query: string, searchableText: string) => {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return true;

  const intentTrades = getSearchIntentTrades(normalizedQuery);
  const normalizedText = normalizeSearchText(searchableText);

  if (intentTrades.length > 0) {
    return SEARCH_INTENTS.some(({ trade, aliases }) => (
      intentTrades.includes(trade) &&
      aliases.some(alias => normalizedText.includes(normalizeSearchText(alias)))
    ));
  }

  return normalizedText.includes(normalizedQuery);
};
