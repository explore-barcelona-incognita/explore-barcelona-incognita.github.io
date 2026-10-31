/* Secreto 05 · Casa Batlló · el dragón (Teclado)
   Se escribe JORDI (el santo que venció al dragón). La escena acerca la casa: una ola de luz recorre las escamas
   del tejado (el lomo del dragón) y la torre con su cruz se enciende de oro, como la lanza que lo atraviesa. */
(function () {
  'use strict';
  var BC = window.BC, U = BC.util, M = BC.mapa, FX = BC.fx;
  var PALABRA = 'JORDI', ESCAMAS = ['#2f8f7a', '#3aa08a', '#c9693e', '#e8a23a', '#7a3fa0', '#2f5fae', '#5fae7a'];
  function casa() { return M.monumento('batllo'); }
  BC.registrar({
    id: 'batllo', n: 5, nombre: 'El drac de la Casa Batlló', tipo: 'Teclat',
    pista: 'Una casa amb escates a la teulada. Escriu el nom de qui va vèncer el drac.',
    detectar: function (api) {
      var buf = '';
      api.en('tecla', function (d) {
        if (api.motor.escena || d.key.length !== 1) return;
        buf = (buf + d.key.toUpperCase()).slice(-6);
        if (/(JORDI|JORGE|GEORGE)$/.test(buf)) { buf = ''; api.disparar(); }   // Sant Jordi, San Jorge o Saint George, según el idioma
      });
    },
    escena: function (E) {
      var L = E.lectura, m = casa(), MO = BC.mosaico, cam = {}, nombre = MO.texto(BC.idioma.palabra('SANT JORDI'), 96, 7.5);
      // el lomo: la curva del tejado del dibujo (de −26 a 18 m, y ≈ 82–101)
      function lomo(x) { var t = (x + 26) / 44; return 84 + 17 * Math.sin(t * Math.PI) * (1 - 0.25 * t); }
      function P(lx, ly) { return E.aPantalla.apply(null, M.enMonumento(m, lx, ly, E.cam.s)); }
      // la rosa de Sant Jordi: un plato redondo de teselas rojas (pétalos en espiral) con dos hojas
      function rosa(ctx, x, y, r, u) {
        if (u <= 0) return;
        for (var i = 0; i < 14; i++) { var an = i * 2.39996, rr = r * Math.sqrt((i + 0.5) / 14) * 0.95; MO.tesela(ctx, x + Math.cos(an) * rr, y + Math.sin(an) * rr, r * 0.32, ['#c43b2b', '#a8282a', '#d8452f', '#8f1f22'][i % 4], (u - i * 0.03) / 0.5, 300 + i); }
        [[-1, 1.4], [1, 1.6]].forEach(function (h, j) { MO.tesela(ctx, x + h[0] * r * 0.9, y + r * h[1], r * 0.42, '#4f8a3c', (u - 0.5) / 0.4, 320 + j, { ang: h[0] * 0.6 }); });
      }
      return {
        duracion: 13000 + L,
        tarjeta: { en: 5400, hasta: 12300 + L, titulo: 'El drac',
          texto: 'Gaudí va reformar aquesta casa entre el 1904 i el 1906. La lectura més popular és la llegenda de Sant Jordi: la teulada seria l’esquena del drac, amb escates de ceràmica; la torre amb la creu, la llança que el travessa; i els balcons i les columnes, els ossos de les seves víctimes.',
          pie: 'Casa Batlló · Antoni Gaudí · 1904–1906' },
        inicio: function () { var c = M.enMonumento(m, 0, 66, 3.6); E.encuadrar(c[0], c[1], 3.6, 2600); },
        cuadro: function (t) { MO.respirar(E, cam, t, 2700, 13000 + L, 0.06); },
        frente: function (ctx, t) {
          var a = 1 - U.tramo(t, 12300 + L, 13000 + L), s = E.cam.s, k = s / 3.6, c = M.enMonumento(m, 0, 60, s);
          FX.foco(ctx, c[0], c[1], 130 * s * 0.6, U.tramo(t, 1800, 3200) * a);
          // 1 · el dragón respira: las escamas del lomo se levantan en ola, una a una, y se vuelven a posar
          var ola = (t - 2200) / 2400;
          if (ola > 0) {
            var cresta = (ola % 2 < 1 ? ola % 2 : 2 - ola % 2);
            for (var x = -24; x <= 16; x += 2.2) for (var f = 0; f < 3; f++) {
              var u = (x + 26) / 44, sube = Math.max(0, 1 - Math.abs(u - cresta) * 5); if (sube <= 0.02) continue;
              var p = P(x + (f % 2) * 1.1, lomo(x) - 2.5 - f * 3.4 + sube * 2.5);
              MO.tesela(ctx, p[0], p[1], 4.2 * k * 3.6 * (0.7 + sube * 0.6), ['#2f8f7a', '#3aa08a', '#e8a23a', '#7a3fa0', '#2f5fae', '#5fae7a'][(Math.floor(x) + f + 30) % 6], 1, 400 + Math.floor(x * 3) + f, { alfa: a * sube, alto: 1 + sube * 2, ang: sube * 0.5 });
            }
          }
          // 2 · la lanza: la torre y la cruz se montan en oro y bajan hasta el lomo
          var g = U.tramo(t, 3600, 5400);
          MO.cadena(ctx, [M.enMonumento(m, 22, 122, s), M.enMonumento(m, 22, 86, s)], g, { tam: 9 * k, alfa: a, semilla: 77 });
          MO.cadena(ctx, [M.enMonumento(m, 17.5, 114, s), M.enMonumento(m, 26.5, 114, s)], U.tramo(t, 5000, 5600), { tam: 8 * k, alfa: a, semilla: 78, junta: false });
          // 3 · la rosa de Sant Jordi, en el balcón de en medio
          var pr = P(0, 46); rosa(ctx, pr[0], pr[1], 30 * k, U.tramo(t, 6000, 7600) * a);
          // 4 · el nombre del santo, en teselas de oro, encima de la torre
          var pt = P(10, 132), en = 0.55 * Math.max(0.8, Math.min(1.2, k));
          MO.pintarTexto(ctx, nombre, Math.min(E.W - nombre.w * en / 2 - 20, pt[0]), Math.max(nombre.h * en / 2 + 24, pt[1]), U.tramo(t, 5600, 8200), { esc: en, salida: U.tramo(t, 11400 + L, 12800 + L) });
        }
      };
    }
  });
})();
