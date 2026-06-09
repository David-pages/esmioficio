
import { LocationData, Professional, TradeCategory } from './types';

export const MEXICO_LOCATIONS: LocationData[] = [
  {
    id: 'aguascalientes',
    name: 'Aguascalientes',
    municipalities: [
      { id: 'ags_capital', name: 'Aguascalientes' }, { id: 'asientos', name: 'Asientos' }, { id: 'calvillo', name: 'Calvillo' }, { id: 'cosio', name: 'Cosío' }, { id: 'jesus_maria', name: 'Jesús María' }, { id: 'pabellon', name: 'Pabellón de Arteaga' }, { id: 'rincon', name: 'Rincón de Romos' }, { id: 'san_jose_gracia', name: 'San José de Gracia' }, { id: 'tepezala', name: 'Tepezalá' }, { id: 'el_llano', name: 'El Llano' }, { id: 'san_fco_romo', name: 'San Francisco de los Romo' }
    ]
  },
  {
    id: 'baja_california',
    name: 'Baja California',
    municipalities: [
      { id: 'ensenada', name: 'Ensenada' }, { id: 'mexicali', name: 'Mexicali' }, { id: 'tecate', name: 'Tecate' }, { id: 'tijuana', name: 'Tijuana' }, { id: 'playas_rosarito', name: 'Playas de Rosarito' }, { id: 'san_quintin', name: 'San Quintín' }, { id: 'san_felipe', name: 'San Felipe' }
    ]
  },
  {
    id: 'baja_california_sur',
    name: 'Baja California Sur',
    municipalities: [
      { id: 'comondu', name: 'Comondú' }, { id: 'mulege', name: 'Mulegé' }, { id: 'la_paz', name: 'La Paz' }, { id: 'los_cabos', name: 'Los Cabos' }, { id: 'loreto', name: 'Loreto' }
    ]
  },
  {
    id: 'campeche',
    name: 'Campeche',
    municipalities: [
      { id: 'calakmul', name: 'Calakmul' }, { id: 'calkini', name: 'Calkiní' }, { id: 'campeche_cap', name: 'Campeche' }, { id: 'candelaria', name: 'Candelaria' }, { id: 'carmen', name: 'Carmen' }, { id: 'champoton', name: 'Champotón' }, { id: 'hecelchakan', name: 'Hecelchakán' }, { id: 'hopelchen', name: 'Hopelchén' }, { id: 'palizada', name: 'Palizada' }, { id: 'tenabo', name: 'Tenabo' }, { id: 'escarcega', name: 'Escárcega' }
    ]
  },
  {
    id: 'chiapas',
    name: 'Chiapas',
    municipalities: [
      { id: 'tuxtla_gz', name: 'Tuxtla Gutiérrez' }, { id: 'tapachula', name: 'Tapachula' }, { id: 'san_cristobal', name: 'San Cristóbal de las Casas' }, { id: 'comitan', name: 'Comitán de Domínguez' }, { id: 'palenque', name: 'Palenque' }, { id: 'chiapa_corzo', name: 'Chiapa de Corzo' }, { id: 'tonala', name: 'Tonalá' }, { id: 'huixtla', name: 'Huixtla' }, { id: 'villaflores', name: 'Villaflores' }, { id: 'pijijiapan', name: 'Pijijiapan' }
    ]
  },
  {
    id: 'chihuahua',
    name: 'Chihuahua',
    municipalities: [
      { id: 'chih_cap', name: 'Chihuahua' }, { id: 'cd_juarez', name: 'Ciudad Juárez' }, { id: 'delicias', name: 'Delicias' }, { id: 'cuauhtemoc', name: 'Cuauhtémoc' }, { id: 'parral', name: 'Parral' }, { id: 'nuevo_casas_grandes', name: 'Nuevo Casas Grandes' }, { id: 'camargo', name: 'Camargo' }, { id: 'jimenez', name: 'Jiménez' }, { id: 'meoqui', name: 'Meoqui' }, { id: 'ojinaga', name: 'Ojinaga' }
    ]
  },
  {
    id: 'cdmx',
    name: 'Ciudad de México',
    municipalities: [
      { id: 'alvaro_obregon', name: 'Álvaro Obregón' }, { id: 'azcapotzalco', name: 'Azcapotzalco' }, { id: 'benito_juarez', name: 'Benito Juárez' }, { id: 'coyoacan', name: 'Coyoacán' }, { id: 'cuajimalpa', name: 'Cuajimalpa de Morelos' }, { id: 'cuauhtemoc_cdmx', name: 'Cuauhtémoc' }, { id: 'gustavo_madero', name: 'Gustavo A. Madero' }, { id: 'iztacalco', name: 'Iztacalco' }, { id: 'iztapalapa', name: 'Iztapalapa' }, { id: 'magdalena_contreras', name: 'Magdalena Contreras' }, { id: 'miguel_hidalgo', name: 'Miguel Hidalgo' }, { id: 'milpa_alta', name: 'Milpa Alta' }, { id: 'tlahuac', name: 'Tláhuac' }, { id: 'tlalpan', name: 'Tlalpan' }, { id: 'venustiano_carranza', name: 'Venustiano Carranza' }, { id: 'xochimilco', name: 'Xochimilco' }
    ]
  },
  {
    id: 'coahuila',
    name: 'Coahuila',
    municipalities: [
      { id: 'saltillo', name: 'Saltillo' }, { id: 'torreon', name: 'Torreón' }, { id: 'monclova', name: 'Monclova' }, { id: 'piedras_negras', name: 'Piedras Negras' }, { id: 'acuña', name: 'Acuña' }, { id: 'matamoros_coah', name: 'Matamoros' }, { id: 'san_pedro_coah', name: 'San Pedro' }, { id: 'sabinas', name: 'Sabinas' }, { id: 'ramos_arizpe', name: 'Ramos Arizpe' }, { id: 'frontera', name: 'Frontera' }
    ]
  },
  {
    id: 'colima',
    name: 'Colima',
    municipalities: [
      { id: 'colima_cap', name: 'Colima' }, { id: 'manzanillo', name: 'Manzanillo' }, { id: 'tecoman', name: 'Tecomán' }, { id: 'villa_alvarez', name: 'Villa de Álvarez' }, { id: 'armeria', name: 'Armería' }, { id: 'comala', name: 'Comala' }, { id: 'cuauhtemoc_col', name: 'Cuauhtémoc' }, { id: 'coquimatlan', name: 'Coquimatlán' }, { id: 'ixtlahuacan', name: 'Ixtlahuacán' }, { id: 'minatitlan', name: 'Minatitlán' }
    ]
  },
  {
    id: 'durango',
    name: 'Durango',
    municipalities: [
      { id: 'dgo_cap', name: 'Durango' }, { id: 'gomez_palacio', name: 'Gómez Palacio' }, { id: 'lerdo', name: 'Lerdo' }, { id: 'pueblo_nuevo', name: 'Pueblo Nuevo' }, { id: 'santiago_papasquiaro', name: 'Santiago Papasquiaro' }, { id: 'guadalupe_victoria', name: 'Guadalupe Victoria' }, { id: 'cuencame', name: 'Cuencamé' }, { id: 'canatlan', name: 'Canatlán' }, { id: 'vicente_guerrero', name: 'Vicente Guerrero' }, { id: 'tlahualilo', name: 'Tlahualilo' }
    ]
  },
  {
    id: 'guanajuato',
    name: 'Guanajuato',
    municipalities: [
      { id: 'leon', name: 'León' }, { id: 'irapuato', name: 'Irapuato' }, { id: 'celaya', name: 'Celaya' }, { id: 'salamanca', name: 'Salamanca' }, { id: 'gto_cap', name: 'Guanajuato' }, { id: 'silao', name: 'Silao' }, { id: 'san_miguel_allende', name: 'San Miguel de Allende' }, { id: 'dolores_hidalgo', name: 'Dolores Hidalgo' }, { id: 'valle_santiago', name: 'Valle de Santiago' }, { id: 'san_fco_rincon', name: 'San Francisco del Rincón' }
    ]
  },
  {
    id: 'guerrero',
    name: 'Guerrero',
    municipalities: [
      { id: 'acapulco', name: 'Acapulco de Juárez' }, { id: 'chilpancingo', name: 'Chilpancingo de los Bravo' }, { id: 'iguala', name: 'Iguala de la Independencia' }, { id: 'zihuatanejo', name: 'Zihuatanejo de Azueta' }, { id: 'taxco', name: 'Taxco de Alarcón' }, { id: 'tlapa', name: 'Tlapa de Comonfort' }, { id: 'chilapa', name: 'Chilapa de Álvarez' }, { id: 'punta_chica', name: 'Ometepec' }, { id: 'tixtla', name: 'Tixtla de Guerrero' }, { id: 'arcelia', name: 'Arcelia' }
    ]
  },
  {
    id: 'hidalgo',
    name: 'Hidalgo',
    municipalities: [
      { id: 'pachuca', name: 'Pachuca de Soto' }, { id: 'tulancingo', name: 'Tulancingo de Bravo' }, { id: 'tizayuca', name: 'Tizayuca' }, { id: 'tula', name: 'Tula de Allende' }, { id: 'huejutla', name: 'Huejutla de Reyes' }, { id: 'ixmiquilpan', name: 'Ixmiquilpan' }, { id: 'tepeji', name: 'Tepeji del Río' }, { id: 'actopan', name: 'Actopan' }, { id: 'tepeapulco', name: 'Tepeapulco' }, { id: 'zampoala', name: 'Zempoala' }
    ]
  },
  {
    id: 'jalisco',
    name: 'Jalisco',
    municipalities: [
      { id: 'guadalajara', name: 'Guadalajara' }, { id: 'zapopan', name: 'Zapopan' }, { id: 'tlaquepaque', name: 'Tlaquepaque' }, { id: 'tonala_jal', name: 'Tonalá' }, { id: 'tlajomulco', name: 'Tlajomulco de Zúñiga' }, { id: 'puerto_vallarta', name: 'Puerto Vallarta' }, { id: 'el_salto', name: 'El Salto' }, { id: 'lagos_moreno', name: 'Lagos de Moreno' }, { id: 'tepatitlan', name: 'Tepatitlán de Morelos' }, { id: 'cd_guzman', name: 'Zapotlán el Grande' }
    ]
  },
  {
    id: 'mexico_edo',
    name: 'Estado de México',
    municipalities: [
      { id: 'ecatepec', name: 'Ecatepec de Morelos' }, { id: 'nezahualcoyotl', name: 'Nezahualcóyotl' }, { id: 'toluca', name: 'Toluca' }, { id: 'naucalpan', name: 'Naucalpan de Juárez' }, { id: 'chimalhuacan', name: 'Chimalhuacán' }, { id: 'tlanepantla', name: 'Tlalnepantla de Baz' }, { id: 'cuautitlan_izcalli', name: 'Cuautitlán Izcalli' }, { id: 'tecamac', name: 'Tecámac' }, { id: 'ixtapaluca', name: 'Ixtapaluca' }, { id: 'atizapan_zaragoza', name: 'Atizapán de Zaragoza' }, { id: 'tultitlan', name: 'Tultitlán' }, { id: 'nicolas_romero', name: 'Nicolás Romero' }, { id: 'chalco', name: 'Chalco' }, { id: 'valle_chalco', name: 'Valle de Chalco Solidaridad' }, { id: 'huixquilucan', name: 'Huixquilucan' }
    ]
  },
  {
    id: 'michoacan',
    name: 'Michoacán',
    municipalities: [
      { id: 'morelia', name: 'Morelia' }, { id: 'uruapan', name: 'Uruapan' }, { id: 'zamora', name: 'Zamora' }, { id: 'lazaro_cardenas', name: 'Lázaro Cárdenas' }, { id: 'zitacuaro', name: 'Zitácuaro' }, { id: 'apatzingan', name: 'Apatzingán' }, { id: 'hidalgo_mich', name: 'Ciudad Hidalgo' }, { id: 'la_piedad', name: 'La Piedad' }, { id: 'patzcuaro', name: 'Pátzcuaro' }, { id: 'tarimbaro', name: 'Tarímbaro' }, { id: 'sahuayo', name: 'Sahuayo' }, { id: 'zacapu', name: 'Zacapu' }, { id: 'maravatio', name: 'Maravatío' }, { id: 'tacambaro', name: 'Tacámbaro' }, { id: 'los_reyes', name: 'Los Reyes' }
    ]
  },
  {
    id: 'morelos',
    name: 'Morelos',
    municipalities: [
      { id: 'cuernavaca', name: 'Cuernavaca' }, { id: 'jiutepec', name: 'Jiutepec' }, { id: 'cuautla', name: 'Cuautla' }, { id: 'temixco', name: 'Temixco' }, { id: 'yautepec', name: 'Yautepec' }, { id: 'emiliano_zapata', name: 'Emiliano Zapata' }, { id: 'ayala', name: 'Ayala' }, { id: 'xochitepec', name: 'Xochitepec' }, { id: 'puente_ixtla', name: 'Puente de Ixtla' }, { id: 'tlaltizapan', name: 'Tlaltizapán de Zapata' }
    ]
  },
  {
    id: 'nayarit',
    name: 'Nayarit',
    municipalities: [
      { id: 'tepic', name: 'Tepic' }, { id: 'bahia_banderas', name: 'Bahía de Banderas' }, { id: 'compostela', name: 'Compostela' }, { id: 'xalisco', name: 'Xalisco' }, { id: 'ixtlan_rio', name: 'Ixtlán del Río' }, { id: 'acaponeta', name: 'Acaponeta' }, { id: 'santiago_ixcuintla', name: 'Santiago Ixcuintla' }, { id: 'tecuala', name: 'Tecuala' }, { id: 'rosamorada', name: 'Rosamorada' }, { id: 'san_blas', name: 'San Blas' }
    ]
  },
  {
    id: 'nuevo_leon',
    name: 'Nuevo León',
    municipalities: [
      { id: 'monterrey', name: 'Monterrey' }, { id: 'guadalupe_nl', name: 'Guadalupe' }, { id: 'apodaca', name: 'Apodaca' }, { id: 'san_nicolas_garza', name: 'San Nicolás de los Garza' }, { id: 'general_escobedo', name: 'General Escobedo' }, { id: 'santa_catarina', name: 'Santa Catarina' }, { id: 'juarez_nl', name: 'Juárez' }, { id: 'garcia', name: 'García' }, { id: 'san_pedro_garza', name: 'San Pedro Garza García' }, { id: 'cadereyta_jimenez', name: 'Cadereyta Jiménez' }
    ]
  },
  {
    id: 'oaxaca',
    name: 'Oaxaca',
    municipalities: [
      { id: 'oaxaca_cap', name: 'Oaxaca de Juárez' }, { id: 'tuxtepec', name: 'San Juan Bautista Tuxtepec' }, { id: 'juchitan', name: 'Juchitán de Zaragoza' }, { id: 'salina_cruz', name: 'Salina Cruz' }, { id: 'huajuapan', name: 'Heroica Ciudad de Huajuapan de León' }, { id: 'tehuantepec', name: 'Santo Domingo Tehuantepec' }, { id: 'pinotepa', name: 'Santiago Pinotepa Nacional' }, { id: 'puerto_escondido', name: 'San Pedro Mixtepec' }, { id: 'huatulco', name: 'Santa María Huatulco' }, { id: 'tlaxiaco', name: 'Heroica Ciudad de Tlaxiaco' }
    ]
  },
  {
    id: 'puebla',
    name: 'Puebla',
    municipalities: [
      { id: 'puebla_cap', name: 'Puebla' }, { id: 'tehuacan', name: 'Tehuacán' }, { id: 'san_martin_texmelucan', name: 'San Martín Texmelucan' }, { id: 'atlixco', name: 'Atlixco' }, { id: 'san_pedro_cholula', name: 'San Pedro Cholula' }, { id: 'san_andres_cholula', name: 'San Andrés Cholula' }, { id: 'amozoc', name: 'Amozoc' }, { id: 'huauchinango', name: 'Huauchinango' }, { id: 'teziutlan', name: 'Teziutlán' }, { id: 'cuautlancingo', name: 'Cuautlancingo' }
    ]
  },
  {
    id: 'queretaro',
    name: 'Querétaro',
    municipalities: [
      { id: 'qro_cap', name: 'Querétaro' }, { id: 'san_juan_rio', name: 'San Juan del Río' }, { id: 'corregidora', name: 'Corregidora' }, { id: 'el_marques', name: 'El Marqués' }, { id: 'tequisquiapan', name: 'Tequisquiapan' }, { id: 'cadereyta_montes', name: 'Cadereyta de Montes' }, { id: 'pedro_escobedo', name: 'Pedro Escobedo' }, { id: 'colon', name: 'Colón' }, { id: 'amealco', name: 'Amealco de Bonfil' }, { id: 'ezequiel_montes', name: 'Ezequiel Montes' }
    ]
  },
  {
    id: 'quintana_roo',
    name: 'Quintana Roo',
    municipalities: [
      { id: 'benito_juarez_qroo', name: 'Benito Juárez (Cancún)' }, { id: 'solidaridad', name: 'Solidaridad (Playa del Carmen)' }, { id: 'othon_blanco', name: 'Othón P. Blanco (Chetumal)' }, { id: 'cozumel', name: 'Cozumel' }, { id: 'tulum', name: 'Tulum' }, { id: 'felipe_carrillo_puerto', name: 'Felipe Carrillo Puerto' }, { id: 'isla_mujeres', name: 'Isla Mujeres' }, { id: 'puerto_morelos', name: 'Puerto Morelos' }, { id: 'bacalar', name: 'Bacalar' }, { id: 'lazaro_cardenas_qroo', name: 'Lázaro Cárdenas' }
    ]
  },
  {
    id: 'san_luis_potosi',
    name: 'San Luis Potosí',
    municipalities: [
      { id: 'slp_cap', name: 'San Luis Potosí' }, { id: 'soledad_graciano', name: 'Soledad de Graciano Sánchez' }, { id: 'cd_valles', name: 'Ciudad Valles' }, { id: 'matehuala', name: 'Matehuala' }, { id: 'rio_verde', name: 'Rioverde' }, { id: 'tamazunchale', name: 'Tamazunchale' }, { id: 'ebano', name: 'Ébano' }, { id: 'valles_maiz', name: 'Valles del Maíz' }, { id: 'xilitla', name: 'Xilitla' }, { id: 'villa_reyes', name: 'Villa de Reyes' }
    ]
  },
  {
    id: 'sinaloa',
    name: 'Sinaloa',
    municipalities: [
      { id: 'culiacan', name: 'Culiacán' }, { id: 'mazatlan', name: 'Mazatlán' }, { id: 'ahome', name: 'Ahome (Los Mochis)' }, { id: 'guasave', name: 'Guasave' }, { id: 'navolato', name: 'Navolato' }, { id: 'salvador_alvarado', name: 'Salvador Alvarado (Guamúchil)' }, { id: 'el_fuerte', name: 'El Fuerte' }, { id: 'esquinapa', name: 'Escuinapa' }, { id: 'rosario_sin', name: 'Rosario' }, { id: 'angostura', name: 'Angostura' }
    ]
  },
  {
    id: 'sonora',
    name: 'Sonora',
    municipalities: [
      { id: 'hermosillo', name: 'Hermosillo' }, { id: 'cajeme', name: 'Cajeme (Ciudad Obregón)' }, { id: 'nogales', name: 'Nogales' }, { id: 'san_luis_rio_colorado', name: 'San Luis Río Colorado' }, { id: 'navojoa', name: 'Navojoa' }, { id: 'guaymas', name: 'Guaymas' }, { id: 'huatabampo', name: 'Huatabampo' }, { id: 'etchojoa', name: 'Etchojoa' }, { id: 'puerto_peñasco', name: 'Puerto Peñasco' }, { id: 'cananea', name: 'Cananea' }
    ]
  },
  {
    id: 'tabasco',
    name: 'Tabasco',
    municipalities: [
      { id: 'centro_tab', name: 'Centro (Villahermosa)' }, { id: 'cardenas_tab', name: 'Cárdenas' }, { id: 'comalcalco', name: 'Comalcalco' }, { id: 'huimanguillo', name: 'Huimanguillo' }, { id: 'macuspana', name: 'Macuspana' }, { id: 'cunduacan', name: 'Cunduacán' }, { id: 'paraiso', name: 'Paraíso' }, { id: 'tenosique', name: 'Tenosique' }, { id: 'teapa', name: 'Teapa' }, { id: 'nacajuca', name: 'Nacajuca' }
    ]
  },
  {
    id: 'tamaulipas',
    name: 'Tamaulipas',
    municipalities: [
      { id: 'reynosa', name: 'Rynosa' }, { id: 'matamoros_tam', name: 'Matamoros' }, { id: 'nuevo_laredo', name: 'Nuevo Laredo' }, { id: 'cd_victoria', name: 'Ciudad Victoria' }, { id: 'tampico', name: 'Tampico' }, { id: 'madero', name: 'Ciudad Madero' }, { id: 'altamira', name: 'Altamira' }, { id: 'el_mante', name: 'El Mante' }, { id: 'rio_bravo', name: 'Río Bravo' }, { id: 'valle_hermoso', name: 'Valle Hermoso' }
    ]
  },
  {
    id: 'tlaxcala',
    name: 'Tlaxcala',
    municipalities: [
      { id: 'tlax_cap', name: 'Tlaxcala' }, { id: 'huamantla', name: 'Huamantla' }, { id: 'apizaco', name: 'Apizaco' }, { id: 'chiautempan', name: 'Chiautempan' }, { id: 'san_pablo_monte', name: 'San Pablo del Monte' }, { id: 'zacatelco', name: 'Zacatelco' }, { id: 'calpulalpan', name: 'Calpulalpan' }, { id: 'contla', name: 'Contla de Juan Cuamatzi' }, { id: 'tetla', name: 'Tetla de la Solidaridad' }, { id: 'tlarco', name: 'Tlaxco' }
    ]
  },
  {
    id: 'veracruz',
    name: 'Veracruz',
    municipalities: [
      { id: 'veracruz_port', name: 'Veracruz' }, { id: 'xalapa', name: 'Xalapa' }, { id: 'coatzacoalcos', name: 'Coatzacoalcos' }, { id: 'cordoba', name: 'Córdoba' }, { id: 'orizaba', name: 'Orizaba' }, { id: 'poza_rica', name: 'Poza Rica de Hidalgo' }, { id: 'minatitlan_ver', name: 'Minatitlán' }, { id: 'tuxpan', name: 'Tuxpan' }, { id: 'boca_rio', name: 'Boca del Río' }, { id: 'cosoleacaque', name: 'Cosoleacaque' }
    ]
  },
  {
    id: 'yucatan',
    name: 'Yucatán',
    municipalities: [
      { id: 'merida', name: 'Mérida' }, { id: 'kanasin', name: 'Kanasín' }, { id: 'valladolid', name: 'Valladolid' }, { id: 'tizimin', name: 'Tizimín' }, { id: 'progreso', name: 'Progreso' }, { id: 'umán', name: 'Umán' }, { id: 'tekaax', name: 'Tekax' }, { id: 'motul', name: 'Motul' }, { id: 'oxkutzcab', name: 'Oxkutzcab' }, { id: 'ticul', name: 'Ticul' }
    ]
  },
  {
    id: 'zacatecas',
    name: 'Zacatecas',
    municipalities: [
      { id: 'zac_cap', name: 'Zacatecas' }, { id: 'guadalupe_zac', name: 'Guadalupe' }, { id: 'fresnillo', name: 'Fresnillo' }, { id: 'jerez', name: 'Jerez' }, { id: 'rio_grande_zac', name: 'Río Grande' }, { id: 'sombrerete', name: 'Sombrerete' }, { id: 'calera', name: 'Calera' }, { id: 'loreto_zac', name: 'Loreto' }, { id: 'ojocaliente', name: 'Ojocaliente' }, { id: 'tlaltenango', name: 'Tlaltenango de Sánchez Román' }
    ]
  }
];

