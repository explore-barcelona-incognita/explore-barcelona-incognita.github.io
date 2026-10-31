/* Barcelona Incognita · los idiomas (BC.idioma)
   La web se abre SIEMPRE en catalán (Pau, 31/10/2026). El selector CA · ES · EN cambia todos los textos al momento;
   la elección dura solo esta visita (sessionStorage): la próxima vez vuelve a abrirse en catalán. ?lang=es|en también vale.
   El catalán vive en el HTML y en cada secreto; aquí están el castellano y el inglés.
     t(clave)                 un texto de la interfaz
     secreto(h, campo)        nombre, pista, titulo, texto o pie de un secreto en el idioma actual
     palabra(txt)             las palabras que se montan en teselas (TORNARÀS…)
     tipo(t)                  Lloc / Lugar / Place…
     en(fn)                   avisa cuando cambia el idioma */
(function () {
  'use strict';
  var BC = window.BC = window.BC || {};
  var CLAVE = 'barcelona-incognita.idioma';
  var LENGUAS = ['ca', 'es', 'en'];

  var UI = {
    carga: ['Col·locant peces…', 'Colocando piezas…', 'Laying the tiles…'],
    sub: ['La ciutat amagada', 'La ciudad escondida', 'The hidden city'],
    bEtq: ['Quadern · Secrets', 'Cuaderno · Secretos', 'Notebook · Secrets'],
    hAltura: ['Altura', 'Altura', 'Altitude'], hBarri: ['Barri', 'Barrio', 'District'], hBatec: ['Batec', 'Latido', 'Pulse'],
    ayuda: ['Arrossega per moure’t · Roda per apropar-te', 'Arrastra para moverte · Rueda para acercarte', 'Drag to move · Scroll to zoom in'],
    ayudaTactil: ['Llisca per moure’t · Pessiga per apropar-te', 'Desliza para moverte · Pellizca para acercarte', 'Swipe to move · Pinch to zoom in'],
    cEtq: ['Quadern de camp', 'Cuaderno de campo', 'Field notebook'],
    cTitulo: ['Els secrets de la ciutat', 'Los secretos de la ciudad', 'The secrets of the city'],
    cIntro: ['Els secrets amagats a la ciutat. Cada pista n’assenyala un; el nom apareix quan el trobes.',
      'Los secretos escondidos en la ciudad. Cada pista apunta a uno; el nombre aparece cuando lo encuentras.',
      'The secrets hidden in the city. Each clue points to one; its name appears when you find it.'],
    cCerrar: ['Tanca el quadern', 'Cerrar el cuaderno', 'Close the notebook'],
    cFuentes: ['Mapa: © col·laboradors d’OpenStreetMap (ODbL). Tipografies: Instrument Serif i IBM Plex Mono (OFL).',
      'Mapa: © colaboradores de OpenStreetMap (ODbL). Tipografías: Instrument Serif e IBM Plex Mono (OFL).',
      'Map: © OpenStreetMap contributors (ODbL). Typefaces: Instrument Serif and IBM Plex Mono (OFL).'],
    unJuego: ['Un joc de ', 'Un juego de ', 'A game by '],
    verFinal: ['Torna a veure el final', 'Ver el final otra vez', 'Watch the ending again'],
    borrar: ['Esborra el progrés', 'Borrar progreso', 'Reset progress'],
    confirmar: ['Vols esborrar tots els secrets trobats en aquest navegador?', '¿Borrar todos los secretos encontrados en este navegador?', 'Erase every secret found in this browser?'],
    saltar: ['Salta', 'Saltar', 'Skip'],
    introTexto: ['Aquesta Barcelona de ceràmica trencada amaga onze secrets als seus carrers. Apropa’t, busca, toca… o queda’t quiet. El que trobis quedarà anotat al quadern.',
      'Esta Barcelona de cerámica rota esconde once secretos en sus calles. Acércate, busca, toca… o quédate quieto. Lo que encuentres quedará anotado en el cuaderno.',
      'This Barcelona of broken ceramic hides eleven secrets in its streets. Come closer, look, touch… or keep still. Whatever you find will be noted in the notebook.'],
    empezar: ['Entra a la ciutat', 'Entrar en la ciudad', 'Enter the city'],
    credEtq: ['Mosaic col·locat per', 'Mosaico colocado por', 'Mosaic laid by'],
    credTxt: ['Gràcies per perdre’t per Barcelona fins al final.', 'Gracias por perderte por Barcelona hasta el final.', 'Thank you for getting lost in Barcelona all the way to the end.'],
    credEnlace: ['Veure el seu LinkedIn', 'Ver su LinkedIn', 'View LinkedIn'],
    credCerrar: ['Continua explorant', 'Seguir explorando', 'Keep exploring'],
    secreto: ['Secret', 'Secreto', 'Secret'],
    encontrado: ['Secret trobat', 'Secreto encontrado', 'Secret found'],
    porDescubrir: ['Per descobrir', 'Sin descubrir', 'Not found yet'],
    trobat: ['Trobat el ', 'Encontrado el ', 'Found on '],
    reveure: ['↻ Torna-ho a veure', '↻ Ver otra vez', '↻ Watch again'],
    provar: ['▶ Prova-ho', '▶ Probar', '▶ Try it'],
    idioma: ['Idioma', 'Idioma', 'Language'],
    // el final
    finEtq: ['Final · Onze d’onze', 'Final · Once de once', 'Finale · Eleven of eleven'],
    finTexto: ['Onze secrets, per l’Onze de Setembre. La ciutat ja no és desconeguda: has begut a Canaletes, has despertat el drac de la Casa Batlló i has fet l’onada al Camp Nou.',
      'Once secretos, por el Onze de Setembre. La ciudad ya no es desconocida: has bebido en Canaletes, has despertado al dragón de la Casa Batlló y has hecho la ola en el Camp Nou.',
      'Eleven secrets, for the Onze de Setembre. The city is no longer unknown: you drank at Canaletes, woke the dragon of Casa Batlló and did the wave at the Camp Nou.'],
    finTiempo: [' Has trigat % des del primer.', ' Has tardado % desde el primero.', ' It took you % since the first one.'],
    finPie: ['La ciutat amagada · ja no tant', 'La ciudad escondida · ya no tanto', 'The hidden city · not anymore'],
    min: ['min', 'min', 'min'], horas: ['h', 'h', 'h'], dias: ['dies', 'días', 'days']
  };
  var TIPOS = { Lloc: ['Lloc', 'Lugar', 'Place'], Mirada: ['Mirada', 'Mirada', 'Look'], Gest: ['Gest', 'Gesto', 'Gesture'], Teclat: ['Teclat', 'Teclado', 'Keyboard'], Espera: ['Espera', 'Espera', 'Wait'] };
  var PALABRAS = { 'TORNARÀS': ['TORNARÀS', 'VOLVERÁS', 'YOU’LL RETURN'], 'GUERRERS': ['GUERRERS', 'GUERREROS', 'WARRIORS'], 'SANT JORDI': ['SANT JORDI', 'SAN JORGE', 'SAINT GEORGE'] };

  // los secretos: [castellano, inglés] de { nombre, pista, titulo, texto, pie }
  var SECRETOS = {
    canaletes: [
      { pista: 'Quien bebe de ella, dicen, siempre vuelve.',
        texto: 'Una fuente de hierro colado de 1892, obra del arquitecto municipal Pere Falqués, en lo alto de la Rambla. Dice la tradición que quien bebe de su agua vuelve siempre a Barcelona. Y desde los años treinta, la afición del Barça viene aquí a celebrar sus victorias.' },
      { pista: 'Drink from it, they say, and you will always come back.',
        texto: 'A cast-iron fountain from 1892, by the city architect Pere Falqués, at the top of La Rambla. Tradition says that whoever drinks its water always returns to Barcelona. And since the 1930s, Barça fans have come here to celebrate their victories.' }],
    barcino: [
      { pista: 'Antes de este nombre tuvo uno en latín. Escríbelo y vuelve su muralla.',
        texto: 'Hacia el año 10 a. C., en tiempos de Augusto, Roma fundó aquí una pequeña colonia amurallada. Su nombre completo era <i>Colonia Iulia Augusta Faventia Paterna Barcino</i>. Entre las calles del Gòtic aún quedan trozos de aquella muralla.',
        pie: 'Colonia Iulia Augusta Faventia Paterna Barcino · c. 10 a. C.' },
      { pista: 'Before this name it had one in Latin. Type it and its wall comes back.',
        texto: 'Around 10 BC, under Augustus, Rome founded a small walled colony here. Its full name was <i>Colonia Iulia Augusta Faventia Paterna Barcino</i>. Pieces of that wall still stand among the streets of the Gothic Quarter.',
        pie: 'Colonia Iulia Augusta Faventia Paterna Barcino · c. 10 BC' }],
    sagrada: [
      { pista: 'Lleva más de un siglo creciendo. Acércate y quédate a mirarla.',
        texto: 'La primera piedra se puso el 19 de marzo de 1882 y Gaudí se hizo cargo de la obra un año después. En febrero de 2026, la cruz de la torre de Jesucristo la llevó a 172,5 metros: la iglesia más alta del mundo. Y aún no está terminada.' },
      { pista: 'It has been growing for over a century. Come close and stay to look at it.',
        texto: 'The first stone was laid on 19 March 1882, and Gaudí took over the work a year later. In February 2026 the cross on the Tower of Jesus Christ brought it to 172.5 metres: the tallest church in the world. And it still isn’t finished.' }],
    cerda: [
      { nombre: 'Plan Cerdà', pista: 'Alguien cortó las esquinas de la ciudad para que se viera mejor.',
        texto: 'En 1859 se aprobó el plan del ingeniero Ildefons Cerdà para que Barcelona creciera fuera de sus murallas: una cuadrícula de manzanas de unos 113 metros con las esquinas cortadas a 45°, los chaflanes, para ganar luz, aire y visibilidad en cada cruce.' },
      { nombre: 'The Cerdà Plan', titulo: 'The Cerdà Plan', pista: 'Someone cut off the corners of the city so you could see better.',
        texto: 'In 1859 the plan by the engineer Ildefons Cerdà was approved so that Barcelona could grow beyond its walls: a grid of blocks about 113 metres wide with their corners cut at 45° — the chamfers — to bring light, air and visibility to every crossing.' }],
    batllo: [
      { nombre: 'El dragón de la Casa Batlló', titulo: 'El dragón', pista: 'Una casa con escamas en el tejado. Escribe el nombre de quien venció al dragón.',
        texto: 'Gaudí reformó esta casa entre 1904 y 1906. La lectura más popular es la leyenda de Sant Jordi: el tejado sería el lomo del dragón, con escamas de cerámica; la torre con su cruz, la lanza que lo atraviesa; y los balcones y las columnas, los huesos de sus víctimas.' },
      { nombre: 'The dragon of Casa Batlló', titulo: 'The dragon', pista: 'A house with scales on its roof. Type the name of the one who slew the dragon.',
        texto: 'Gaudí remodelled this house between 1904 and 1906. The most popular reading is the legend of Saint George: the roof would be the dragon’s back, with ceramic scales; the tower and its cross, the lance that pierces it; and the balconies and columns, the bones of its victims.' }],
    pedrera: [
      { nombre: 'Los guerreros de La Pedrera', titulo: 'Los guerreros', pista: 'En su azotea montan guardia. Mírala un rato… y te mirarán.',
        texto: 'La Casa Milà, que todo el mundo llama La Pedrera, se construyó entre 1906 y 1912. En su azotea, las chimeneas y las salidas de escalera parecen soldados con casco montando guardia; por eso la llaman «el jardín de los guerreros». Desde 1984 es Patrimonio Mundial.' },
      { nombre: 'The warriors of La Pedrera', titulo: 'The warriors', pista: 'On its roof they stand guard. Look at it for a while… and they’ll look back.',
        texto: 'Casa Milà, which everyone calls La Pedrera, was built between 1906 and 1912. On its roof, the chimneys and stair exits look like helmeted soldiers standing guard; that is why it is called «the garden of warriors». It has been a World Heritage Site since 1984.' }],
    banc: [
      { nombre: 'Banco de Park Güell', titulo: 'El banco ondulado', pista: 'En el parque, el banco ondula. Ondula tú también por encima.',
        texto: 'El banco que rodea la gran plaza de Park Güell se construyó entre 1909 y 1914. Gaudí dibujó sus curvas y Josep Maria Jujol las cubrió de trencadís: trozos de azulejo, de plato y de botella de todos los colores. Se suele decir que mide unos 110 metros.' },
      { nombre: 'The Park Güell bench', titulo: 'The wavy bench', pista: 'In the park, the bench waves. Make waves above it too.',
        texto: 'The bench around the great square of Park Güell was built between 1909 and 1914. Gaudí drew its curves and Josep Maria Jujol covered them in trencadís: pieces of tile, plate and bottle in every colour. It is often said to be about 110 metres long.' }],
    campnou: [
      { nombre: 'La ola del Camp Nou', pista: 'Més que un club. Da una vuelta entera alrededor de su grada.',
        texto: 'Se inauguró el 24 de septiembre de 1957, día de la Mercè, y es el estadio más grande de Europa: antes de las obras le cabían 99.354 personas. Reabrió en noviembre de 2025, aún en obras, y el plan es que supere las 105.000.' },
      { nombre: 'The Camp Nou wave', pista: 'Més que un club. Go all the way around its stands.',
        texto: 'It opened on 24 September 1957, the day of La Mercè, and it is the largest stadium in Europe: before the works it held 99,354 people. It reopened in November 2025, still under construction, and the plan is for it to hold more than 105,000.' }],
    fontmagica: [
      { pista: 'Al pie de Montjuïc, el agua sabe bailar. Tócala.',
        texto: 'La diseñó el ingeniero Carles Buïgas para la Exposición Internacional de 1929, al pie del Palau Nacional, que hoy es el MNAC. La Guerra Civil la dejó muy dañada y volvió a funcionar a mediados de los cincuenta. Hoy sus chorros de agua y de luz bailan al ritmo de la música.' },
      { pista: 'At the foot of Montjuïc, the water knows how to dance. Touch it.',
        texto: 'The engineer Carles Buïgas designed it for the 1929 International Exposition, at the foot of the Palau Nacional, now the MNAC. The Civil War left it badly damaged, and it ran again in the mid-1950s. Today its jets of water and light dance to the music.' }],
    tibidabo: [
      { nombre: 'La noria del Tibidabo', pista: 'En lo más alto, alguien dijo «todo esto te daré». Míralo en silencio.',
        texto: 'Su nombre viene del latín <i>tibi dabo</i>, «te daré»: las palabras con que, según el Evangelio, el diablo ofreció a Jesús los reinos del mundo desde lo alto de un monte. Arriba, a 512 metros, está el parque de atracciones en funcionamiento más antiguo de España, abierto en 1901.' },
      { nombre: 'The Tibidabo Ferris wheel', pista: 'At the very top, someone said «all this I will give you». Look at it in silence.',
        texto: 'Its name comes from the Latin <i>tibi dabo</i>, «I will give you»: the words with which, according to the Gospel, the devil offered Jesus the kingdoms of the world from a mountaintop. At the top, 512 metres up, stands the oldest amusement park still running in Spain, opened in 1901.' }],
    onze: [
      { pista: 'Un año que la ciudad no olvida. Cuatro cifras.',
        texto: 'En el Fossar de les Moreres, junto a Santa Maria del Mar, se enterró a los defensores que murieron en el asedio de 1713–1714. Barcelona cayó el 11 de septiembre de 1714, y ese día es hoy la Diada Nacional de Catalunya. Aquí arde una llama que no se apaga, bajo un verso de Pitarra: <i>«Al fossar de les moreres no s’hi enterra cap traïdor».</i>' },
      { pista: 'A year the city never forgets. Four digits.',
        texto: 'The defenders who died in the siege of 1713–1714 were buried in the Fossar de les Moreres, beside Santa Maria del Mar. Barcelona fell on 11 September 1714, and that day is now the Diada, the National Day of Catalonia. A flame that never goes out burns here, beneath a verse by Pitarra: <i>«Al fossar de les moreres no s’hi enterra cap traïdor»</i> — no traitor is buried in the Fossar de les Moreres.' }]
  };

  function elegir() {
    var m = /[?&]lang=(ca|es|en)\b/.exec(location.search); if (m) return m[1];
    try { var s = sessionStorage.getItem(CLAVE); if (LENGUAS.indexOf(s) >= 0) return s; } catch (e) { /* sin almacenamiento */ }
    return 'ca';
  }
  var oyentes = [];
  var I = BC.idioma = {
    actual: elegir(),
    n: function () { return LENGUAS.indexOf(I.actual); },
    t: function (k) { var v = UI[k]; return v ? v[I.n()] : k; },
    tipo: function (t) { var v = TIPOS[t]; return v ? v[I.n()] : t; },
    palabra: function (p) { var v = PALABRAS[p]; return v ? v[I.n()] : p; },
    secreto: function (h, campo) {
      if (I.actual === 'ca') return h[campo];
      var tr = SECRETOS[h.id]; tr = tr && tr[I.n() - 1];
      if (tr && tr[campo] != null) return tr[campo];
      return h[campo];   // los nombres propios (Barcino, Font Màgica…) no cambian
    },
    en: function (fn) { oyentes.push(fn); },
    cambiar: function (l) {
      if (LENGUAS.indexOf(l) < 0 || l === I.actual) return;
      I.actual = l;
      try { sessionStorage.setItem(CLAVE, l); } catch (e) { /* sin almacenamiento */ }
      I.aplicar();
      oyentes.forEach(function (fn) { fn(l); });
    },
    // los textos fijos del HTML: data-i18n (texto), data-i18n-aria (aria-label)
    aplicar: function () {
      document.documentElement.lang = I.actual;
      Array.prototype.forEach.call(document.querySelectorAll('[data-i18n]'), function (el) { el.textContent = I.t(el.getAttribute('data-i18n')); });
      Array.prototype.forEach.call(document.querySelectorAll('[data-i18n-aria]'), function (el) { el.setAttribute('aria-label', I.t(el.getAttribute('data-i18n-aria'))); });
      Array.prototype.forEach.call(document.querySelectorAll('.idiomas button'), function (b) { b.setAttribute('aria-pressed', b.dataset.lang === I.actual ? 'true' : 'false'); });
    }
  };
})();
