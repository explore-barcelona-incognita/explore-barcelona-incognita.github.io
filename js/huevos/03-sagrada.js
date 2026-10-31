/* Secreto 03 · Sagrada Família (Mirada)
   Hay que acercarse y quedarse mirándola: la basílica en el centro de la vista, de cerca y sin mover la cámara,
   durante 4 s. La escena sube la cámara por la fachada y, al lado de la torre de Jesucristo, una regla de oro
   mide su altura hasta los 172,5 m. Se vuelve a armar al dejar de mirarla. */
(function () {
  'use strict';
  var BC = window.BC, U = BC.util, M = BC.mapa, FX = BC.fx;
  function sagrada() { return M.monumento('sagrada'); }
  function fz(m, s) { return Math.max(1, Math.min(3.6, 0.9 / s)) * (m.esc || 1); }
  function centro(m, s) { return [m.X, m.Y - m.alto * 0.42 * fz(m, s)]; }
  BC.registrar({
    id: 'sagrada', n: 3, nombre: 'Sagrada Família', tipo: 'Mirada',
    pista: 'Fa més d’un segle que creix. Acosta-t’hi i queda’t a mirar-la.',
    lugar: function () { var m = sagrada(); return centro(m, 1.2); }, radio: 300,
    detectar: function (api) {
      var mirando = 0, armado = true;
      api.en('cuadro', function (d) {
        var E = api.motor, m = sagrada(), c = centro(m, E.cam.s), p = E.aPantalla(c[0], c[1]);
        var dentro = E.cam.s >= 0.95 && Math.hypot(p[0] - E.W / 2, p[1] - E.H / 2) < Math.min(E.W, E.H) * 0.2;
        if (!dentro) { mirando = 0; armado = true; return; }
        if (!armado || E.escena || E.bloqueado) return;
        mirando = d.moviendo ? Math.max(0, mirando - d.dt * 2) : mirando + d.dt;
        if (mirando > 4000) { mirando = 0; armado = false; api.disparar(); }
      });
    },
    escena: function (E) {
      var L = E.lectura, m = sagrada(), MO = BC.mosaico, FX = BC.fx, cam = {}, alto = MO.texto('172,5 m', 96, 7.5), ano = MO.texto('1882', 96, 7.5);
      return {
        duracion: 14000 + L,
        tarjeta: { en: 6400, hasta: 13300 + L, titulo: 'Sagrada Família',
          texto: 'La primera pedra es va posar el 19 de març de 1882, i Gaudí es va fer càrrec de l’obra un any després. El febrer de 2026, la creu de la torre de Jesucrist la va dur fins als 172,5 metres: l’església més alta del món. I encara no està acabada. Diuen que qui escriu el nom del seu arquitecte hi pot entrar.',
          pie: 'Temple Expiatori de la Sagrada Família · 1882 –' },
        // la cámara empieza en la base y sube despacio por la fachada, como una grúa
        inicio: function () { var s = 1.25, f = fz(m, s); E.encuadrar(m.X, m.Y - 40 * f, s, 1900); },
        cuadro: function (t) {
          if (t > 2000 && t < 2100) { var s = 1.25, f = fz(m, s); E.encuadrar(m.X, m.Y - 250 * f, s, 4200); }
          MO.respirar(E, cam, t, 6400, 14000 + L, 0.05);
        },
        frente: function (ctx, t) {
          var a = 1 - U.tramo(t, 13300 + L, 14000 + L), s = E.cam.s, f = fz(m, s), x = m.X + 78 * f, base = m.Y, cima = m.Y - 356 * f, k = s / 1.25;
          FX.foco(ctx, m.X, m.Y - 180 * f, 230 * f * s, U.tramo(t, 1200, 2600) * a);
          // 1882: el año de la primera piedra se monta al pie, y se deshace cuando la cámara sube
          var pb = E.aPantalla(m.X, base + 18 * f);
          MO.pintarTexto(ctx, ano, pb[0], pb[1] + 40, U.tramo(t, 600, 2400), { esc: 0.55 * k, salida: U.tramo(t, 4200, 5200), semilla: 5 });
          // la regla: una columna de teselas de oro que sube junto a la torre, con una marca cada 10 m
          var g = U.suave(U.tramo(t, 2200, 6200));
          MO.cadena(ctx, [[x, base], [x, cima]], g, { tam: Math.max(6, 7.5 * k), alfa: a, semilla: 9, dur: 0.05 });
          for (var i = 1; i <= 17; i++) {
            var fi = i / 17.25; if (g < fi) break;
            var y = base + (cima - base) * fi, larga = i % 5 === 0, q0 = [x, y], q1 = [x - (larga ? 22 : 11) / s, y];
            MO.cadena(ctx, [q1, q0], U.clamp((g - fi) * 20, 0, 1), { tam: Math.max(4.5, 5.5 * k), alfa: a, semilla: 40 + i, junta: false, paleta: larga ? MO.ORO : ['#f4efe3', '#e9e2cf'] });
          }
          var tip = E.aPantalla(x, base + (cima - base) * g);
          if (g > 0 && g < 1) FX.etiqueta(ctx, (172.5 * g).toFixed(1).replace('.', ',') + ' m', x, base + (cima - base) * g, { alin: 'left', dx: 18, alfa: a, color: BC.color.acento });
          // arriba: la cruz se ilumina y la altura se queda montada en teselas
          var cruz = E.aPantalla(m.X, cima + 10 * f);
          MO.halo(ctx, cruz[0], cruz[1], 70 * k, '#fff3cf', U.suave(U.tramo(t, 6000, 7200)) * a);
          var ea = 0.55 * k; MO.pintarTexto(ctx, alto, Math.min(E.W - alto.w * ea / 2 - 20, tip[0] + alto.w * ea / 2 + 30), Math.max(alto.h * ea / 2 + 20, cruz[1] + 10), U.tramo(t, 6200, 8600), { esc: ea, salida: U.tramo(t, 12600 + L, 13800 + L), semilla: 2 });
        }
      };
    }
  });
})();
