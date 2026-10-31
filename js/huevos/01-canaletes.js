/* Secreto 01 · Font de Canaletes (Lugar)
   La fuente solo aparece al acercarse a la plaza de Catalunya (zmin del monumento). Se encuentra tocándola.
   La escena: la cámara baja hasta la fuente, cae agua de los cuatro caños y salta el confeti azulgrana,
   como cuando la afición del Barça celebra aquí sus victorias.
   Datos de la tarjeta, prudentes hasta comprobarlos con el catálogo de patrimonio (ver CLAUDE.md). */
(function () {
  'use strict';
  var BC = window.BC, U = BC.util, M = BC.mapa;
  function fuente() { return M.monumento('canaletes'); }
  BC.registrar({
    id: 'canaletes', n: 1, nombre: 'Font de Canaletes', tipo: 'Lloc',
    pista: 'Qui en beu, diuen, sempre hi torna.',
    lugar: function () { var m = fuente(); return [m.X, m.Y - 40]; }, zmin: 0.6, radio: 280,
    detectar: function (api) {
      api.en('clic', function (d) {
        var m = fuente(), E = api.motor; if (E.cam.s < m.zmin) return;
        var c = M.cajaMonumento(m, E.cam.s);
        if (d.X > c[0] && d.X < c[2] && d.Y > c[1] && d.Y < c[3]) api.disparar();
      });
    },
    escena: function (E) {
      var m = fuente(), L = E.lectura, MO = BC.mosaico, FX = BC.fx, cam = {};
      var confeti = MO.confeti(90, MO.AZULGRANA.concat(['#f4efe3', '#f2b33d']), 11), lema = MO.texto(BC.idioma.palabra('TORNARÀS'), 96, 7.5);
      // los cuatro caños: de la boca al agua de cada pila (metros del dibujo del monumento)
      var CANOS = [[-16.2, 21, -20, 18.5], [16.2, 21, 20, 18.5], [-3, 24.5, -1.5, 22.5], [3, 24.5, 1.5, 22.5]];
      var FAROLES = [[-14, 93], [14, 93], [-7, 98.5], [7, 98.5]];
      function P(lx, ly) { return E.aPantalla.apply(null, M.enMonumento(m, lx, ly, E.cam.s)); }
      return {
        duracion: 13000 + L,
        tarjeta: {
          en: 5600, hasta: 12300 + L, titulo: 'Font de Canaletes',
          texto: 'Una font de ferro colat del 1892, obra de l’arquitecte municipal Pere Falqués, al capdamunt de la Rambla. Diu la tradició que qui beu de la seva aigua sempre torna a Barcelona. I des dels anys trenta, l’afició del Barça hi ve a celebrar les victòries.',
          pie: 'Font de Canaletes · Pere Falqués · 1892'
        },
        inicio: function () { var c = M.enMonumento(m, 0, 60, 3.4); E.encuadrar(c[0], c[1], 3.4, 2600); },
        cuadro: function (t) { MO.respirar(E, cam, t, 2700, 13000 + L, 0.07); },
        frente: function (ctx, t) {
          var a = 1 - U.tramo(t, 12300 + L, 13000 + L), s = E.cam.s, k = s / 3.4, c = M.enMonumento(m, 0, 50, s);
          FX.foco(ctx, c[0], c[1], 150 * s * 0.5, U.tramo(t, 1800, 3200) * a);
          // 1 · se encienden los faroles (una luz cálida y quieta)
          var luz = U.suave(U.tramo(t, 2300, 3300)) * a;
          FAROLES.forEach(function (f) { var p = P(f[0], f[1]); MO.halo(ctx, p[0], p[1], 34 * k, '#ffd98a', luz); });
          // 2 · el agua: de cada caño baja una hilera de teselas de vidrio que corre y cae a la pila
          var agua = U.tramo(t, 2700, 3300) * a;
          if (agua > 0) CANOS.forEach(function (cn, j) {
            for (var i = 0; i < 7; i++) {
              var u = ((i / 7) + t / 900 + j * 0.13) % 1, x = cn[0] + (cn[2] - cn[0]) * u, y = cn[1] + (cn[3] - cn[1]) * u + 1.8 * Math.sin(u * Math.PI) * (1 - u);
              var p = P(x, y);
              MO.tesela(ctx, p[0], p[1], (2.2 - u * 0.8) * k * 1.4, MO.VIDRIO[(i + j) % MO.VIDRIO.length], 1, j * 31 + i, { alfa: agua * (u < 0.85 ? 1 : (1 - u) / 0.15), sombra: false, ang: Math.atan2(cn[3] - cn[1], cn[2] - cn[0]) });
            }
            // las ondas en la pila
            var pb = P(cn[2], cn[3] - 0.6), fase = (t / 900 + j * 0.3) % 1;
            ctx.save(); ctx.globalAlpha = agua * (1 - fase) * 0.8; ctx.strokeStyle = '#f4fbfd'; ctx.lineWidth = 1.2;
            ctx.beginPath(); ctx.ellipse(pb[0], pb[1], (3 + fase * 9) * k * 1.4, (1 + fase * 3) * k * 1.4, 0, 0, 6.2832); ctx.stroke(); ctx.restore();
          });
          // 3 · el confeti azulgrana: trozos de cerámica que saltan desde la farola y caen girando
          var top = P(0, 104);
          if (t > 3500) MO.pintarConfeti(ctx, confeti, top[0], top[1], (t - 3500), k * 1.1);
          // 4 · «TORNARÀS» se monta con teselas de oro encima de la fuente, y al final cae
          var lt = P(0, 140), et = 0.62 * Math.max(0.8, Math.min(1.2, k));
          lt[1] = Math.max(lema.h * et / 2 + 24, lt[1]);   // siempre dentro de la pantalla
          MO.pintarTexto(ctx, lema, lt[0], lt[1], U.tramo(t, 4300, 7300), { esc: et, salida: U.tramo(t, 11200 + L, 12600 + L) });
        }
      };
    }
  });
})();
