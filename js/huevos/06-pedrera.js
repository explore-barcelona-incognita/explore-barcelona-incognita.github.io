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
      var L = E.lectura, m = casa();
      return {
        duracion: 12500 + L,
        tarjeta: { en: 4800, hasta: 11800 + L, titulo: 'Los guerreros',
          texto: 'La Casa Milà, que todo el mundo llama La Pedrera, se construyó entre 1906 y 1912. En su azotea, las chimeneas y las salidas de escalera parecen soldados con casco montando guardia; por eso la llaman «el jardín de los guerreros». Desde 1984 es Patrimonio Mundial.',
          pie: 'Casa Milà · Antoni Gaudí · 1906–1912' },
        inicio: function () { var c = M.enMonumento(m, 0, 60, 3.2); E.encuadrar(c[0], c[1], 3.2, 2600); },
        frente: function (ctx, t) {
          var a = 1 - U.tramo(t, 11800 + L, 12500 + L), s = E.cam.s;
          GUERREROS.forEach(function (x, k) {
            var b = 70 + 4 * Math.sin(x / 9), alto = 12 + (k % 2) * 4;
            var abre = U.suave(U.tramo(t, 2400 + k * 260, 3000 + k * 260));   // los ojos se abren uno tras otro
            if (abre <= 0) return;
            // hacia dónde miran: a un lado, al otro y, al final, de frente (a ti)
            var mira = t < 5200 ? Math.sin((t - 2400) / 500 + k) : t < 7600 ? -0.8 * Math.sin((t - 5200) / 380) : 0;
            var guinyo = (t > 8200 && t < 8450 && k === 2) ? 0.15 : 1;   // uno te guiña el ojo
            [-1, 1].forEach(function (lado) {
              var p = E.aPantalla.apply(null, M.enMonumento(m, x + lado * 1.15, b + alto * 0.62, s)), rx = 0.85 * s * 1.25, ry = rx * 0.75 * abre * guinyo;
              ctx.globalAlpha = a; ctx.fillStyle = '#fbf8f0'; ctx.strokeStyle = 'rgba(20,17,15,0.85)'; ctx.lineWidth = Math.max(1, s * 0.3);
              ctx.beginPath(); ctx.ellipse(p[0], p[1], rx, Math.max(0.5, ry), 0, 0, 6.2832); ctx.fill(); ctx.stroke();
              if (ry > 1) { ctx.fillStyle = '#14110f'; ctx.beginPath(); ctx.arc(p[0] + mira * rx * 0.45, p[1] + ry * 0.1, Math.min(rx, ry) * 0.55, 0, 6.2832); ctx.fill(); }
            });
          });
          ctx.globalAlpha = 1;
          var et = M.enMonumento(m, 0, 96, s);
          FX.etiqueta(ctx, 'El jardín de los guerreros', et[0], et[1], { serif: true, tam: 24, dy: -10, alfa: a * U.tramo(t, 5200, 6000), color: BC.color.acento });
        }
      };
    }
  });
})();
