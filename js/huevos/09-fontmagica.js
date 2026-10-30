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
      var L = E.lectura, m = palau(), MO = BC.mosaico, cam = {}, ano = MO.texto('1929', 96, 7.5);
      return {
        duracion: 13500 + L,
        tarjeta: { en: 5600, hasta: 12800 + L, titulo: 'Font Màgica',
          texto: 'La diseñó el ingeniero Carles Buïgas para la Exposición Internacional de 1929, al pie del Palau Nacional, que hoy es el MNAC. La Guerra Civil la dejó muy dañada y volvió a funcionar a mediados de los cincuenta. Hoy sus chorros de agua y de luz bailan al ritmo de la música.',
          pie: 'Font Màgica de Montjuïc · Carles Buïgas · 1929' },
        inicio: function () { var c = M.enMonumento(m, 0, 10, 3.0); E.encuadrar(c[0], c[1], 3.0, 2600); },
        cuadro: function (t) { MO.respirar(E, cam, t, 2700, 13500 + L, 0.05); },
        frente: function (ctx, t) {
          var a = 1 - U.tramo(t, 12800 + L, 13500 + L), s = E.cam.s, k = s / 3.0, on = U.tramo(t, 2200, 3000) * a;
          FX.foco(ctx, M.enMonumento(m, 0, 10, s)[0], M.enMonumento(m, 0, 10, s)[1], 150 * s * 0.6, U.tramo(t, 1800, 3200) * a);
          if (on <= 0) return;
          // el agua se ilumina por debajo (una luz que cambia de color, sin destellos)
          var base = E.aPantalla.apply(null, M.enMonumento(m, 0, -24, s)), col0 = COLORES[Math.floor(t / 1400) % COLORES.length];
          MO.halo(ctx, base[0], base[1], 120 * k, col0, on * 0.8);
          // los chorros: columnas de teselas de vidrio de color que suben y bajan a compás, como una ola por la fila
          for (var j = -6; j <= 6; j++) {
            var x = j * 8.5 * 0.92, h = (22 + 46 * (0.5 + 0.5 * Math.sin(t / 420 - j * 0.55))) * (j % 2 ? 0.75 : 1);
            var col = COLORES[((Math.floor(t / 1400) + Math.abs(j)) % COLORES.length + COLORES.length) % COLORES.length];
            var fzm = Math.max(1, Math.min(3.6, 0.9 / s)) * (m.esc || 1), tam = 7.5 * k, dy = tam * 0.9 / (s * fzm);   // las teselas, pegadas unas a otras
            for (var y = 0; y < h; y += dy) {
              var p = E.aPantalla.apply(null, M.enMonumento(m, x + Math.sin(y * 0.3 + t / 300) * 0.4, -24 + y, s)), cima = y + dy >= h;
              MO.tesela(ctx, p[0], p[1], (cima ? 1.35 : 1) * tam * (1 - y / h * 0.3), y / h > 0.6 ? col : MO.VIDRIO[(j + 13 + Math.floor(y)) % MO.VIDRIO.length], 1, 900 + j * 31 + Math.floor(y), { alfa: on * (0.75 + 0.25 * y / h), sombra: false });
            }
            // las gotas que caen de la cresta, también de teselas
            for (var g = 0; g < 3; g++) {
              var tg = ((t / 700 + g / 3 + j * 0.07) % 1), pg = E.aPantalla.apply(null, M.enMonumento(m, x + (g - 1) * tg * 3, -24 + h * (1 - tg * tg * 0.9), s));
              MO.tesela(ctx, pg[0], pg[1], 4.5 * k, col, 1, 950 + j * 7 + g, { alfa: on * (1 - tg), sombra: false });
            }
          }
          var pt = E.aPantalla.apply(null, M.enMonumento(m, 0, 150, s)), en = 0.6 * Math.max(0.8, Math.min(1.2, k));
          MO.pintarTexto(ctx, ano, pt[0], Math.max(ano.h * en / 2 + 24, pt[1]), U.tramo(t, 5600, 8000), { esc: en, salida: U.tramo(t, 11900 + L, 13300 + L) });
        }
      };
    }
  });
})();