export const TRADES: TradeCategory[] = [
  // Originales
  { id: 'plomero', name: 'Plomero', icon: 'plumbing', color: 'text-blue-400' },
  { id: 'electricista', name: 'Electricista', icon: 'electrical_services', color: 'text-yellow-400' },
  { id: 'carpintero', name: 'Carpintero', icon: 'carpenter', color: 'text-amber-600' },
  { id: 'albanil', name: 'Albañil', icon: 'construction', color: 'text-gray-400' },
  { id: 'mecanico', name: 'Mecánico', icon: 'car_repair', color: 'text-red-400' },
  { id: 'jardinero', name: 'Jardinero', icon: 'yard', color: 'text-green-400' },
  { id: 'pintor', name: 'Pintor', icon: 'format_paint', color: 'text-purple-400' },
  { id: 'herrero', name: 'Herrero', icon: 'build', color: 'text-slate-400' },

  // 30 Nuevos
  { id: 'cerrajero', name: 'Cerrajero', icon: 'lock', color: 'text-yellow-200' },
  { id: 'fumigador', name: 'Fumigador', icon: 'pest_control', color: 'text-green-600' },
  { id: 'impermeabilizador', name: 'Impermeabilizador', icon: 'roofing', color: 'text-blue-300' },
  { id: 'tecnico_ac', name: 'Técnico de A/C', icon: 'ac_unit', color: 'text-cyan-400' },
  { id: 'vidriero', name: 'Vidriero', icon: 'window', color: 'text-blue-100' },
  { id: 'tapicero', name: 'Tapicero', icon: 'chair', color: 'text-orange-400' },
  { id: 'costurera', name: 'Costurera/Sastre', icon: 'content_cut', color: 'text-pink-400' },
  { id: 'estilista_canino', name: 'Estilista Canino', icon: 'pets', color: 'text-brown-400' },
  { id: 'pisos', name: 'Colocador de Pisos', icon: 'layers', color: 'text-stone-400' },
  { id: 'tablaroquero', name: 'Tablaroquero', icon: 'architecture', color: 'text-zinc-300' },
  { id: 'tecnico_celulares', name: 'Técnico de Celulares', icon: 'smartphone', color: 'text-indigo-400' },
  { id: 'tecnico_pc', name: 'Técnico de PC', icon: 'computer', color: 'text-sky-500' },
  { id: 'fletes', name: 'Fletes y Mudanzas', icon: 'local_shipping', color: 'text-orange-500' },
  { id: 'limpieza', name: 'Personal de Limpieza', icon: 'cleaning_services', color: 'text-teal-400' },
  { id: 'lavado_salas', name: 'Lavador de Salas', icon: 'format_color_fill', color: 'text-sky-300' },
  { id: 'cocinero', name: 'Cocinero/Chef', icon: 'restaurant', color: 'text-red-500' },
  { id: 'repostero', name: 'Repostero', icon: 'cake', color: 'text-pink-300' },
  { id: 'mesero', name: 'Mesero', icon: 'waiter', color: 'text-slate-200' },
  { id: 'fotografo', name: 'Fotógrafo', icon: 'photo_camera', color: 'text-neutral-400' },
  { id: 'albercas', name: 'Mantenimiento Albercas', icon: 'pool', color: 'text-cyan-500' },
  { id: 'soldador', name: 'Soldador', icon: 'precision_manufacturing', color: 'text-orange-600' },
  { id: 'vulcanizador', name: 'Vulcanizador', icon: 'tire_repair', color: 'text-stone-600' },
  { id: 'lavado_autos', name: 'Lavado de Autos', icon: 'local_car_wash', color: 'text-blue-500' },
  { id: 'chofer', name: 'Chofer Privado', icon: 'directions_car', color: 'text-slate-500' },
  { id: 'enfermeria', name: 'Enfermería', icon: 'medical_services', color: 'text-red-300' },
  { id: 'maquillista', name: 'Maquillista', icon: 'face', color: 'text-rose-400' },
  { id: 'barbero', name: 'Barbero', icon: 'content_cut', color: 'text-amber-500' },
  { id: 'masajista', name: 'Masajista', icon: 'self_care', color: 'text-teal-500' },
  { id: 'entrenador', name: 'Entrenador Personal', icon: 'fitness_center', color: 'text-lime-500' },
  { id: 'tutor', name: 'Tutor Clases', icon: 'school', color: 'text-yellow-500' },
];

