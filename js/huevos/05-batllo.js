/* Secreto 05 · Casa Batlló · el dragón (Teclado)
   Se escribe JORDI (el santo que venció al dragón). La escena acerca la casa: una ola de luz recorre las escamas
   del tejado (el lomo del dragón) y la torre con su cruz se enciende de oro, como la lanza que lo atraviesa. */
(function () {
  'use strict';
  var BC = window.BC, U = BC.util, M = BC.mapa, FX = BC.fx;
  var PALABRA = 'JORDI', ESCAMAS = ['#2f8f7a', '#3aa08a', '#c9693e', '#e8a23a', '#7a3fa0', '#2f5fae', '#5fae7a'];
  function casa() { return M.monumento('batllo'); }
  BC.registrar({
    id: 'batllo', n: 5, nombre: 'El dragón de la Casa Batlló', tipo: 'Teclado',
    pista: 'Una casa con escamas en el tejado. Escribe el nombre de quien venció al dragón.',
    detectar: function (api) {
      var buf = '';
      api.en('tecla', function (d) {
        if (api.motor.escena || d.key.length !== 1) return;
        buf = (buf + d.key.toUpperCase()).slice(-PALABRA.length);
        if (buf === PALABRA) { buf = ''; api.disparar(); }
      });
    },
    escena: function (E) {
      var L = E.lectura, m = casa();
      // el lomo: la curva del tejado del dibujo (de −26 a 18 m, y ≈ 82–101)
      function lomo(x) { var t = (x + 26) / 44; return 84 + 17 * Math.sin(t * Math.PI) * (1 - 0.25 * t); }
      return {
        duracion: 12500 + L,
        tarjeta: { en: 4600, hasta: 11800 + L, titulo: 'El dragón',
          texto: 'Gaudí reformó esta casa entre 1904 y 1906. La lectura más popular es la leyenda de Sant Jordi: el tejado sería el lomo del dragón, con escamas de cerámica; la torre con su cruz, la lanza que lo atraviesa; y los balcones y las columnas, los huesos de sus víctimas.',
          pie: 'Casa Batlló · Antoni Gaudí · 1904–1906' },
        inicio: function () { var c = M.enMonumento(m, 0, 70, 3.4); E.encuadrar(c[0], c[1], 3.4, 2600); },
        frente: function (ctx, t) {
          var a = 1 - U.tramo(t, 11800 + L, 12500 + L), s = E.cam.s;
          // la ola de luz por las escamas (ida y vuelta)
          var ola = (t - 2200) / 2600; if (ola < 0) return;
          var fase = ola % 2, cresta = fase < 1 ? fase : 2 - fase;
          for (var x = -24; x <= 16; x += 1.6) {
            var u = (x + 26) / 44, cerca = Math.max(0, 1 - Math.abs(u - cresta) * 5); if (cerca <= 0) continue;
            for (var k = 0; k < 3; k++) {
              var y = lomo(x) - 2 - k * 3.2, p = E.aPantalla.apply(null, M.enMonumento(m, x + (k % 2) * 0.8, y, s)), r = (0.9 + cerca * 1.3) * s * 1.35;
              ctx.globalAlpha = a * cerca; ctx.fillStyle = 'rgba(20,17,15,0.6)'; ctx.beginPath(); ctx.arc(p[0], p[1], r + 1.2, 0, 6.2832); ctx.fill();
              ctx.fillStyle = ESCAMAS[(Math.floor(x * 1.7) + k + 7) % ESCAMAS.length]; ctx.beginPath(); ctx.arc(p[0], p[1], r, 0, 6.2832); ctx.fill();
            }
          }
          ctx.globalAlpha = 1;
          // la lanza: la torre y la cruz se encienden y bajan hasta el lomo
          var g = U.suave(U.tramo(t, 3800, 5600)), lanza = [M.enMonumento(m, 22, 119, s), M.enMonumento(m, 22, 119 - 34 * g, s)];
          FX.linea(ctx, lanza, 1, 8, 'rgba(20,17,15,0.55)', a * g); FX.linea(ctx, lanza, 1, 4, BC.color.acento, a * g);
          var cruz = M.enMonumento(m, 22, 114, s);
          FX.linea(ctx, [[cruz[0] - 4.5, cruz[1]], [cruz[0] + 4.5, cruz[1]]], 1, 4, BC.color.acento, a * g);
          var et = M.enMonumento(m, 22, 124, s);
          FX.etiqueta(ctx, 'Sant Jordi', et[0], et[1], { serif: true, tam: 24, dy: -16, alfa: a * U.tramo(t, 5000, 5800), color: BC.color.acento });
        }
      };
    }
  });
})();
