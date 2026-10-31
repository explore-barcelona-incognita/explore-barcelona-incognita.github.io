/* Secreto 02 · Barcino (Teclado)
   Se escribe BARCINO en cualquier momento. La escena baja al Gòtic y redibuja en oro los tramos reales que quedan
   de la muralla romana (OpenStreetMap, datos/secretos.js), con el cardo y el decumano cruzándose en el foro. */
(function () {
  'use strict';
  var BC = window.BC, U = BC.util, M = BC.mapa, FX = BC.fx;
  var PALABRA = 'BARCINO', tramos = null, centro = M.ll(41.3837, 2.1772);
  function muralla() {
    if (!tramos) tramos = (window.BC_SECRETOS ? window.BC_SECRETOS.muralla : []).map(function (t) { return t.map(M.mundoAGirado); });
    return tramos;
  }
  BC.registrar({
    id: 'barcino', n: 2, nombre: 'Barcino', tipo: 'Teclat',
    pista: 'Abans d’aquest nom en va tenir un en llatí. Escriu-lo i tornarà la seva muralla.',
    detectar: function (api) {
      var buf = '';
      api.en('tecla', function (d) {
        if (api.motor.escena || d.key.length !== 1) return;
        buf = (buf + d.key.toUpperCase()).slice(-PALABRA.length);
        if (buf === PALABRA) { buf = ''; api.disparar(); }
      });
    },
    escena: function (E) {
      var L = E.lectura, tr = muralla(), MO = BC.mosaico, cam = {}, nombre = MO.texto('BARCINO', 96, 7.5);
      var PIEDRA = ['#f1e4c6', '#e6d5ae', '#dcc79b', '#f6ecd6', '#cfb88a'], LOSA = ['#efe2c2', '#e6d6b2', '#f4ead2'];
      // el cardo y el decumano, aproximados: se cruzan en el foro (plaza de Sant Jaume)
      var foro = M.ll(41.38275, 2.17705), cardo = [M.ll(41.3851, 2.1756), foro, M.ll(41.3815, 2.1788)], decumano = [M.ll(41.3823, 2.1752), foro, M.ll(41.3839, 2.1795)];
      // los tramos de muralla, por orden de distancia al foro: se van levantando del centro hacia fuera
      var orden = tr.slice().sort(function (p, q) { return Math.hypot(p[0][0] - foro[0], p[0][1] - foro[1]) - Math.hypot(q[0][0] - foro[0], q[0][1] - foro[1]); });
      return {
        duracion: 13000 + L,
        tarjeta: { en: 5600, hasta: 12300 + L, titulo: 'Barcino',
          texto: 'Cap a l’any 10 aC, en temps d’August, Roma hi va fundar una petita colònia emmurallada. El seu nom complet era <i>Colonia Iulia Augusta Faventia Paterna Barcino</i>. Entre els carrers del Gòtic encara queden trossos d’aquella muralla.',
          pie: 'Colonia Iulia Augusta Faventia Paterna Barcino · c. 10 aC' },
        inicio: function () { E.encuadrar(centro[0], centro[1], 1.9, 2600); },
        cuadro: function (t) { MO.respirar(E, cam, t, 2700, 13000 + L, 0.06); },
        frente: function (ctx, t) {
          var a = 1 - U.tramo(t, 12300 + L, 13000 + L), k = E.cam.s / 1.9;
          FX.foco(ctx, centro[0], centro[1], 300 * E.cam.s, U.tramo(t, 1800, 3200) * a);
          // 1 · el cardo y el decumano: dos calles de losas claras que se cruzan en el foro
          var g = U.tramo(t, 2400, 4200);
          MO.cadena(ctx, cardo, g, { tam: 5.5 * k, paleta: LOSA, alfa: a, semilla: 21, junta: false });
          MO.cadena(ctx, decumano, g, { tam: 5.5 * k, paleta: LOSA, alfa: a, semilla: 22, junta: false });
          var pf = E.aPantalla(foro[0], foro[1]);
          MO.tesela(ctx, pf[0], pf[1], 13 * k, '#f2b33d', U.tramo(t, 4000, 4500), 5);
          // 2 · la muralla: los tramos reales, piedra a piedra, del centro hacia fuera
          orden.forEach(function (p, i) { var ini = 3400 + i * 220; MO.cadena(ctx, p, U.tramo(t, ini, ini + 1500), { tam: 10.5 * k, paleta: PIEDRA, alfa: a, semilla: 40 + i }); });
          // 3 · el nombre, en teselas de oro, encima del Gòtic
          var pn = E.aPantalla(centro[0], centro[1]), en = 0.62 * Math.max(0.8, Math.min(1.2, k));
          MO.pintarTexto(ctx, nombre, pn[0], Math.max(nombre.h * en / 2 + 24, pn[1] - 330 * k), U.tramo(t, 5600, 8200), { esc: en, salida: U.tramo(t, 11400 + L, 12800 + L) });
        }
      };
    }
  });
})();
