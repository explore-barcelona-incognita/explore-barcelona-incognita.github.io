/* El final · Barcelona cognita
   Al encontrar los once: la cámara se aleja al máximo, los once lugares se encienden en oro uno tras otro con su
   número (en el orden en que se encontraron), una línea los une como un recorrido y el «in» del título se tacha.
   Después, los créditos. */
(function () {
  'use strict';
  var BC = window.BC, U = BC.util, M = BC.mapa, FX = BC.fx;
  // dónde está cada secreto (para los que no tienen «lugar», un punto representativo)
  var SITIOS = {
    canaletes: M.ll(41.3853, 2.1699), barcino: M.ll(41.3837, 2.1772), sagrada: M.ll(41.4036, 2.1744), cerda: M.ll(41.3925, 2.1650),
    batllo: M.ll(41.3916, 2.1649), pedrera: M.ll(41.3953, 2.1620), banc: M.ll(41.4136, 2.1529), campnou: M.ll(41.3809, 2.1228),
    fontmagica: M.ll(41.3712, 2.1517), tibidabo: M.ll(41.4219, 2.1186), onze: M.ll(41.38345, 2.18168)
  };
  BC.registrarFinal({
    escena: function (E, datos) {
      var L = E.lectura, huevos = datos.huevos.slice(), est = BC.interfaz.estado(), raiz = document.documentElement;
      huevos.sort(function (a, b) { return (est.hallados[a.id] || a.n * 1e12) - (est.hallados[b.id] || b.n * 1e12); });
      var pts = huevos.map(function (h) { return SITIOS[h.id] || [E.cam.x, E.cam.y]; }), tachado = false;
      function duracion(ms) { var m = Math.round(ms / 60000); return m < 60 ? m + ' min' : m < 1440 ? Math.round(m / 60) + ' h' : Math.round(m / 1440) + ' dies'; }
      var tiempo = isFinite(datos.desde) && datos.hasta > datos.desde ? ' Has trigat ' + duracion(datos.hasta - datos.desde) + ' des del primer.' : '';
      return {
        duracion: 15000 + L,
        tarjeta: { en: 9000, hasta: 14300 + L, etiqueta: 'Final · Onze d’onze', titulo: 'Barcelona cognita',
          texto: 'Onze secrets, per l’Onze de Setembre. La ciutat ja no és desconeguda: has begut a Canaletes, has despertat el drac de la Casa Batlló i has fet l’onada al Camp Nou.' + tiempo,
          pie: 'La ciutat amagada · ja no tant' },
        inicio: function () { E.camara(750, -1550, E.sMin(), 2600); },
        cuadro: function (t) { if (!tachado && t > 8200) { tachado = true; raiz.classList.add('cognita'); } },
        fin: function () { if (!est.final) raiz.classList.toggle('cognita', false); },
        frente: function (ctx, t) {
          var a = 1 - U.tramo(t, 14300 + L, 15000 + L), paso = 450, t0 = 2600;
          var n = U.clamp((t - t0) / paso, 0, pts.length);
          if (n > 1) FX.linea(ctx, pts.slice(0, Math.ceil(n)), 1, 1.6, BC.color.acento, 0.8 * a, [5, 6]);
          pts.forEach(function (p, i) {
            var f = U.tramo(t, t0 + i * paso, t0 + i * paso + 400); if (f <= 0) return;
            FX.punto(ctx, p[0], p[1], 4 + 3 * (1 - f) + 2 * f, BC.color.acento, a * f);
            FX.etiqueta(ctx, U.dos(huevos[i].n), p[0], p[1], { dy: -20, alfa: a * f, color: BC.color.acento });
          });
        }
      };
    }
  });
})();
