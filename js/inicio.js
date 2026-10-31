/* Barcelona Incognita · arranque
   Con ?prueba en la dirección, el cuaderno deja probar todos los secretos (sin apuntarlos) y no sale la entrada.
   #id-del-secreto lo lanza al cargar (también #final y #creditos); #X,Y,escala abre el mapa en esa vista.
   BC.debug sirve para probar desde la consola y en las pruebas sin ventana. */
(function () {
  'use strict';
  var BC = window.BC, E = BC.motor, I = BC.interfaz;
  I.iniciar();
  // las fuentes que se usan en el lienzo (los textos de teselas y los rótulos): que estén cargadas antes de usarlas
  if (document.fonts && document.fonts.load) ['600 40px "IBM Plex Mono"', '500 11px "IBM Plex Mono"', 'italic 400 22px "Instrument Serif"'].forEach(function (f) { document.fonts.load(f); });
  var vista = /^#(-?[\d.]+),(-?[\d.]+),([\d.]+)$/.exec(location.hash);
  if (vista) { E.cam.x = +vista[1]; E.cam.y = +vista[2]; E.cam.s = +vista[3]; }
  // lo primero que se ve se pinta del tirón con el aviso de carga delante; luego se quita
  setTimeout(function () {
    var t0 = performance.now();
    E.iniciar(document.getElementById('lienzo'), function () {
      BC.debug.tPreparar = Math.round(performance.now() - t0);
      var c = document.getElementById('cargando');
      if (c) { c.classList.add('fuera'); setTimeout(function () { c.hidden = true; }, 800); }
      BC.listo = true;
      if (location.hash.length > 1 && !vista) { var id = decodeURIComponent(location.hash.slice(1)); setTimeout(function () { BC.debug.disparar(id); }, 700); }
    });
  }, 30);

  // en modo prueba: un panel con un botón por secreto (y el final y los créditos) para verlos todos sin buscarlos
  if (I.prueba) {
    var panel = document.createElement('nav'); panel.className = 'panel-prueba'; panel.setAttribute('aria-label', 'Veure els secrets');
    panel.innerHTML = '<p>Veure secrets</p>';
    I.huevos().concat([{ id: 'final', n: '★', nombre: 'Final' }, { id: 'creditos', n: '·', nombre: 'Crèdits' }]).forEach(function (h) {
      var b = document.createElement('button'); b.type = 'button';
      b.innerHTML = '<b>' + (typeof h.n === 'number' ? (h.n < 10 ? '0' : '') + h.n : h.n) + '</b> ' + h.nombre;
      b.addEventListener('click', function () { if (E.escena) E.saltar(); setTimeout(function () { BC.debug.disparar(h.id); }, 60); });
      panel.appendChild(b);
    });
    document.body.appendChild(panel);
  }
  function buscar(id) { var h = null; I.huevos().forEach(function (x) { if (x.id === id) h = x; }); return h; }
  BC.debug = {
    disparar: function (id, datos) {
      if (id === 'final') { I.verFinal(); return true; }
      if (id === 'creditos') { I.mostrarCreditos(); return true; }
      var h = buscar(id); return h ? I.disparar(h, datos, { prueba: true }) : false;
    },
    congelar: E.congelar, paso: E.paso, pintarTodo: E.pintarTodo,
    mirar: function (x, y, s) { E.parar(); E.cam.x = x; E.cam.y = y; E.cam.s = s; E.limites(); },
    puntero: function (x, y) { E.puntero.x = x; E.puntero.y = y; E.puntero.sobre = true; E.puntero.tipo = 'mouse'; },
    ids: function () { return I.huevos().map(function (h) { return h.id; }); }
  };
})();
