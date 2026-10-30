/* Secreto 06 · La Pedrera · los guerreros (Mirada)
   Hay que acercarse y quedarse mirándola: la casa en el centro de la vista, de cerca y sin mover la cámara, 4 s.
   La escena: a las chimeneas-guerrero de la azotea se les abren los ojos, miran a un lado y al otro y, al final,
   te miran a ti. Se vuelve a armar al dejar de mirarla. */
(function () {
  'use strict';
  var BC = window.BC, U = BC.util, M = BC.mapa, FX = BC.fx;
  var GUERREROS = [-34, -18, -2, 14, 32];   // los mismos del dibujo del monumento
  function casa() { return M.monumento('pedrera'); }
  BC.registrar({
    id: 'pedrera', n: 6, nombre: 'Los guerreros de La Pedrera', tipo: 'Mirada',
    pista: 'En su azotea montan guardia. Mírala un rato… y te mirarán.',
    lugar: function () { return M.enMonumento(casa(), 0, 45, 1.2); }, zmin: 0.3, radio: 260,
    detectar: function (api) {
      var mirando = 0, armado = true;
      api.en('cuadro', function (d) {
        var E = api.motor, m = casa(), c = M.enMonumento(m, 0, 45, E.cam.s), p = E.aPantalla(c[0], c[1]);
        var dentro = E.cam.s >= 1.0 && Math.hypot(p[0] - E.W / 2, p[1] - E.H / 2) < Math.min(E.W, E.H) * 0.2;
        if (!dentro) { mirando = 0; armado = true; return; }
        if (!armado || E.escena || E.bloqueado) return;
        mirando = d.moviendo ? Math.max(0, mirando - d.dt * 2) : mirando + d.dt;
        if (mirando > 4000) { mirando = 0; armado = false; api.disparar(); }
      });
    },
    escena: function (E) {
      var L = E.lectura, m = casa(), MO = BC.mosaico, cam = {}, nombre = MO.texto('GUERRERS', 96, 7.5);
      function P(lx, ly) { return E.aPantalla.apply(null, M.enMonumento(m, lx, ly, E.cam.s)); }
      return {
        duracion: 13000 + L,
        tarjeta: { en: 5400, hasta: 12300 + L, titulo: 'Los guerreros',
          texto: 'La Casa Milà, que todo el mundo llama La Pedrera, se construyó entre 1906 y 1912. En su azotea, las chimeneas y las salidas de escalera parecen soldados con casco montando guardia; por eso la llaman «el jardín de los guerreros». Desde 1984 es Patrimonio Mundial.',
          pie: 'Casa Milà · Antoni Gaudí · 1906–1912' },
        inicio: function () { var c = M.enMonumento(m, 0, 66, 3.6); E.encuadrar(c[0], c[1], 3.6, 2600); },
        cuadro: function (t) { MO.respirar(E, cam, t, 2700, 13000 + L, 0.06); },
        frente: function (ctx, t) {
          var a = 1 - U.tramo(t, 12300 + L, 13000 + L), s = E.cam.s, k = s / 3.6, c = M.enMonumento(m, 0, 66, s);
          FX.foco(ctx, c[0], c[1], 150 * s * 0.6, U.tramo(t, 1800, 3200) * a);
          GUERREROS.forEach(function (x, n) {
            var b = 70 + 4 * Math.sin(x / 9), alto = 12 + (n % 2) * 4, abre = U.tramo(t, 2400 + n * 300, 3100 + n * 300);
            if (abre <= 0) return;
            // hacia dónde miran: a un lado, al otro y, al final, de frente (a ti); uno te guiña el ojo
            var mira = t < 5400 ? Math.sin((t - 2400) / 520 + n) : t < 7800 ? -0.8 * Math.sin((t - 5400) / 400) : 0;
            var guinyo = t > 8400 && t < 8700 && n === 2;
            // el guerrero se vuelve: un brillo de esmalte en el casco cuando se despierta
            var pc = P(x, b + alto + 3.6); MO.halo(ctx, pc[0], pc[1], 26 * k, '#fff3cf', a * U.meseta(t, 2400 + n * 300, 2800 + n * 300, 3400 + n * 300, 4400 + n * 300));
            [-1, 1].forEach(function (lado) {
              var p = P(x + lado * 1.25, b + alto * 0.62), r = 4.6 * k;
              if (guinyo && lado > 0) { MO.tesela(ctx, p[0], p[1] + r * 0.2, r * 0.9, '#2a2420', 1, 600 + n, { alfa: a, ang: 1.57, sombra: false }); return; }
              MO.tesela(ctx, p[0], p[1], r, '#fbf8f0', abre, 500 + n * 2 + (lado > 0 ? 1 : 0), { alfa: a });   // el ojo: una tesela blanca
              if (abre >= 1) MO.tesela(ctx, p[0] + mira * r * 0.42, p[1] + r * 0.08, r * 0.52, '#14110f', 1, 520 + n, { alfa: a, sombra: false });   // la pupila
            });
          });
          var pt = P(0, 104), en = 0.6 * Math.max(0.8, Math.min(1.2, k));
          MO.pintarTexto(ctx, nombre, pt[0], Math.max(nombre.h * en / 2 + 24, pt[1]), U.tramo(t, 5600, 8200), { esc: en, salida: U.tramo(t, 11400 + L, 12800 + L) });
        }
      };
    }
  });
})();
