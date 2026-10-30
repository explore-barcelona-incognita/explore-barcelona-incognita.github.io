/* Secreto 08 · Camp Nou · la ola (Gesto)
   Una vuelta entera con el ratón (o arrastrando) alrededor del estadio: el trazo tiene que rodearlo (más de
   300° alrededor de su centro) y a una distancia razonable. La escena: el público hace la ola, una banda
   azulgrana que da dos vueltas a las gradas. */
(function () {
  'use strict';
  var BC = window.BC, U = BC.util, M = BC.mapa, FX = BC.fx;
  var AZULGRANA = ['#a50044', '#004d98', '#edbb00', '#fbf8f0'];
  function estadio() { return M.monumento('campnou'); }
  function centro(s) { return M.enMonumento(estadio(), 0, 64, s); }
  BC.registrar({
    id: 'campnou', n: 8, nombre: 'La ola del Camp Nou', tipo: 'Gesto',
    pista: 'Més que un club. Da una vuelta entera alrededor de su grada.',
    lugar: function () { return centro(0.5); }, radio: 260,
    detectar: function (api) {
      var ultimo = 0;
      api.en('cuadro', function () {
        var E = api.motor, r = E.rastro; if (E.escena || r.length < 12 || performance.now() - ultimo < 1500) return;
        var fin = r[r.length - 1], c = centro(fin.s), f = Math.max(1, Math.min(3.6, 0.9 / fin.s)), R = 136 * f;
        var giro = 0, prev = null, dmed = 0, n = 0;
        for (var i = r.length - 1; i >= 0 && fin.t - r[i].t < 2000; i--) {
          var q = r[i], ang = Math.atan2(q.Y - c[1], q.X - c[0]);
          if (prev != null) { var da = ang - prev; if (da > Math.PI) da -= 2 * Math.PI; if (da < -Math.PI) da += 2 * Math.PI; giro += da; }
          prev = ang; dmed += Math.hypot(q.X - c[0], q.Y - c[1]); n++;
        }
        dmed /= n;
        if (Math.abs(giro) > Math.PI * 1.67 && dmed > R * 0.5 && dmed < R * 3.5) { ultimo = performance.now(); r.length = 0; api.disparar(); }
      });
    },
    escena: function (E) {
      var L = E.lectura, m = estadio();
      return {
        duracion: 12500 + L,
        tarjeta: { en: 5000, hasta: 11800 + L, titulo: 'Camp Nou',
          texto: 'Se inauguró el 24 de septiembre de 1957, día de la Mercè, y es el estadio más grande de Europa: antes de las obras le cabían 99.354 personas. Reabrió en noviembre de 2025, aún en obras, y el plan es que supere las 105.000.',
          pie: 'Camp Nou · Les Corts · 1957' },
        inicio: function () { var c = centro(2.2); E.encuadrar(c[0], c[1], 2.2, 2600); },
        frente: function (ctx, t) {
          var a = 1 - U.tramo(t, 11800 + L, 12500 + L), s = E.cam.s, vuelta = (t - 2400) / 3000;
          if (vuelta < 0 || vuelta > 2.15) return;
          // la ola: en las gradas (elipses de 100 a 128 m del dibujo), un trozo de arco que se levanta al pasar
          var cabeza = vuelta * Math.PI * 2;
          for (var k = 0; k < 90; k++) {
            var ang = k / 90 * Math.PI * 2, atras = ((cabeza - ang) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
            if (atras > 1.1 || (vuelta < 1 && ang > cabeza)) continue;
            var alto = Math.sin(atras / 1.1 * Math.PI);   // se levanta y se vuelve a sentar
            for (var fila = 0; fila < 4; fila++) {
              var rr = 104 + fila * 6.5, q = M.enMonumento(m, Math.cos(ang) * rr * 1.06, 64 + Math.sin(ang) * rr * 0.585 + alto * 3, s), p = E.aPantalla(q[0], q[1]);
              ctx.globalAlpha = a * alto; ctx.fillStyle = AZULGRANA[(k + fila) % AZULGRANA.length];
              ctx.fillRect(p[0] - 2.2 * s, p[1] - (2 + alto * 4) * s, 4.4 * s, (2 + alto * 4) * s);
            }
          }
          ctx.globalAlpha = 1;
          var et = M.enMonumento(m, 0, 64, s);
          FX.etiqueta(ctx, 'Més que un club', et[0], et[1], { serif: true, tam: 26, alfa: a * U.tramo(t, 4200, 5000), color: '#edbb00' });
        }
      };
    }
  });
})();
