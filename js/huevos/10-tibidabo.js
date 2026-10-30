/* Secreto 10 · Tibidabo · la noria (Espera)
   Con el Tibidabo en pantalla y algo de cerca, no tocar nada durante 20 s (con el cuaderno cerrado). Como aviso,
   desde los 7 s la noria empieza a moverse sola, cada vez más. La escena: la noria gira de verdad, con sus
   cabinas de colores, y aparece el nombre de la montaña. */
(function () {
  'use strict';
  var BC = window.BC, U = BC.util, M = BC.mapa, FX = BC.fx;
  var NX = 88, NY = 36, NR = 26, CABINAS = ['#f2b33d', '#2f5fae', '#4f9a3c', '#c43b2b'];   // la noria del dibujo del monumento
  function monte() { return M.monumento('tibidabo'); }
  function noria(ctx, E, giro, alfa) {   // la noria, por encima del dibujo, girada «giro» radianes
    var m = monte(), s = E.cam.s, c = E.aPantalla.apply(null, M.enMonumento(m, NX, NY, s)), f = Math.max(1, Math.min(3.6, 0.9 / s)) * (m.esc || 1), r = NR * f * s;
    ctx.save(); ctx.globalAlpha = alfa;
    ctx.strokeStyle = '#c43b2b'; ctx.lineWidth = Math.max(1.5, 0.9 * f * s); ctx.beginPath(); ctx.arc(c[0], c[1], r, 0, 6.2832); ctx.stroke();
    ctx.lineWidth = Math.max(1, 0.4 * f * s); ctx.strokeStyle = '#d8452f';
    for (var k = 0; k < 8; k++) { var an = giro + k / 8 * 6.2832; ctx.beginPath(); ctx.moveTo(c[0], c[1]); ctx.lineTo(c[0] + Math.cos(an) * r, c[1] + Math.sin(an) * r); ctx.stroke(); }
    for (k = 0; k < 8; k++) {
      var a2 = giro + k / 8 * 6.2832, x = c[0] + Math.cos(a2) * r, y = c[1] + Math.sin(a2) * r, e = Math.max(3, 3.2 * f * s);
      ctx.fillStyle = 'rgba(20,17,15,0.7)'; ctx.fillRect(x - e / 2 - 1, y - 1, e + 2, e * 1.1 + 2);   // las cabinas cuelgan siempre hacia abajo
      ctx.fillStyle = CABINAS[k % 4]; ctx.fillRect(x - e / 2, y, e, e * 1.1);
    }
    ctx.restore();
  }
  BC.registrar({
    id: 'tibidabo', n: 10, nombre: 'La noria del Tibidabo', tipo: 'Espera',
    pista: 'En lo más alto, alguien dijo «todo esto te daré». Míralo en silencio.',
    lugar: function () { return M.enMonumento(monte(), 40, 60, 0.6); }, radio: 260,
    detectar: function (api) {
      function aLaVista(E) { var p = E.aPantalla.apply(null, M.enMonumento(monte(), NX, NY, E.cam.s)); return E.cam.s >= 0.4 && p[0] > 0 && p[0] < E.W && p[1] > 0 && p[1] < E.H; }
      // el aviso: con el Tibidabo a la vista y sin tocar nada, la noria empieza a girar sola, cada vez más
      api.capa(function (ctx, t) {
        var E = api.motor; if (E.escena || E.bloqueado || api.hallado() || !aLaVista(E)) return;
        var a = U.tramo(E.t - E.ultimoInput, 7000, 18000); if (a <= 0) return;
        noria(ctx, E, a * a * (t / 2600), 0.5 + 0.5 * a);
      });
      api.en('cuadro', function (d) {
        var E = api.motor; if (E.escena || E.bloqueado || d.inactivo < 20000) return;
        if (document.documentElement.classList.contains('cuaderno-abierto') || document.hidden || !aLaVista(E)) return;
        E.ultimoInput = E.t; api.disparar();
      });
    },
    escena: function (E) {
      var L = E.lectura, m = monte();
      return {
        duracion: 13000 + L,
        tarjeta: { en: 5000, hasta: 12300 + L, titulo: 'Tibidabo',
          texto: 'Su nombre viene del latín <i>tibi dabo</i>, «te daré»: las palabras con que, según el Evangelio, el diablo ofreció a Jesús los reinos del mundo desde lo alto de un monte. Arriba, a 512 metros, está el parque de atracciones en funcionamiento más antiguo de España, abierto en 1901.',
          pie: 'Tibidabo · Serra de Collserola · 512 m' },
        inicio: function () { var c = M.enMonumento(m, 40, 60, 2.4); E.encuadrar(c[0], c[1], 2.4, 2600); },
        frente: function (ctx, t) {
          var a = 1 - U.tramo(t, 12300 + L, 13000 + L), vel = U.tramo(t, 1800, 4500);
          noria(ctx, E, vel * vel * t / 900, a);
          var et = M.enMonumento(m, 0, 170, E.cam.s);
          FX.etiqueta(ctx, 'Tibi dabo · «te daré»', et[0], et[1], { serif: true, tam: 24, dy: -8, alfa: a * U.tramo(t, 4200, 5000), color: BC.color.acento });
        }
      };
    }
  });
})();
