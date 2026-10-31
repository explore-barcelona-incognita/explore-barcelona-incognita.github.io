/* Secreto 10 · Tibidabo · la noria (Espera)
   Con el Tibidabo en pantalla y algo de cerca, no tocar nada durante 20 s (con el cuaderno cerrado). Como aviso,
   desde los 7 s la noria empieza a moverse sola, cada vez más. La escena: la noria gira de verdad, con sus
   cabinas de colores, y aparece el nombre de la montaña. */
(function () {
  'use strict';
  var BC = window.BC, U = BC.util, M = BC.mapa, FX = BC.fx;
  var NX = 88, NY = 36, NR = 26, CABINAS = ['#f2b33d', '#2f5fae', '#4f9a3c', '#c43b2b'];   // la noria del dibujo del monumento
  function monte() { return M.monumento('tibidabo'); }
  function noria(ctx, E, giro, alfa) {   // la noria, de teselas, por encima del dibujo, girada «giro» radianes
    var m = monte(), s = E.cam.s, MO = BC.mosaico, c = E.aPantalla.apply(null, M.enMonumento(m, NX, NY, s)), f = Math.max(1, Math.min(3.6, 0.9 / s)) * (m.esc || 1), r = NR * f * s, t0 = Math.max(3, 1.2 * f * s);
    if (alfa <= 0) return;
    for (var k = 0; k < 8; k++) {   // los radios
      var an = giro + k / 8 * 6.2832;
      for (var d = 0.18; d < 0.95; d += 0.16) MO.tesela(ctx, c[0] + Math.cos(an) * r * d, c[1] + Math.sin(an) * r * d, t0 * 0.7, '#d8452f', 1, 1000 + k * 9 + Math.round(d * 10), { alfa: alfa, sombra: false, ang: an });
    }
    var n = Math.max(24, Math.round(r * 6.2832 / (t0 * 1.15)));
    for (k = 0; k < n; k++) { var a2 = giro + k / n * 6.2832; MO.tesela(ctx, c[0] + Math.cos(a2) * r, c[1] + Math.sin(a2) * r, t0, k % 2 ? '#c43b2b' : '#a8282a', 1, 1100 + k, { alfa: alfa, ang: a2 }); }   // el aro
    MO.tesela(ctx, c[0], c[1], t0 * 1.6, '#f2b33d', 1, 1200, { alfa: alfa });
    for (k = 0; k < 8; k++) {   // las cabinas: cuelgan siempre hacia abajo
      var a3 = giro + k / 8 * 6.2832, x = c[0] + Math.cos(a3) * r, y = c[1] + Math.sin(a3) * r + t0 * 1.3;
      MO.tesela(ctx, x, y, t0 * 1.7, CABINAS[k % 4], 1, 1300 + k, { alfa: alfa });
    }
  }
  BC.registrar({
    id: 'tibidabo', n: 10, nombre: 'La sínia del Tibidabo', tipo: 'Espera',
    pista: 'Al més amunt, algú va dir «tot això et donaré». Mira-ho en silenci.',
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
      var L = E.lectura, m = monte(), MO = BC.mosaico, cam = {}, lema = MO.texto('TIBI DABO', 96, 7.5);
      return {
        duracion: 13500 + L,
        tarjeta: { en: 5600, hasta: 12800 + L, titulo: 'Tibidabo',
          texto: 'El seu nom ve del llatí <i>tibi dabo</i>, «et donaré»: les paraules amb què, segons l’Evangeli, el diable va oferir a Jesús els regnes del món des de dalt d’una muntanya. A dalt de tot, a 512 metres, hi ha el parc d’atraccions en funcionament més antic d’Espanya, obert el 1901.',
          pie: 'Tibidabo · Serra de Collserola · 512 m' },
        inicio: function () { var c = M.enMonumento(m, 44, 64, 2.6); E.encuadrar(c[0], c[1], 2.6, 2600); },
        cuadro: function (t) { MO.respirar(E, cam, t, 2700, 13500 + L, 0.05); },
        frente: function (ctx, t) {
          var a = 1 - U.tramo(t, 12800 + L, 13500 + L), s = E.cam.s, k = s / 2.6, vel = U.tramo(t, 1800, 4500), c = M.enMonumento(m, 44, 64, s);
          FX.foco(ctx, c[0], c[1], 160 * s * 0.6, U.tramo(t, 1800, 3200) * a);
          // el Cristo de lo alto se ilumina, y la noria arranca y gira
          var cr = E.aPantalla.apply(null, M.enMonumento(m, 0, 158, s));
          MO.halo(ctx, cr[0], cr[1], 60 * k, '#fff3cf', U.suave(U.tramo(t, 2600, 3800)) * a);
          noria(ctx, E, vel * vel * t / 900, a);
          var pt = E.aPantalla.apply(null, M.enMonumento(m, 20, 186, s)), en = 0.6 * Math.max(0.8, Math.min(1.2, k));
          MO.pintarTexto(ctx, lema, Math.min(E.W - lema.w * en / 2 - 20, pt[0]), Math.max(lema.h * en / 2 + 24, pt[1]), U.tramo(t, 5600, 8200), { esc: en, salida: U.tramo(t, 11900 + L, 13300 + L) });
        }
      };
    }
  });
})();
