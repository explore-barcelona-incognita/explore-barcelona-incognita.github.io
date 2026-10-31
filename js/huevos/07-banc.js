/* Secreto 07 · Banc de Park Güell (Gesto)
   Un trazo en ola (con el ratón o arrastrando) por encima de Park Güell: avanza de lado y sube y baja al menos
   cuatro veces. La escena acerca el banco y una ola de colores de trencadís lo recorre de punta a punta. */
(function () {
  'use strict';
  var BC = window.BC, U = BC.util, M = BC.mapa, FX = BC.fx;
  var COLORES = ['#2f86bf', '#f2b33d', '#f4efe3', '#c9693e', '#6fa64c', '#5cc4c8', '#d84b3a', '#e8d05a'];
  function parque() { return M.monumento('guell'); }
  function fz(m, s) { return Math.max(1, Math.min(3.6, 0.9 / s)) * (m.esc || 1); }
  BC.registrar({
    id: 'banc', n: 7, nombre: 'Banc del Park Güell', tipo: 'Gest',
    pista: 'Al parc, el banc fa ones. Fes-ne tu també per sobre.',
    lugar: function () { var m = parque(); return [m.X, m.Y - 40 * fz(m, 0.5)]; }, radio: 260,
    detectar: function (api) {
      var ultimo = 0;
      api.en('cuadro', function () {
        var E = api.motor, r = E.rastro; if (E.escena || r.length < 10 || performance.now() - ultimo < 1500) return;
        var m = parque(), f = fz(m, E.cam.s), cx = m.X, cy = m.Y - 40 * f, R = Math.max(140 * f, 200 / E.cam.s);
        var fin = r[r.length - 1], tramo = [];
        for (var i = r.length - 1; i >= 0 && fin.t - r[i].t < 1600; i--) tramo.unshift(r[i]);
        if (tramo.length < 10) return;
        var ini = tramo[0], cuerda = Math.hypot(fin.x - ini.x, fin.y - ini.y); if (cuerda < 120) return;
        // ¿por encima del parque? (en el mapa)
        var mx = 0, my = 0; tramo.forEach(function (q) { mx += q.X; my += q.Y; }); mx /= tramo.length; my /= tramo.length;
        if (Math.hypot(mx - cx, my - cy) > R) return;
        // las subidas y bajadas respecto a la cuerda, en pantalla
        var ux = (fin.x - ini.x) / cuerda, uy = (fin.y - ini.y) / cuerda, signo = 0, giros = 0, extremo = 0, amp = 0;
        tramo.forEach(function (q) {
          var d = (q.x - ini.x) * -uy + (q.y - ini.y) * ux;
          if (signo >= 0 && d < extremo - 14) { if (signo > 0) giros++; signo = -1; extremo = d; }
          else if (signo <= 0 && d > extremo + 14) { if (signo < 0) giros++; signo = 1; extremo = d; }
          else if ((signo > 0 && d > extremo) || (signo < 0 && d < extremo)) extremo = d;
          amp = Math.max(amp, Math.abs(d));
        });
        if (giros >= 4 && amp < cuerda * 0.6) { ultimo = performance.now(); r.length = 0; api.disparar(); }
      });
    },
    escena: function (E) {
      var L = E.lectura, m = parque(), MO = BC.mosaico, cam = {}, nombre = MO.texto('TRENCADÍS', 96, 7.5);
      function P(x, y, s) { return E.aPantalla(m.X + x * fz(m, s), m.Y - y * fz(m, s)); }
      function banco(x) { return 60 + 2.4 * Math.sin(x / 4.2); }
      return {
        duracion: 13000 + L,
        tarjeta: { en: 5200, hasta: 12300 + L, titulo: 'El banc ondulat',
          texto: 'El banc que envolta la gran plaça del Park Güell es va construir entre el 1909 i el 1914. Gaudí en va dibuixar les corbes i Josep Maria Jujol el va cobrir de trencadís: trossos de rajola, de plat i d’ampolla de tots els colors. Se sol dir que fa uns 110 metres.',
          pie: 'Antoni Gaudí · Josep Maria Jujol · Park Güell, 1909–1914' },
        inicio: function () { var s = 3.6, f = fz(m, s); E.encuadrar(m.X, m.Y - 48 * f, s, 2600); },
        cuadro: function (t) { MO.respirar(E, cam, t, 2700, 13000 + L, 0.06); },
        frente: function (ctx, t) {
          var a = 1 - U.tramo(t, 12300 + L, 13000 + L), s = E.cam.s, k = s / 3.6, c = [m.X, m.Y - 48 * fz(m, s)];
          FX.foco(ctx, c[0], c[1], 150 * s * 0.6, U.tramo(t, 1800, 3200) * a);
          // la ola: las piezas del banco saltan de su sitio y se vuelven a posar, de punta a punta y de vuelta
          var ola = (t - 2400) / 2600;
          if (ola > 0) {
            var cresta = ola % 2 < 1 ? ola % 2 : 2 - ola % 2;
            for (var x = -62; x <= 62; x += 2.6) for (var f = 0; f < 2; f++) {
              var u = (x + 62) / 124, sube = Math.max(0, 1 - Math.abs(u - cresta) * 7); if (sube <= 0.02) continue;
              var p = P(x + f * 1.3, banco(x) - 1.6 + f * 2.6 + sube * 9, s);
              MO.tesela(ctx, p[0], p[1], 4.8 * k * 3.6 * 0.32 * (1 + sube * 0.4), COLORES[((Math.floor(x * 3) + f * 5) % COLORES.length + COLORES.length) % COLORES.length], 1, 700 + Math.floor(x * 7) + f, { alfa: a * Math.min(1, sube * 2.5), alto: 1 + sube * 3, ang: (sube - 0.5) * 0.8 });
            }
          }
          var pt = P(0, 88, s), en = 0.6 * Math.max(0.8, Math.min(1.2, k));
          MO.pintarTexto(ctx, nombre, pt[0], Math.max(nombre.h * en / 2 + 24, pt[1]), U.tramo(t, 5400, 8000), { esc: en, salida: U.tramo(t, 11400 + L, 12800 + L), paleta: COLORES });
        }
      };
    }
  });
})();
