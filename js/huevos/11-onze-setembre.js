/* Secreto 11 · Onze de Setembre (Teclado)
   Once secretos por el 11 de septiembre (lo pidió Pau). Se escribe 1714. La escena baja al Fossar de les Moreres,
   junto a Santa Maria del Mar: el arco de pórfido rojo, el pebetero con la llama que no se apaga y, debajo,
   el verso de Frederic Soler (Pitarra). */
(function () {
  'use strict';
  var BC = window.BC, U = BC.util, M = BC.mapa, FX = BC.fx;
  var FOSSAR = M.ll(41.38345, 2.18168), CLAVE = '1714';
  BC.registrar({
    id: 'onze', n: 11, nombre: 'Onze de Setembre', tipo: 'Teclat',
    pista: 'Un any que la ciutat no oblida. Quatre xifres.',
    detectar: function (api) {
      var buf = '';
      api.en('tecla', function (d) {
        if (api.motor.escena || d.key.length !== 1) return;
        buf = (buf + d.key).slice(-CLAVE.length);
        if (buf === CLAVE) { buf = ''; api.disparar(); }
      });
    },
    escena: function (E) {
      var L = E.lectura, MO = BC.mosaico, cam = {}, ano = MO.texto('1714', 96, 7.5), FOC = ['#c43b2b', '#e8663a', '#f2b33d', '#fbe6a8', '#d8452f'];
      var PORFID = ['#7a1f1c', '#8f2a24', '#6b1a18', '#9a3a2c'];
      // la llama: teselas que suben desde el pebetero, se encogen y cambian del rojo al oro (siempre las mismas, en bucle)
      var chispas = []; for (var i = 0; i < 70; i++) chispas.push({ x: (M.h(i, 1, 5) - 0.5), v: 0.6 + M.h(i, 2, 5) * 0.8, f: M.h(i, 3, 5) });
      return {
        duracion: 14500 + L,
        tarjeta: { en: 5600, hasta: 13800 + L, titulo: 'Onze de Setembre',
          texto: 'Al Fossar de les Moreres, al costat de Santa Maria del Mar, hi van enterrar els defensors que van morir en el setge de 1713–1714. Barcelona va caure l’11 de setembre de 1714, i aquell dia és avui la Diada Nacional de Catalunya. Aquí crema una flama que no s’apaga, sota un vers de Pitarra: <i>«Al fossar de les moreres no s’hi enterra cap traïdor».</i>',
          pie: 'Fossar de les Moreres · 11.09.1714' },
        inicio: function () { E.encuadrar(FOSSAR[0], FOSSAR[1], 3.6, 2600); },
        cuadro: function (t) { MO.respirar(E, cam, t, 2700, 14500 + L, 0.05); },
        frente: function (ctx, t) {
          var a = 1 - U.tramo(t, 13800 + L, 14500 + L), s = E.cam.s, k = s / 3.6, p = E.aPantalla(FOSSAR[0], FOSSAR[1]), e = 9 * s;
          FX.foco(ctx, FOSSAR[0], FOSSAR[1], 140 * s, U.tramo(t, 1600, 3000) * a);
          // 1 · el arco de pórfido rojo del monumento, pieza a pieza
          var arco = []; for (var q = 0; q <= 18; q++) { var an = Math.PI * (1.18 + 0.64 * q / 18); arco.push(E.aMundo(p[0] + Math.cos(an) * e * 6, p[1] + e * 5.5 + Math.sin(an) * e * 6)); }
          MO.cadena(ctx, arco, U.tramo(t, 1800, 3800), { tam: 6.5 * k * 1.6, paleta: PORFID, alfa: a, semilla: 140 });
          // 2 · el pebetero: un mástil de teselas de hierro
          var pie = E.aMundo(p[0] + e * 2.2, p[1] + e * 0.5), boca = E.aMundo(p[0] + e * 2.2, p[1] - e * 2.6);
          MO.cadena(ctx, [pie, boca], U.tramo(t, 3000, 3700), { tam: 4 * k * 1.6, paleta: ['#2f3a36', '#3a4642', '#46524c'], alfa: a, semilla: 150 });
          // 3 · la llama que no se apaga: teselas que suben y se apagan arriba, del rojo al oro
          var on = U.tramo(t, 3600, 4400) * a, bx = p[0] + e * 2.2, by = p[1] - e * 2.7;
          MO.halo(ctx, bx, by - e * 1.6, 120 * k, '#ffb45a', on * 0.75);
          if (on > 0) chispas.forEach(function (c, n) {
            var u = (t / 1000 * c.v + c.f) % 1, alto = u * e * 5.2, ancho = (1 - u) * e * 0.9 * c.x * 2 + Math.sin(t / 160 + n) * e * 0.14 * u;
            MO.tesela(ctx, bx + ancho, by - alto, e * 0.5 * (1 - u * 0.65), FOC[Math.min(FOC.length - 1, Math.floor(u * 4.2))], 1, 1500 + n, { alfa: on * (u < 0.15 ? u / 0.15 : 1 - (u - 0.15) / 0.85), sombra: false, ang: t / 400 + n });
          });
          // 4 · el año, en teselas de oro, encima del fossar
          var en = 0.6 * Math.max(0.8, Math.min(1.2, k));
          MO.pintarTexto(ctx, ano, p[0], Math.max(ano.h * en / 2 + 24, p[1] - e * 9), U.tramo(t, 4600, 7000), { esc: en, salida: U.tramo(t, 13000 + L, 14400 + L) });
        }
      };
    }
  });
})();