const MOCK_REVIEWS = [
  { id: 'r1', author: 'Carlos M.', rating: 5, text: 'Excelente servicio, muy puntual.', date: '15/10/2023', images: [] },
  { id: 'r2', author: 'Maria L.', rating: 4, text: 'Buen trabajo, resolvió el problema rápido.', date: '02/11/2023', images: [] }
];

// --- USUARIOS DE PRUEBA (SEED DATA) ---
export const TEST_USER_NORMAL = {
  name: 'Usuario Normal Prueba',
  email: 'usuario.normal@test.com',
  password: 'Password123!',
};

export const TEST_USER_PRO = {
  name: 'Profesional Prueba',
  email: 'profesional.test@test.com',
  password: 'Password123!',
  trade: 'Carpintero',
  stateId: 'cdmx',
  municipality: 'benito_juarez',
  description: 'Carpintería fina y reparaciones de muebles. Usuario de prueba para validación de Supabase.',
  yearsExperience: '8'
};

export const PROFESSIONALS_DATA: Professional[] = [
  {
    id: '1',
    name: 'Juan Pérez',
    trade: 'Plomero',
    location: 'Monterrey, NL',
    municipality: 'Monterrey',
    state: 'Nuevo León',
    rating: 4.8,
    reviews: 124,
    imageUrl: 'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?q=80&w=200&h=200&auto=format&fit=crop',
    verified: true,
    phone: '811-555-0192',
    description: 'Especialista en instalaciones hidráulicas y reparaciones de emergencia. Más de 15 años de experiencia sirviendo a la comunidad de Monterrey.',
    email: 'juan.perez@example.com',
    yearsExperience: 15,
    reviewsList: [
      { id: 'r1', author: 'Roberto S.', rating: 5, text: 'Excelente servicio, llegó puntual y arregló la fuga rápido.', date: '12/04/2024' },
      { id: 'r2', author: 'Ana M.', rating: 4, text: 'Buen trabajo, aunque tardó un poco en conseguir la pieza.', date: '05/04/2024' }
    ]
  },
  {
    id: '2',
    name: 'Juan Carlos Ruiz',
    trade: 'Albañil',
    location: 'Condesa',
    municipality: 'Cuauhtémoc',
    state: 'Ciudad de México',
    rating: 4.5,
    reviews: 32,
    imageUrl: 'https://images.unsplash.com/photo-1541625602330-2277a4c46182?q=80&w=200&h=200&auto=format&fit=crop',
    verified: false,
    phone: '5555559999',
    description: 'Todo tipo de albañilería, acabados y yeso.',
    email: 'juan.ruiz@email.com',
    yearsExperience: 25,
    reviewsList: []
  }
];


export const TESTIMONIALS = [
  { text: "Encontré un plomero honesto en minutos.", author: "Carmen R.", role: "Michoacán" },
  { text: "Excelente servicio para verificar referencias en CDMX.", author: "Pedro S.", role: "Ciudad de México" },
  { text: "La mejor manera de encontrar ayuda en Jalisco.", author: "Luis M.", role: "Jalisco" }
];
