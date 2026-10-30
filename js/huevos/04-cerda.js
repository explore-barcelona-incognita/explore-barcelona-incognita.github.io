/* Secreto 04 · Plan Cerdà (Lugar)
   De cerca (cuando ya se ven los chaflanes), un clic en uno de los chaflanes del Eixample. La escena: desde ese
   cruce, una onda de oro dibuja el octógono de cada manzana, cada vez más lejos, por toda la cuadrícula. */
(function () {
  'use strict';
  var BC = window.BC, U = BC.util, M = BC.mapa, FX = BC.fx;
  var CH = 14;   // el chaflán: unos 20 m de cara (14 m de cateto) en manzanas de 113,3 m
  // el cruce de Cerdà más cercano a un punto del plano girado y si el punto cae en uno de sus cuatro chaflanes
  function chaflan(X, Y) {
    var C = M.CERDA, q = M.aCerda(X, Y), U0 = C.ou + Math.round((q[0] - C.ou) / C.paso) * C.paso, V0 = C.ov + Math.round((q[1] - C.ov) / C.paso) * C.paso;
    var a = Math.abs(q[0] - U0) - M.anchoCarrer / 2, b = Math.abs(q[1] - V0) - M.anchoCarrer / 2;
    var cruce = M.deCerda(U0, V0);
    return { si: a > -3 && b > -3 && a + b < 14 + C.calle - M.anchoCarrer / 2 + 4 && M.enEixample(cruce[0], cruce[1]), U: U0, V: V0, cruce: cruce };
  }
  function octogono(u0, v0) {   // la manzana que empieza en (u0, v0), con sus cuatro chaflanes
    var C = M.CERDA, m = C.paso - 2 * C.calle, e = C.calle;
    return [[CH, 0], [m - CH, 0], [m, CH], [m, m - CH], [m - CH, m], [CH, m], [0, m - CH], [0, CH], [CH, 0]].map(function (p) { return M.deCerda(u0 + e + p[0], v0 + e + p[1]); });
  }
  BC.registrar({
    id: 'cerda', n: 4, nombre: 'Plan Cerdà', tipo: 'Lugar',
    pista: 'Alguien cortó las esquinas de la ciudad para que se viera mejor.',
    detectar: function (api) {
      api.en('clic', function (d) {
        if (api.motor.cam.s < 0.79) return;
        var c = chaflan(d.X, d.Y); if (c.si) api.disparar({ U: c.U, V: c.V, cruce: c.cruce });
      });
    },
    escena: function (E, datos) {
      var L = E.lectura, C = M.CERDA;
      if (!datos) { var q = M.aCerda.apply(null, M.ll(41.3925, 2.1650)); datos = { U: C.ou + Math.round((q[0] - C.ou) / C.paso) * C.paso, V: C.ov + Math.round((q[1] - C.ov) / C.paso) * C.paso }; datos.cruce = M.deCerda(datos.U, datos.V); }
      var illes = [];
      for (var i = -9; i <= 8; i++) for (var j = -9; j <= 8; j++) {
        var u0 = datos.U + i * C.paso, v0 = datos.V + j * C.paso, cm = M.deCerda(u0 + C.paso / 2, v0 + C.paso / 2);
        if (!M.enEixample(cm[0], cm[1])) continue;
        illes.push({ p: octogono(u0, v0), d: Math.hypot(i + 0.5, j + 0.5) });
      }
      return {
        duracion: 12500 + L,
        tarjeta: { en: 4600, hasta: 11800 + L, titulo: 'Pla Cerdà',
          texto: 'En 1859 se aprobó el plan del ingeniero Ildefons Cerdà para que Barcelona creciera fuera de sus murallas: una cuadrícula de manzanas de unos 113 metros con las esquinas cortadas a 45°, los chaflanes, para ganar luz, aire y visibilidad en cada cruce.',
          pie: 'Ildefons Cerdà · Pla de l’Eixample · 1859' },
        inicio: function () { E.encuadrar(datos.cruce[0], datos.cruce[1], 0.55, 2400); },
        frente: function (ctx, t) {
          var a = 1 - U.tramo(t, 11800 + L, 12500 + L), r = U.tramo(t, 1500, 7500) * 13;
          ctx.save(); ctx.lineJoin = 'round';
          illes.forEach(function (il) {
            var f = U.clamp(r - il.d, 0, 1); if (f <= 0) return;
            var ola = 1 - U.clamp(r - il.d - 1, 0, 1);   // 1 cuando la onda pasa por la manzana, luego se queda en 0
            ctx.beginPath(); il.p.forEach(function (q, k) { var p = E.aPantalla(q[0], q[1]); k ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); }); ctx.closePath();
            ctx.globalAlpha = a * f * (0.1 + 0.3 * ola); ctx.fillStyle = BC.color.acento; ctx.fill();
            ctx.globalAlpha = a * f * 0.7; ctx.strokeStyle = 'rgba(20,17,15,0.8)'; ctx.lineWidth = 4.5 + 2 * ola; ctx.stroke();
            ctx.globalAlpha = a * f; ctx.strokeStyle = BC.color.acento; ctx.lineWidth = 2.2 + 1.6 * ola; ctx.stroke();
          });
          ctx.restore();
          FX.punto(ctx, datos.cruce[0], datos.cruce[1], 4.5, BC.color.acento, a * U.tramo(t, 800, 1400));
        }
      };
    }
  });
})();
