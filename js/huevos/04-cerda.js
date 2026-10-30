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
      var L = E.lectura, C = M.CERDA, MO = BC.mosaico, cam = {}, ano = MO.texto('1859', 96, 7.5);
      if (!datos) { var q = M.aCerda.apply(null, M.ll(41.3925, 2.1650)); datos = { U: C.ou + Math.round((q[0] - C.ou) / C.paso) * C.paso, V: C.ov + Math.round((q[1] - C.ov) / C.paso) * C.paso }; datos.cruce = M.deCerda(datos.U, datos.V); }
      var illes = [], cerca = [];
      for (var i = -9; i <= 8; i++) for (var j = -9; j <= 8; j++) {
        var u0 = datos.U + i * C.paso, v0 = datos.V + j * C.paso, cm = M.deCerda(u0 + C.paso / 2, v0 + C.paso / 2);
        if (!M.enEixample(cm[0], cm[1])) continue;
        var d = Math.hypot(i + 0.5, j + 0.5);
        illes.push({ p: octogono(u0, v0), d: d });
        // en las manzanas más cercanas, los cuatro chaflanes se montan con teselas de oro
        if (d < 2.4) [[0, 0, 1, 1], [1, 0, -1, 1], [1, 1, -1, -1], [0, 1, 1, -1]].forEach(function (e) {
          var m0 = C.paso - 2 * C.calle, bu = u0 + C.calle + e[0] * m0, bv = v0 + C.calle + e[1] * m0;
          cerca.push({ p: [M.deCerda(bu + e[2] * CH, bv), M.deCerda(bu, bv + e[3] * CH)], d: d });
        });
      }
      return {
        duracion: 13000 + L,
        tarjeta: { en: 5200, hasta: 12300 + L, titulo: 'Pla Cerdà',
          texto: 'En 1859 se aprobó el plan del ingeniero Ildefons Cerdà para que Barcelona creciera fuera de sus murallas: una cuadrícula de manzanas de unos 113 metros con las esquinas cortadas a 45°, los chaflanes, para ganar luz, aire y visibilidad en cada cruce.',
          pie: 'Ildefons Cerdà · Pla de l’Eixample · 1859' },
        inicio: function () { E.encuadrar(datos.cruce[0], datos.cruce[1], 0.7, 2400); },
        cuadro: function (t) { MO.respirar(E, cam, t, 2600, 13000 + L, 0.08); },
        frente: function (ctx, t) {
          var a = 1 - U.tramo(t, 12300 + L, 13000 + L), r = U.tramo(t, 1800, 8200) * 13, k = E.cam.s / 0.7;
          // 1 · la onda: cada manzana se ilumina con un lavado de oro y un filete que se queda
          ctx.save(); ctx.lineJoin = 'round';
          illes.forEach(function (il) {
            var f = U.clamp(r - il.d, 0, 1); if (f <= 0) return;
            var ola = 1 - U.clamp(r - il.d - 1, 0, 1);
            ctx.beginPath(); il.p.forEach(function (q, n) { var p = E.aPantalla(q[0], q[1]); n ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); }); ctx.closePath();
            ctx.globalAlpha = a * f * (0.06 + 0.26 * ola); ctx.fillStyle = BC.color.acento; ctx.fill();
            ctx.globalAlpha = a * f * 0.6; ctx.strokeStyle = 'rgba(20,17,15,0.75)'; ctx.lineWidth = 3.6; ctx.stroke();
            ctx.globalAlpha = a * f * 0.9; ctx.strokeStyle = BC.color.acento; ctx.lineWidth = 1.6; ctx.stroke();
          });
          ctx.restore();
          // 2 · los chaflanes de alrededor del cruce, tesela a tesela (la idea de Cerdà, de cerca)
          cerca.forEach(function (c, n) { MO.cadena(ctx, c.p, U.tramo(t, 1600 + c.d * 700, 2600 + c.d * 700), { tam: 7 * k, alfa: a, semilla: 60 + n }); });
          var pc = E.aPantalla(datos.cruce[0], datos.cruce[1]);
          MO.tesela(ctx, pc[0], pc[1], 12 * k, '#f2b33d', U.tramo(t, 1200, 1700), 9);
          // 3 · el año del plan, en teselas, encima del cruce
          var en = 0.62 * Math.max(0.8, Math.min(1.2, k));
          MO.pintarTexto(ctx, ano, pc[0], Math.max(ano.h * en / 2 + 24, pc[1] - 150 * k), U.tramo(t, 5200, 7600), { esc: en, salida: U.tramo(t, 11400 + L, 12800 + L) });
        }
      };
    }
  });
})();
