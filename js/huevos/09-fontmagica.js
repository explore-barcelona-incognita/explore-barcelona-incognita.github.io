/* Secreto 09 · Font Màgica (Lugar)
   Un clic en la fuente que hay delante del MNAC (la pila con surtidores del dibujo), algo de cerca. La escena:
   la fuente baila, con chorros que suben y bajan a compás y cambian de color. */
(function () {
  'use strict';
  var BC = window.BC, U = BC.util, M = BC.mapa, FX = BC.fx;
  var COLORES = ['#5fb6e4', '#e05aa8', '#f2b33d', '#6fd08a', '#9a7ae0', '#f4fbfd'];
  function palau() { return M.monumento('mnac'); }
  BC.registrar({
    id: 'fontmagica', n: 9, nombre: 'Font Màgica', tipo: 'Lugar',
    pista: 'Al pie de Montjuïc, el agua sabe bailar. Tócala.',
    lugar: function () { return M.enMonumento(palau(), 0, -24, 0.8); }, radio: 240,
    detectar: function (api) {
      api.en('clic', function (d) {
        var E = api.motor; if (E.cam.s < 0.45) return;
        var m = palau(), f = Math.max(1, Math.min(3.6, 0.9 / E.cam.s)) * (m.esc || 1);
        var lx = (d.X - m.X) / f, ly = (m.Y - d.Y) / f;   // el clic, en metros del dibujo
        if (Math.pow(lx / 72, 2) + Math.pow((ly + 24) / 16, 2) <= 1) api.disparar();
      });
    },
    escena: function (E) {
      var L = E.lectura, m = palau();
      return {
        duracion: 13000 + L,
        tarjeta: { en: 5000, hasta: 12300 + L, titulo: 'Font Màgica',
          texto: 'La diseñó el ingeniero Carles Buïgas para la Exposición Internacional de 1929, al pie del Palau Nacional, que hoy es el MNAC. La Guerra Civil la dejó muy dañada y volvió a funcionar a mediados de los cincuenta. Hoy sus chorros de agua y de luz bailan al ritmo de la música.',
          pie: 'Font Màgica de Montjuïc · Carles Buïgas · 1929' },
        inicio: function () { var c = M.enMonumento(m, 0, 4, 3.0); E.encuadrar(c[0], c[1], 3.0, 2600); },
        frente: function (ctx, t) {
          var a = 1 - U.tramo(t, 12300 + L, 13000 + L), s = E.cam.s, on = U.tramo(t, 2200, 3000) * a;
          if (on <= 0) return;
          ctx.save(); ctx.lineCap = 'round';
          for (var j = -6; j <= 6; j++) {
            var x = j * 8.5, base = M.enMonumento(m, x * 0.92, -24, s), pb = E.aPantalla(base[0], base[1]);
            // la altura de cada chorro: una ola que va y viene por la fila, a compás
            var h = (22 + 46 * (0.5 + 0.5 * Math.sin(t / 420 - j * 0.55))) * (j % 2 ? 0.75 : 1), cima = M.enMonumento(m, x * 0.92, -24 + h, s), pc = E.aPantalla(cima[0], cima[1]);
            var col = COLORES[(Math.floor(t / 1400) + Math.abs(j)) % COLORES.length];
            var g = ctx.createLinearGradient(pb[0], pb[1], pc[0], pc[1]); g.addColorStop(0, U.rgba(col, 0.15)); g.addColorStop(1, U.rgba(col, 0.95));
            ctx.globalAlpha = on; ctx.strokeStyle = g; ctx.lineWidth = Math.max(3, 2.4 * s);
            ctx.beginPath(); ctx.moveTo(pb[0], pb[1]); ctx.quadraticCurveTo(pb[0] + j * 0.6, (pb[1] + pc[1]) / 2, pc[0], pc[1]); ctx.stroke();
            for (var k = 0; k < 4; k++) {   // las gotas que caen de la cresta
              var tk = ((t / 700 + k / 4 + j * 0.07) % 1), px = pc[0] + (k - 1.5) * s * 1.2 * tk * 2, py = pc[1] + tk * tk * (pb[1] - pc[1]) * 0.9;
              ctx.globalAlpha = on * (1 - tk); ctx.fillStyle = col; ctx.beginPath(); ctx.arc(px, py, Math.max(1.5, 0.8 * s), 0, 6.2832); ctx.fill();
            }
          }
          ctx.restore();
        }
      };
    }
  });
})();
