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
      var L = E.lectura, m = estadio(), MO = BC.mosaico, cam = {}, lema = MO.texto('MÉS QUE UN CLUB', 96, 7.5), confeti = MO.confeti(80, MO.AZULGRANA, 23);
      return {
        duracion: 13000 + L,
        tarjeta: { en: 5600, hasta: 12300 + L, titulo: 'Camp Nou',
          texto: 'Se inauguró el 24 de septiembre de 1957, día de la Mercè, y es el estadio más grande de Europa: antes de las obras le cabían 99.354 personas. Reabrió en noviembre de 2025, aún en obras, y el plan es que supere las 105.000.',
          pie: 'Camp Nou · Les Corts · 1957' },
        inicio: function () { var c = centro(2.4); E.encuadrar(c[0], c[1], 2.4, 2600); },
        cuadro: function (t) { MO.respirar(E, cam, t, 2700, 13000 + L, 0.06); },
        frente: function (ctx, t) {
          var a = 1 - U.tramo(t, 12300 + L, 13000 + L), s = E.cam.s, k = s / 2.4, cc = centro(s);
          FX.foco(ctx, cc[0], cc[1], 160 * s, U.tramo(t, 1800, 3200) * a);
          // la ola: en las gradas, las teselas de los aficionados se levantan al pasar y se vuelven a sentar (dos vueltas)
          var vuelta = (t - 2400) / 3000;
          if (vuelta > 0 && vuelta < 2.2) {
            var cabeza = vuelta * Math.PI * 2;
            for (var n = 0; n < 96; n++) {
              var ang = n / 96 * Math.PI * 2, atras = ((cabeza - ang) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
              if (atras > 1.0 || (vuelta < 1 && ang > cabeza)) continue;
              var alto = Math.sin(atras / 1.0 * Math.PI);
              for (var fila = 0; fila < 3; fila++) {
                var rr = 106 + fila * 7.5, q = M.enMonumento(m, Math.cos(ang) * rr * 1.06, 64 + Math.sin(ang) * rr * 0.585 + alto * 3.5, s), p = E.aPantalla(q[0], q[1]);
                MO.tesela(ctx, p[0], p[1], 3.4 * k * (1 + alto * 0.5), MO.AZULGRANA[(n + fila) % 3], 1, 800 + n * 3 + fila, { alfa: a * alto, alto: 1 + alto * 2.5 });
              }
            }
          }
          // el gol: confeti azulgrana desde el centro del campo, y el lema en teselas
          var pc = E.aPantalla(cc[0], cc[1]);   // el centro del campo, en pantalla
          if (t > 7400) MO.pintarConfeti(ctx, confeti, pc[0], pc[1], t - 7400, k * 1.2);
          var en = 0.5 * Math.max(0.8, Math.min(1.2, k));
          MO.pintarTexto(ctx, lema, pc[0], Math.max(lema.h * en / 2 + 24, pc[1] - 130 * s), U.tramo(t, 5600, 8400), { esc: en, salida: U.tramo(t, 11400 + L, 12800 + L) });
        }
      };
    }
  });
})();
