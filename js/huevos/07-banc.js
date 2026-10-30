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
    id: 'banc', n: 7, nombre: 'Banc de Park Güell', tipo: 'Gesto',
    pista: 'En el parque, el banco ondula. Ondula tú también por encima.',
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
      var L = E.lectura, m = parque();
      return {
        duracion: 12500 + L,
        tarjeta: { en: 4400, hasta: 11800 + L, titulo: 'El banco ondulado',
          texto: 'El banco que rodea la gran plaza de Park Güell se construyó entre 1909 y 1914. Gaudí dibujó sus curvas y Josep Maria Jujol las cubrió de trencadís: trozos de azulejo, de plato y de botella de todos los colores. Se suele decir que mide unos 110 metros.',
          pie: 'Antoni Gaudí · Josep Maria Jujol · Park Güell, 1909–1914' },
        inicio: function () { var s = 3.4, f = fz(m, s); E.encuadrar(m.X, m.Y - 40 * f, s, 2600); },
        frente: function (ctx, t) {
          var a = 1 - U.tramo(t, 11800 + L, 12500 + L), s = E.cam.s, f = fz(m, s), ola = (t - 2400) / 3200;
          if (ola < 0) return;
          // la ola recorre el banco (en los metros del dibujo del monumento: y ≈ 60, x de −62 a 62), ida y vuelta:
          // una franja de oro sobre el banco y, en la cresta, trozos de colores que saltan
          var fase = ola % 2, cresta = fase < 1 ? fase : 2 - fase, P = function (x, y) { return E.aPantalla(m.X + x * f, m.Y - y * f); };
          var tramo = []; for (var x0 = -62; x0 <= 62; x0 += 1) { var u0 = (x0 + 62) / 124; if (Math.abs(u0 - cresta) < 0.22) tramo.push(P(x0, 60 + 2.4 * Math.sin(x0 / 4.2))); }
          if (tramo.length > 1) {
            ctx.save(); ctx.globalAlpha = a; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
            ctx.strokeStyle = 'rgba(20,17,15,0.6)'; ctx.lineWidth = 9 * f * s * 0.5 + 6; ctx.beginPath(); tramo.forEach(function (q, k) { k ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); }); ctx.stroke();
            ctx.strokeStyle = BC.color.acento; ctx.lineWidth = 9 * f * s * 0.5 + 2; ctx.stroke(); ctx.restore();
          }
          for (var x = -62; x <= 62; x += 2.2) {
            var u = (x + 62) / 124, cerca = Math.max(0, 1 - Math.abs(u - cresta) * 9);
            if (cerca <= 0) continue;
            var y = 60 + 2.4 * Math.sin(x / 4.2) + cerca * 7, p = P(x, y), r = (1.6 + cerca * 2.4) * f * s;
            ctx.globalAlpha = a * cerca; ctx.fillStyle = 'rgba(20,17,15,0.7)'; ctx.beginPath(); ctx.arc(p[0], p[1], r + 1.5, 0, 6.2832); ctx.fill();
            ctx.fillStyle = COLORES[Math.floor(x + 62) % COLORES.length]; ctx.beginPath(); ctx.arc(p[0], p[1], r, 0, 6.2832); ctx.fill();
          }
          ctx.globalAlpha = 1;
        }
      };
    }
  });
})();
