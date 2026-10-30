/* Secreto 11 · Onze de Setembre (Teclado)
   Once secretos por el 11 de septiembre (lo pidió Pau). Se escribe 1714. La escena baja al Fossar de les Moreres,
   junto a Santa Maria del Mar: el arco de pórfido rojo, el pebetero con la llama que no se apaga y, debajo,
   el verso de Frederic Soler (Pitarra). */
(function () {
  'use strict';
  var BC = window.BC, U = BC.util, M = BC.mapa, FX = BC.fx;
  var FOSSAR = M.ll(41.38345, 2.18168), CLAVE = '1714';
  BC.registrar({
    id: 'onze', n: 11, nombre: 'Onze de Setembre', tipo: 'Teclado',
    pista: 'Un año que la ciudad no olvida. Cuatro cifras.',
    detectar: function (api) {
      var buf = '';
      api.en('tecla', function (d) {
        if (api.motor.escena || d.key.length !== 1) return;
        buf = (buf + d.key).slice(-CLAVE.length);
        if (buf === CLAVE) { buf = ''; api.disparar(); }
      });
    },
    escena: function (E) {
      var L = E.lectura;
      function llama(ctx, x, y, e, t) {   // capas de gota que tiemblan, del rojo al oro
        [['#c43b2b', 1], ['#e8663a', 0.78], ['#f2b33d', 0.55], ['#fbe6a8', 0.3]].forEach(function (c, k) {
          var w = e * c[1] * (0.42 + 0.04 * Math.sin(t / 130 + k)), h = e * c[1] * (1.25 + 0.12 * Math.sin(t / 170 + k * 2)), sx = Math.sin(t / 210 + k) * e * 0.06;
          ctx.fillStyle = c[0]; ctx.beginPath(); ctx.moveTo(x - w, y); ctx.quadraticCurveTo(x - w, y - h * 0.55, x + sx, y - h); ctx.quadraticCurveTo(x + w, y - h * 0.55, x + w, y); ctx.quadraticCurveTo(x, y + w * 0.5, x - w, y); ctx.fill();
        });
      }
      return {
        duracion: 14000 + L,
        tarjeta: { en: 4800, hasta: 13300 + L, titulo: 'Onze de Setembre',
          texto: 'En el Fossar de les Moreres, junto a Santa Maria del Mar, se enterró a los defensores que murieron en el asedio de 1713–1714. Barcelona cayó el 11 de septiembre de 1714, y ese día es hoy la Diada Nacional de Catalunya. Aquí arde una llama que no se apaga, bajo un verso de Pitarra: <i>«Al fossar de les moreres no s’hi enterra cap traïdor».</i>',
          pie: 'Fossar de les Moreres · 11.09.1714' },
        inicio: function () { E.encuadrar(FOSSAR[0], FOSSAR[1], 3.6, 2600); },
        frente: function (ctx, t) {
          var a = 1 - U.tramo(t, 13300 + L, 14000 + L), s = E.cam.s, p = E.aPantalla(FOSSAR[0], FOSSAR[1]), e = 9 * s;
          FX.foco(ctx, FOSSAR[0], FOSSAR[1], 140 * s, U.tramo(t, 1600, 3000) * a);
          var g = U.suave(U.tramo(t, 1800, 3600));
          if (g <= 0) return;
          ctx.save(); ctx.globalAlpha = a * g;
          // el arco de pórfido rojo (el monumento de Viaplana y Fiol), en curva
          ctx.strokeStyle = '#7a1f1c'; ctx.lineWidth = e * 0.6; ctx.lineCap = 'butt';
          ctx.beginPath(); ctx.arc(p[0], p[1] + e * 5.5, e * 6, Math.PI * 1.18, Math.PI * 1.82); ctx.stroke();
          ctx.strokeStyle = 'rgba(255,220,180,0.35)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(p[0], p[1] + e * 5.5, e * 5.72, Math.PI * 1.18, Math.PI * 1.82); ctx.stroke();
          // el pebetero: un mástil de hierro con la llama arriba
          ctx.strokeStyle = '#2f3a36'; ctx.lineWidth = Math.max(2, e * 0.14); ctx.beginPath(); ctx.moveTo(p[0] + e * 2.2, p[1] + e * 0.4); ctx.lineTo(p[0] + e * 2.2, p[1] - e * 2.6); ctx.stroke();
          ctx.fillStyle = '#2f3a36'; ctx.beginPath(); ctx.ellipse(p[0] + e * 2.2, p[1] - e * 2.6, e * 0.4, e * 0.16, 0, 0, 6.2832); ctx.fill();
          if (t > 3000) llama(ctx, p[0] + e * 2.2, p[1] - e * 2.66, e * Math.min(1, (t - 3000) / 900), t);
          ctx.restore();
          FX.etiqueta(ctx, '1714', FOSSAR[0], FOSSAR[1], { serif: true, tam: 34, dy: -e * 7.5, alfa: a * U.tramo(t, 3600, 4400), color: BC.color.acento });
        }
      };
    }
  });
})();
