/* Barcelona Incognita · los rótulos del mapa
   Unos pocos nombres de lugar, como en un mapa de verdad, para orientarse (Pau no encontraba el puerto ni los ríos).
   Aparecen y se van según el zoom: los grandes (ríos, sierra, mar) de lejos; los de barrio, al acercarse.
   Se pintan encima del mapa (capa), no en las teselas, para que el texto siempre se lea nítido. */
(function () {
  'use strict';
  var BC = window.BC, U = BC.util, M = BC.mapa, FX = BC.fx, E = BC.motor;
  // [nombre, lat, lon, zoom en que aparece, zoom en que se va, serif (nombres grandes), desplazamiento en px]
  var ROTULOS = [
    ['Mediterrani', 41.3700, 2.2350, 0, 0.5, true],
    ['Serra de Collserola', 41.4250, 2.1050, 0, 0.45, true],
    ['Port Vell', 41.3755, 2.1830, 0.12, 2.2],
    ['Montjuïc', 41.3660, 2.1570, 0.12, 1.2],
    ['Port de Barcelona', 41.3500, 2.1620, 0.1, 0.9],
    ['Eixample', 41.3930, 2.1630, 0.2, 0.75],
    ['Ciutat Vella', 41.3835, 2.1740, 0.3, 0.9],
    ['Gràcia', 41.4030, 2.1560, 0.2, 0.75],
    ['La Barceloneta', 41.3800, 2.1905, 0.3, 1.6],
    ['Poblenou', 41.4010, 2.2010, 0.2, 0.8]
  ].map(function (r) { var g = M.ll(r[1], r[2]); return { n: r[0], X: g[0], Y: g[1], z0: r[3], z1: r[4], serif: !!r[5], dx: r[6] || 0 }; });
  E.capas.push(function (ctx) {
    if (E.escena || E.mundo !== 'ciutat') return;
    var s = E.cam.s;
    ROTULOS.forEach(function (r) {
      var a = U.clamp((s - r.z0) / (r.z0 * 0.25 + 0.02), 0, 1) * U.clamp((r.z1 - s) / (r.z1 * 0.2), 0, 1);
      if (a <= 0.02) return;
      var p = E.aPantalla(r.X, r.Y); if (p[0] < -100 || p[0] > E.W + 100 || p[1] < -40 || p[1] > E.H + 40) return;
      var dx = Math.max(r.dx, 70 - p[0]);   // que nunca quede cortado por el borde izquierdo
      FX.etiqueta(ctx, r.n, r.X, r.Y, r.serif ? { serif: true, tam: 22, alfa: a * 0.92, dx: dx } : { tam: 10, alfa: a * 0.88, dx: dx });
    });
  });
})();
