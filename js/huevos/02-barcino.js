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
    id: 'barcino', n: 2, nombre: 'Barcino', tipo: 'Teclado',
    pista: 'Antes de este nombre tuvo uno en latín. Escríbelo y vuelve su muralla.',
    detectar: function (api) {
      var buf = '';
      api.en('tecla', function (d) {
        if (api.motor.escena || d.key.length !== 1) return;
        buf = (buf + d.key.toUpperCase()).slice(-PALABRA.length);
        if (buf === PALABRA) { buf = ''; api.disparar(); }
      });
    },
    escena: function (E) {
      var L = E.lectura, tr = muralla();
      // el cardo y el decumano, aproximados: se cruzan en el foro (plaza de Sant Jaume)
      var foro = M.ll(41.38275, 2.17705), cardo = [M.ll(41.3851, 2.1756), foro, M.ll(41.3815, 2.1788)], decumano = [M.ll(41.3823, 2.1752), foro, M.ll(41.3839, 2.1795)];
      return {
        duracion: 12500 + L,
        tarjeta: { en: 4200, hasta: 11800 + L, titulo: 'Barcino',
          texto: 'Hacia el año 10 a. C., en tiempos de Augusto, Roma fundó aquí una pequeña colonia amurallada. Su nombre completo era <i>Colonia Iulia Augusta Faventia Paterna Barcino</i>. Entre las calles del Gòtic aún quedan trozos de aquella muralla.',
          pie: 'Colonia Iulia Augusta Faventia Paterna Barcino · c. 10 a. C.' },
        inicio: function () { E.encuadrar(centro[0], centro[1], 1.7, 2600); },
        frente: function (ctx, t) {
          var a = 1 - U.tramo(t, 11600 + L, 12500 + L);
          FX.foco(ctx, centro[0], centro[1], 260 * E.cam.s, U.tramo(t, 1800, 3200) * a);
          var f = U.suave(U.tramo(t, 2400, 6200));
          tr.forEach(function (p) { FX.linea(ctx, p, f, Math.max(4, 7 * E.cam.s), 'rgba(20,17,15,0.75)', a); FX.linea(ctx, p, f, Math.max(2.4, 4 * E.cam.s), BC.color.acento, a); });
          var g = U.suave(U.tramo(t, 5600, 7600));
          FX.linea(ctx, cardo, g, 2, BC.color.hueso, 0.9 * a, [6, 6]); FX.linea(ctx, decumano, g, 2, BC.color.hueso, 0.9 * a, [6, 6]);
          FX.punto(ctx, foro[0], foro[1], 4, BC.color.acento, U.tramo(t, 7000, 7600) * a);
          FX.etiqueta(ctx, 'Forum', foro[0], foro[1], { dy: -22, alfa: U.tramo(t, 7200, 7900) * a });
          FX.etiqueta(ctx, 'Barcino', centro[0], centro[1], { serif: true, tam: 30, dy: -120 * E.cam.s, alfa: U.tramo(t, 3800, 4800) * a, color: BC.color.acento });
        }
      };
    }
  });
})();
