/* Barcelona Incognita · los cinco secretos de dentro de la Sagrada Família y su final (Pau, 31/10/2026)
   Viven en el mundo 'sagrada' (mundo: 'sagrada'): solo se detectan allí y tienen su propio cuaderno, recuento y final.
     1 · El quadrat màgic (Teclat): escribir 33, la suma del cuadrado de Subirachs de la fachada de la Pasión
     2 · Els vitralls (Mirada): quedarse mirando un vitral; pasa un día y la luz fría de la mañana y la cálida de la tarde
     3 · La tomba de Gaudí (Espera): quedarse quieto en la cripta; se encienden las velas
     4 · La maqueta de cadenes (Gest): darle media vuelta (o más) con el puntero alrededor; las cadenas giran y son arcos
     5 · La creu de Jesucrist (Lloc): subir hasta la cruz, a 172,5 m, y tocarla
   El corte usa metros con la y hacia arriba; en el motor un punto es (x, -y): P(x, y) lo pasa a pantalla. */
(function () {
  'use strict';
  var BC = window.BC, U = BC.util, M = BC.mapa, E = BC.motor, MO = BC.mosaico, FX = BC.fx, SG = BC.sagrada, ID = BC.idioma;
  var S = SG.SITIOS, Q = S.Q, CUAD = S.cuadradoNums;
  function P(x, y) { return E.aPantalla(x, -y); }
  function cuadernoAbierto() { return document.documentElement.classList.contains('cuaderno-abierto'); }

  /* ---------- 1 · el cuadrado mágico ---------- */
  BC.registrar({
    id: 'sf-quadrat', n: 1, mundo: 'sagrada', nombre: 'El quadrat màgic', tipo: 'Teclat',
    pista: 'A la façana de la Passió, un quadrat on tot suma el mateix: l’edat de Crist. Escriu-la.',
    lugar: function () { return S.cuadrado; }, radio: 220,
    detectar: function (api) {
      var buf = '';
      api.en('tecla', function (d) { if (api.motor.escena || !d.key || d.key.length !== 1) return; buf = (buf + d.key).slice(-2); if (buf === '33') { buf = ''; api.disparar(); } });
    },
    escena: function (E) {
      var L = E.lectura, cam = {}, gran = MO.texto('33', 110, 9), T0 = 2600, PASO = 380;
      var celda = function (f, c) { return [Q.x + (c + 0.5) * Q.t / 4, Q.y + (3 - f + 0.5) * Q.t / 4]; };
      // los grupos que suman 33: filas, columnas, diagonales, las cuatro esquinas y las cuatro del centro
      var G = [];
      for (var f = 0; f < 4; f++) G.push([[f, 0], [f, 1], [f, 2], [f, 3]]);
      for (var c = 0; c < 4; c++) G.push([[0, c], [1, c], [2, c], [3, c]]);
      G.push([[0, 0], [1, 1], [2, 2], [3, 3]], [[0, 3], [1, 2], [2, 1], [3, 0]], [[0, 0], [0, 3], [3, 0], [3, 3]], [[1, 1], [1, 2], [2, 1], [2, 2]]);
      var FIN = T0 + G.length * PASO;
      return {
        duracion: FIN + 7600 + L,
        tarjeta: { en: FIN + 300, hasta: FIN + 7000 + L, titulo: 'El quadrat màgic',
          texto: 'Josep Maria Subirachs el va esculpir a la façana de la Passió, al costat del petó de Judes. Totes les files, les columnes i les diagonals sumen 33, l’edat de Jesús quan va morir; també les quatre cantonades i les quatre caselles del mig. S’inspira en el quadrat del gravat <i>Melancolia I</i> de Dürer, que suma 34: per fer-lo sumar 33, hi ha números repetits i en falten dos.',
          pie: 'Façana de la Passió · Josep Maria Subirachs' },
        inicio: function () { E.encuadrar(Q.x + Q.t / 2, -(Q.y + Q.t / 2), 170, 2400); },
        cuadro: function (t) { MO.respirar(E, cam, t, FIN, FIN + 7600 + L, 0.05); },
        frente: function (ctx, t) {
          var a = 1 - U.tramo(t, FIN + 7000 + L, FIN + 7600 + L), tam = Q.t / 4 * E.cam.s;
          FX.foco(ctx, Q.x + Q.t / 2, -(Q.y + Q.t / 2), Q.t * 0.9 * E.cam.s, U.tramo(t, 1200, 2400) * a);
          G.forEach(function (g, i) {
            var t0 = T0 + i * PASO, ahora = U.meseta(t, t0, t0 + 120, t0 + PASO - 60, t0 + PASO + 200), u = U.tramo(t, t0, t0 + 300);
            if (u <= 0) return;
            g.forEach(function (fc, k) {   // la casilla se enciende en oro, y su número se vuelve a escribir encima, bien legible
              var p = P.apply(null, celda(fc[0], fc[1])), on = U.tramo(t, t0 + k * 50, t0 + k * 50 + 200) * (0.18 + 0.82 * ahora) * a;
              if (on <= 0) return;
              ctx.save(); ctx.globalAlpha = on; ctx.fillStyle = '#f4c24e'; ctx.fillRect(p[0] - tam * 0.46, p[1] - tam * 0.46, tam * 0.92, tam * 0.92);
              ctx.strokeStyle = '#f2b33d'; ctx.lineWidth = 2; ctx.strokeRect(p[0] - tam * 0.46, p[1] - tam * 0.46, tam * 0.92, tam * 0.92);
              ctx.fillStyle = '#2a1a08'; ctx.font = '700 ' + Math.round(tam * 0.42) + 'px "IBM Plex Mono", monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(String(CUAD[fc[0]][fc[1]]), p[0], p[1] + 1);
              ctx.restore();
            });
            if (ahora > 0) {   // la suma de este grupo, junto a la última casilla
              var ult = P.apply(null, celda(g[3][0], g[3][1])), txt = g.map(function (fc) { return CUAD[fc[0]][fc[1]]; }).join(' + ') + ' = 33';
              ctx.save(); ctx.globalAlpha = ahora * a; ctx.font = '600 13px "IBM Plex Mono", monospace'; var w = ctx.measureText(txt).width;
              ctx.fillStyle = 'rgba(20,17,15,0.85)'; ctx.fillRect(ult[0] + tam * 0.7, ult[1] - 13, w + 16, 26); ctx.fillStyle = BC.color.acento; ctx.textBaseline = 'middle'; ctx.fillText(txt, ult[0] + tam * 0.7 + 8, ult[1] + 1); ctx.restore();
            }
          });
          var c0 = P(Q.x + Q.t / 2, Q.y + Q.t + 0.6), en = 0.75;
          MO.pintarTexto(ctx, gran, c0[0], Math.max(gran.h * en / 2 + 24, c0[1] - gran.h * en * 0.3), U.tramo(t, FIN - 300, FIN + 1400), { esc: en, salida: U.tramo(t, FIN + 6500 + L, FIN + 7500 + L) });
        }
      };
    }
  });

  /* ---------- 2 · los vitrales ---------- */
  BC.registrar({
    id: 'sf-vitralls', n: 2, mundo: 'sagrada', nombre: 'Els vitralls', tipo: 'Mirada',
    pista: 'Vidres freds a llevant, càlids a ponent. Atura’t davant d’un vitrall i mira’l una estona.',
    lugar: function () { return [-18.75, -20]; }, radio: 260,
    detectar: function (api) {
      var mirando = 0, armado = true;
      api.en('cuadro', function (d) {
        var E = api.motor, x = E.cam.x, y = -E.cam.y, ax = Math.abs(x), dentro = E.cam.s >= 9 && ax > 8.5 && ax < 30 && y > 2 && y < 40;
        if (!dentro) { mirando = 0; armado = true; return; }
        if (!armado || E.escena || E.bloqueado) return;
        mirando = d.moviendo ? Math.max(0, mirando - d.dt * 2) : mirando + d.dt;
        if (mirando > 4000) { mirando = 0; armado = false; api.disparar(); }
      });
    },
    escena: function (E) {
      var L = E.lectura, cam = {}, DIA0 = 2600, DIA1 = 10600, V = S.vitralls;
      var FRED = ['#5fa3da', '#4f9a3c', '#3b7dc4', '#8fc06a'], CALID = ['#f08a4b', '#f2b33d', '#e8663a', '#d8452f'];
      return {
        duracion: DIA1 + 3200 + L,
        tarjeta: { en: 5200, hasta: DIA1 + 2600 + L, titulo: 'Els vitralls',
          texto: 'Els va fer Joan Vila-Grau, que hi va treballar gairebé vint anys a partir del 1999. Al costat del Naixement, que mira a llevant, els colors són freds, blaus i verds, per a la llum del matí; al de la Passió, a ponent, són càlids, vermells i taronges, per a la del capvespre. A baix el vidre és intens i a dalt és més clar, perquè entri més llum a la nau.',
          pie: 'Joan Vila-Grau · 1999 – 2018' },
        inicio: function () { var s = Math.min(E.H / 66, E.W / 84); E.encuadrar(0, -28, s, 2400); },
        cuadro: function (t) { MO.respirar(E, cam, t, 2600, DIA1 + 3200 + L, 0.04); },
        frente: function (ctx, t) {
          var a = 1 - U.tramo(t, DIA1 + 2600 + L, DIA1 + 3200 + L), u = U.tramo(t, DIA0, DIA1), sx = -42 + 84 * u, sy = 30 + 26 * Math.sin(Math.PI * u), sol = P(sx, sy), s = E.cam.s;
          var dia = U.meseta(t, DIA0 - 400, DIA0 + 600, DIA1 - 600, DIA1 + 400) * a;
          if (dia <= 0) return;
          // la nave se queda en penumbra para que se vea la luz que entra
          ctx.save(); ctx.globalAlpha = 0.42 * dia; ctx.fillStyle = '#1a1410'; ctx.fillRect(0, 0, E.W, E.H); ctx.restore();
          // el día: el sol de teselas cruza de levante (izquierda) a poniente (derecha)
          MO.halo(ctx, sol[0], sol[1], 9 * s, u < 0.5 ? '#ffe9b0' : '#ffb36b', dia);
          for (var k = 0; k < 12; k++) { var an = k / 12 * 6.2832 + t / 900; MO.tesela(ctx, sol[0] + Math.cos(an) * 1.6 * s, sol[1] + Math.sin(an) * 1.6 * s, 0.7 * s, MO.ORO[k % 5], 1, 700 + k, { alfa: dia, sombra: false, ang: an }); }
          MO.tesela(ctx, sol[0], sol[1], 1.6 * s, '#fbe6a8', 1, 720, { alfa: dia, sombra: false });
          // la luz que entra: por la mañana por los vitrales fríos, por la tarde por los cálidos; cae inclinada, lejos del sol
          ctx.save(); ctx.globalCompositeOperation = 'lighter';
          V.forEach(function (cx, n) {
            var este = cx < 0, fuerza = (este ? U.clamp(1 - u * 1.8, 0, 1) : U.clamp(u * 1.8 - 0.8, 0, 1)) * dia; if (fuerza <= 0) return;
            var pal = este ? FRED : CALID, dx = -sx * 0.35;
            for (var b = 0; b < 4; b++) {
              var x0 = cx - 2.2 + b * 1.1, p1 = P(x0, 36), p2 = P(x0 + 1.1, 36), p3 = P(x0 + 1.1 + dx, 0), p4 = P(x0 + dx, 0), gr = ctx.createLinearGradient(0, p1[1], 0, p4[1]);
              gr.addColorStop(0, U.rgba(pal[b], 0.42 * fuerza)); gr.addColorStop(1, U.rgba(pal[b], 0.12 * fuerza));
              ctx.fillStyle = gr; ctx.beginPath(); ctx.moveTo(p1[0], p1[1]); ctx.lineTo(p2[0], p2[1]); ctx.lineTo(p3[0], p3[1]); ctx.lineTo(p4[0], p4[1]); ctx.closePath(); ctx.fill();
            }
            var pool = P(cx + dx, 0.3); ctx.fillStyle = U.rgba(pal[n % 4], 0.6 * fuerza); ctx.beginPath(); ctx.ellipse(pool[0], pool[1], 3.4 * s, 0.6 * s, 0, 0, 6.2832); ctx.fill();   // el charco de color en el suelo
            [8, 22, 34].forEach(function (y) { var w = P(cx, y); MO.halo(ctx, w[0], w[1], 5 * s, pal[(n + y) % 4], 1.2 * fuerza); });   // el vitral encendido
          });
          ctx.restore();
        }
      };
    }
  });

  /* ---------- 3 · la tumba de Gaudí ---------- */
  var TOMBA = S.tomba;
  BC.registrar({
    id: 'sf-tomba', n: 3, mundo: 'sagrada', nombre: 'La tomba de Gaudí', tipo: 'Espera',
    pista: 'A la cripta, a prop de l’altar, hi descansa l’arquitecte. Queda’t en silenci.',
    lugar: function () { return TOMBA; }, radio: 240,
    detectar: function (api) {
      function enCripta(E) { var x = E.cam.x, y = -E.cam.y; return E.cam.s >= 8 && Math.abs(x) < 17 && y > -16.5 && y < -4; }
      // el aviso: con la cripta delante y sin tocar nada, la lámpara de la capilla se va encendiendo
      api.capa(function (ctx) {
        var E = api.motor; if (E.escena || E.bloqueado || api.hallado() || !enCripta(E)) return;
        var a = U.tramo(E.t - E.ultimoInput, 3000, 12000); if (a <= 0) return;
        var p = P(TOMBA[0], -12.0); MO.halo(ctx, p[0], p[1], 2.4 * E.cam.s, '#ffcf7a', a * (0.6 + 0.15 * Math.sin(E.t / 170)));
      });
      api.en('cuadro', function (d) {
        var E = api.motor; if (E.escena || E.bloqueado || d.inactivo < 12000 || cuadernoAbierto() || document.hidden || !enCripta(E)) return;
        E.ultimoInput = E.t; api.disparar();
      });
    },
    escena: function (E) {
      var L = E.lectura, cam = {}, anys = MO.texto('1852 · 1926', 96, 7.5);
      return {
        duracion: 13800 + L,
        tarjeta: { en: 5400, hasta: 13100 + L, titulo: 'La tomba de Gaudí',
          texto: 'Antoni Gaudí va morir el 10 de juny de 1926, tres dies després que l’atropellés un tramvia a la Gran Via. El van enterrar aquí, a la cripta, a la capella de la Mare de Déu del Carme. Hi havia treballat 43 anys, i els últims gairebé només en aquesta obra. Diuen que, quan li demanaven per què anava tan a poc a poc, responia: «El meu client no té pressa».',
          pie: 'Cripta · capella del Carme · 12.06.1926' },
        inicio: function () { E.encuadrar(TOMBA[0], 14.4, 75, 2600); },
        cuadro: function (t) { MO.respirar(E, cam, t, 2700, 13800 + L, 0.05); },
        frente: function (ctx, t) {
          var a = 1 - U.tramo(t, 13100 + L, 13800 + L), s = E.cam.s;
          FX.foco(ctx, TOMBA[0], 14.4, 4.5 * s, U.tramo(t, 1400, 2800) * a);
          // dos velas se encienden a los lados de la losa, y la lámpara de la capilla
          [-1.7, 1.7].forEach(function (dx, n) {
            var on = U.tramo(t, 2800 + n * 500, 3400 + n * 500) * a, base = P(TOMBA[0] + dx, -14.5), top = P(TOMBA[0] + dx, -13.7);
            if (on <= 0) return;
            ctx.save(); ctx.globalAlpha = on; ctx.fillStyle = '#f7f2e6'; ctx.fillRect(base[0] - 0.08 * s, top[1], 0.16 * s, base[1] - top[1]); ctx.restore();
            var fl = 1 + 0.12 * Math.sin(t / 90 + n * 2) + 0.08 * Math.sin(t / 37 + n);
            MO.halo(ctx, top[0], top[1] - 0.15 * s, 1.6 * s * fl, '#ffcf7a', on);
            ctx.save(); ctx.globalAlpha = on; ctx.fillStyle = '#fff3c4'; ctx.beginPath(); ctx.ellipse(top[0], top[1] - 0.12 * s, 0.06 * s, 0.14 * s * fl, 0, 0, 6.2832); ctx.fill(); ctx.restore();
          });
          var lam = P(TOMBA[0], -12.0); MO.halo(ctx, lam[0], lam[1], 2.4 * s, '#ffcf7a', U.tramo(t, 2400, 3200) * a * (0.85 + 0.15 * Math.sin(t / 150)));
          var pt = P(TOMBA[0], -11.0), en = 0.5 * Math.min(1.3, s / 75);
          MO.pintarTexto(ctx, anys, pt[0], Math.max(anys.h * en / 2 + 24, pt[1]), U.tramo(t, 3800, 6000), { esc: en, salida: U.tramo(t, 12600 + L, 13700 + L) });
        }
      };
    }
  });

  /* ---------- 4 · la maqueta de cadenas ---------- */
  var MC = [31, 9.2];   // el centro de la maqueta, en el plano del motor (las cuerdas cuelgan de -6,9 a -11,3 m)
  function catenarias() {   // las mismas cuerdas que pinta el corte (js/sagrada/seccio.js), en metros con la y hacia arriba
    var l = [];
    for (var k = 0; k < 5; k++) { var xa = 27.2 + k * 0.9, xb = 34.8 - k * 0.9, hondo = 4.4 - k * 0.6, c = []; for (var t = 0; t <= 14; t++) { var u = t / 14, cc = (Math.cosh((u - 0.5) * 2.2) - Math.cosh(1.1)) / (1 - Math.cosh(1.1)); c.push([xa + (xb - xa) * u, -6.9 - cc * hondo]); } l.push(c); }
    return l;
  }
  BC.registrar({
    id: 'sf-maqueta', n: 4, mundo: 'sagrada', nombre: 'La maqueta de cadenes', tipo: 'Gest',
    pista: 'Al museu, una església penja cap per avall. Dona-li la volta.',
    lugar: function () { return MC; }, radio: 240,
    detectar: function (api) {
      var ultimo = 0;
      api.en('cuadro', function () {
        var E = api.motor, r = E.rastro; if (E.escena || r.length < 10 || performance.now() - ultimo < 1500 || E.cam.s < 6) return;
        var fin = r[r.length - 1], giro = 0, prev = null, dmed = 0, n = 0;
        for (var i = r.length - 1; i >= 0 && fin.t - r[i].t < 2000; i--) {
          var q = r[i], ang = Math.atan2(q.Y - MC[1], q.X - MC[0]);
          if (prev != null) { var da = ang - prev; if (da > Math.PI) da -= 2 * Math.PI; if (da < -Math.PI) da += 2 * Math.PI; giro += da; }
          prev = ang; dmed += Math.hypot(q.X - MC[0], q.Y - MC[1]); n++;
        }
        dmed /= n;
        if (Math.abs(giro) > Math.PI * 1.1 && dmed > 1.5 && dmed < 14) { ultimo = performance.now(); r.length = 0; api.disparar(); }
      });
    },
    escena: function (E) {
      var L = E.lectura, cam = {}, CAT = catenarias(), G0 = 2800, G1 = 5000, A0 = 5300, A1 = 7400;
      return {
        duracion: A1 + 7400 + L,
        tarjeta: { en: A1, hasta: A1 + 6800 + L, titulo: 'La maqueta de cadenes',
          texto: 'Per calcular l’església de la Colònia Güell, Gaudí va penjar cordills amb saquets de perdigons. Cada cordill pren la corba que només treballa estirant; girada de cap per avall, és un arc que només treballa empenyent i s’aguanta sol. Hi va treballar uns deu anys a partir del 1898, i moltes solucions van acabar aquí, a la Sagrada Família. L’original es va perdre: la del museu és una reconstrucció del 1983.',
          pie: 'Maqueta polifunicular · Colònia Güell · 1898' },
        inicio: function () { E.encuadrar(MC[0], MC[1], 70, 2600); },
        cuadro: function (t) { MO.respirar(E, cam, t, A1, A1 + 7400 + L, 0.05); },
        frente: function (ctx, t) {
          var a = 1 - U.tramo(t, A1 + 6800 + L, A1 + 7400 + L), s = E.cam.s, c = E.aPantalla(MC[0], MC[1]);
          FX.foco(ctx, MC[0], MC[1], 5 * s, U.tramo(t, 1400, 2800) * a);
          var g = U.suave(U.tramo(t, G0, G1)), ang = Math.PI * g, cs = Math.cos(ang), sn = Math.sin(ang);
          // las cuerdas, encendidas en oro, giran media vuelta alrededor de la maqueta: lo que colgaba ahora se levanta
          var on = U.tramo(t, 2200, G0) * a * (1 - U.tramo(t, A0, A1));
          CAT.forEach(function (cat, k) {
            var pts = cat.map(function (q) { var x = (q[0] - MC[0]) * s, y = (-q[1] - MC[1]) * s; return [c[0] + x * cs - y * sn, c[1] + x * sn + y * cs]; });
            ctx.save(); ctx.globalAlpha = on; ctx.strokeStyle = '#f2b33d'; ctx.lineWidth = 3; ctx.shadowColor = 'rgba(242,179,61,0.8)'; ctx.shadowBlur = 10; ctx.lineCap = 'round';
            ctx.beginPath(); pts.forEach(function (p, i) { i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); }); ctx.stroke(); ctx.restore();
            // y, ya derechas, se convierten en arcos de teselas
            if (g >= 1) { var mundo = pts.map(function (p) { return E.aMundo(p[0], p[1]); }); MO.cadena(ctx, mundo, U.tramo(t, A0 + k * 200, A0 + k * 200 + 1200), { tam: Math.max(7, 0.28 * s), paleta: MO.ORO, alfa: a, semilla: 80 + k }); }
          });
        }
      };
    }
  });

  /* ---------- 5 · la cruz de Jesucristo ---------- */
  var CRUZ = S.creu;
  BC.registrar({
    id: 'sf-creu', n: 5, mundo: 'sagrada', nombre: 'La creu de Jesucrist', tipo: 'Lloc',
    pista: 'Puja fins a la creu més alta de Barcelona i toca-la.',
    lugar: function () { return CRUZ; }, radio: 220,
    detectar: function (api) {
      api.en('clic', function (d) { var E = api.motor; if (E.cam.s < 4) return; if (Math.abs(d.X) < 7.2 && d.Y > -173.2 && d.Y < -155) api.disparar(); });
    },
    escena: function (E) {
      var L = E.lectura, cam = {}, alt = MO.texto('172,5 m', 96, 7.5);
      var BRAZOS = [[0, 170.5], [-5.6, 164.7], [5.6, 164.7], [0, 158]];
      return {
        duracion: 13800 + L,
        tarjeta: { en: 5600, hasta: 13100 + L, titulo: 'La creu de Jesucrist',
          texto: 'Corona la torre més alta del temple a 172,5 metres i fa de la Sagrada Família l’església més alta del món. La darrera peça es va col·locar el 20 de febrer de 2026, i la torre es va beneir el 10 de juny de 2026, cent anys després de la mort de Gaudí. Es diu que ell la va voler una mica més baixa que Montjuïc, perquè l’obra de l’home no superés la de Déu.',
          pie: 'Torre de Jesucrist · 172,5 m · 2026' },
        inicio: function () { E.encuadrar(CRUZ[0], CRUZ[1], 34, 2600); },
        cuadro: function (t) { MO.respirar(E, cam, t, 2700, 13800 + L, 0.05); },
        frente: function (ctx, t) {
          var a = 1 - U.tramo(t, 13100 + L, 13800 + L), s = E.cam.s, c = E.aPantalla(CRUZ[0], CRUZ[1]);
          FX.foco(ctx, CRUZ[0], CRUZ[1], 10 * s, U.tramo(t, 1400, 2800) * a);
          // los cuatro brazos se encienden uno a uno, y luego toda la cruz
          BRAZOS.forEach(function (b, k) { var p = P(b[0], b[1]); MO.halo(ctx, p[0], p[1], 3.2 * s, '#fff3cf', 0.7 * U.tramo(t, 2800 + k * 450, 3300 + k * 450) * a); });
          MO.halo(ctx, c[0], c[1], 13 * s, '#fff3cf', U.suave(U.tramo(t, 4600, 5600)) * a * (0.42 + 0.08 * Math.sin(t / 400)));
          // un anillo de teselas de oro rodea la cruz
          var anillo = []; for (var k = 0; k <= 40; k++) { var an = -Math.PI / 2 + k / 40 * 6.2832; anillo.push(E.aMundo(c[0] + Math.cos(an) * 9.5 * s, c[1] + Math.sin(an) * 9.5 * s)); }
          MO.cadena(ctx, anillo, U.tramo(t, 4200, 6200), { tam: Math.max(7, 0.5 * s), alfa: a, semilla: 91, dur: 0.05 });
          var en = 0.55 * Math.min(1.2, s / 34), pt = P(CRUZ[0], -CRUZ[1] - 12);
          MO.pintarTexto(ctx, alt, pt[0], Math.min(E.H - alt.h * en / 2 - 24, pt[1]), U.tramo(t, 5400, 7600), { esc: en, salida: U.tramo(t, 12600 + L, 13700 + L) });
        }
      };
    }
  });

  /* ---------- el final: Sagrada Família cognita ---------- */
  var SITIO = { 'sf-quadrat': S.cuadrado, 'sf-vitralls': [-18.75, -20], 'sf-tomba': TOMBA, 'sf-maqueta': MC, 'sf-creu': CRUZ };
  BC.registrarFinal({
    mundo: 'sagrada',
    escena: function (E, datos) {
      var L = E.lectura, huevos = datos.huevos.slice(), est = BC.interfaz.estado(), raiz = document.documentElement, tachado = false;
      huevos.sort(function (a, b) { return (est.hallados[a.id] || a.n * 1e12) - (est.hallados[b.id] || b.n * 1e12); });
      var pts = huevos.map(function (h) { return SITIO[h.id] || [0, -85]; }), cognita = MO.texto('COGNITA', 120, 9);
      return {
        duracion: 14000 + L,
        tarjeta: { en: 8200, hasta: 13300 + L, etiqueta: ID.t('finEtqS'), titulo: 'Sagrada Família cognita', texto: ID.t('finTextoS'), pie: ID.t('finPieS') },
        inicio: function () { E.camara(E.W < 700 ? 0 : -46, -85, E.sMin(), 2400); },
        cuadro: function (t) { if (!tachado && t > 7600) { tachado = true; raiz.classList.add('cognita'); } },
        fin: function () { if (!est.finalSagrada) raiz.classList.toggle('cognita', false); },
        frente: function (ctx, t) {
          var a = 1 - U.tramo(t, 13300 + L, 14000 + L), paso = 600, t0 = 2600, n = U.clamp((t - t0) / paso, 0, pts.length);
          if (n > 1) MO.cadena(ctx, pts.slice(0, Math.ceil(n)), U.clamp((n - 1) / (Math.ceil(n) - 1), 0, 1), { tam: 6, alfa: 0.9 * a, semilla: 51, dur: 0.08 });
          pts.forEach(function (p, i) {
            var u = U.tramo(t, t0 + i * paso, t0 + i * paso + 500); if (u <= 0) return; var q = E.aPantalla(p[0], p[1]);
            MO.halo(ctx, q[0], q[1], 34, '#ffd98a', U.meseta(t, t0 + i * paso, t0 + i * paso + 300, t0 + i * paso + 600, t0 + i * paso + 1500) * a);
            MO.tesela(ctx, q[0], q[1], 13, '#f2b33d', u, 1900 + i, { alfa: a });
            FX.etiqueta(ctx, U.dos(huevos[i].n), p[0], p[1], { dy: -22, alfa: a * U.tramo(t, t0 + i * paso + 200, t0 + i * paso + 600), color: BC.color.acento });
          });
          var en = 0.8 * Math.min(1, E.W / 1100);
          MO.pintarTexto(ctx, cognita, E.W < 700 ? E.W / 2 : E.W * 0.3, Math.max(cognita.h * en / 2 + 30, E.H * 0.16), U.tramo(t, 7400, 9800), { esc: en, salida: U.tramo(t, 12800 + L, 14000 + L) });
        }
      };
    }
  });

  /* ---------- castellano e inglés ---------- */
  ID.anadir({
    finEtqS: ['Final · Cinc de cinc', 'Final · Cinco de cinco', 'Finale · Five of five'],
    finTextoS: ['Has trobat els cinc secrets del temple: el quadrat que suma 33, la llum dels vitralls, la tomba de Gaudí, la maqueta de cadenes i la creu de Jesucrist. La Sagrada Família ja no és desconeguda.',
      'Has encontrado los cinco secretos del templo: el cuadrado que suma 33, la luz de los vitrales, la tumba de Gaudí, la maqueta de cadenas y la cruz de Jesucristo. La Sagrada Família ya no es desconocida.',
      'You found the five secrets of the temple: the square that adds up to 33, the light of the windows, Gaudí’s tomb, the chain model and the cross of Jesus Christ. The Sagrada Família is no longer unknown.'],
    finPieS: ['El temple amagat · ja no tant', 'El templo escondido · ya no tanto', 'The hidden temple · not anymore']
  }, {
    'sf-quadrat': [
      { nombre: 'El cuadrado mágico', titulo: 'El cuadrado mágico', pista: 'En la fachada de la Pasión, un cuadrado donde todo suma lo mismo: la edad de Cristo. Escríbela.', pie: 'Fachada de la Pasión · Josep Maria Subirachs',
        texto: 'Josep Maria Subirachs lo esculpió en la fachada de la Pasión, junto al beso de Judas. Todas las filas, las columnas y las diagonales suman 33, la edad de Jesús al morir; también las cuatro esquinas y las cuatro casillas del centro. Se inspira en el cuadrado del grabado <i>Melancolía I</i> de Durero, que suma 34: para que sume 33, hay números repetidos y faltan dos.' },
      { nombre: 'The magic square', titulo: 'The magic square', pista: 'On the Passion façade, a square where everything adds up to the same number: Christ’s age. Type it.', pie: 'Passion façade · Josep Maria Subirachs',
        texto: 'Josep Maria Subirachs carved it on the Passion façade, next to the kiss of Judas. Every row, column and diagonal adds up to 33, Jesus’s age when he died; so do the four corners and the four central squares. It is inspired by the square in Dürer’s engraving <i>Melencolia I</i>, which adds up to 34: to make it 33, some numbers repeat and two are missing.' }],
    'sf-vitralls': [
      { nombre: 'Los vitrales', titulo: 'Los vitrales', pista: 'Vidrios fríos a levante, cálidos a poniente. Detente delante de un vitral y míralo un rato.', pie: 'Joan Vila-Grau · 1999 – 2018',
        texto: 'Los hizo Joan Vila-Grau, que trabajó en ellos casi veinte años a partir de 1999. En el lado del Nacimiento, que mira a levante, los colores son fríos, azules y verdes, para la luz de la mañana; en el de la Pasión, a poniente, son cálidos, rojos y naranjas, para la del atardecer. Abajo el vidrio es intenso y arriba más claro, para que entre más luz en la nave.' },
      { nombre: 'The stained glass', titulo: 'The stained glass', pista: 'Cool glass to the east, warm to the west. Stop in front of a window and look at it for a while.', pie: 'Joan Vila-Grau · 1999 – 2018',
        texto: 'They are by Joan Vila-Grau, who worked on them for almost twenty years from 1999. On the Nativity side, facing east, the colours are cool, blues and greens, for the morning light; on the Passion side, facing west, they are warm, reds and oranges, for the evening light. The glass is intense below and lighter above, to let more light into the nave.' }],
    'sf-tomba': [
      { nombre: 'La tumba de Gaudí', titulo: 'La tumba de Gaudí', pista: 'En la cripta, cerca del altar, descansa el arquitecto. Quédate en silencio.', pie: 'Cripta · capilla del Carmen · 12.06.1926',
        texto: 'Antoni Gaudí murió el 10 de junio de 1926, tres días después de que lo atropellara un tranvía en la Gran Via. Lo enterraron aquí, en la cripta, en la capilla de la Virgen del Carmen. Había trabajado en el templo 43 años, y los últimos casi solo en esta obra. Dicen que, cuando le preguntaban por qué iba tan despacio, respondía: «Mi cliente no tiene prisa».' },
      { nombre: 'Gaudí’s tomb', titulo: 'Gaudí’s tomb', pista: 'In the crypt, near the altar, the architect rests. Stay silent.', pie: 'Crypt · Chapel of Our Lady of Mount Carmel · 12.06.1926',
        texto: 'Antoni Gaudí died on 10 June 1926, three days after being hit by a tram on the Gran Via. He was buried here, in the crypt, in the Chapel of Our Lady of Mount Carmel. He had worked on the temple for 43 years, and in his last years almost only on this work. They say that when asked why it was going so slowly, he replied: «My client is in no hurry».' }],
    'sf-maqueta': [
      { nombre: 'La maqueta de cadenas', titulo: 'La maqueta de cadenas', pista: 'En el museo, una iglesia cuelga boca abajo. Dale la vuelta.', pie: 'Maqueta polifunicular · Colònia Güell · 1898',
        texto: 'Para calcular la iglesia de la Colònia Güell, Gaudí colgó cordeles con saquitos de perdigones. Cada cordel toma la curva que solo trabaja estirando; del revés, es un arco que solo trabaja empujando y se sostiene solo. Trabajó en ella unos diez años a partir de 1898, y muchas soluciones acabaron aquí, en la Sagrada Família. El original se perdió: la del museo es una reconstrucción de 1983.' },
      { nombre: 'The chain model', titulo: 'The chain model', pista: 'In the museum, a church hangs upside down. Turn it round.', pie: 'Polyfunicular model · Colònia Güell · 1898',
        texto: 'To design the church of the Colònia Güell, Gaudí hung strings weighted with little bags of shot. Each string takes the curve that only works in tension; upside down, it is an arch that only works in compression and stands on its own. He worked on it for about ten years from 1898, and many of its solutions ended up here, in the Sagrada Família. The original was lost: the one in the museum is a 1983 reconstruction.' }],
    'sf-creu': [
      { nombre: 'La cruz de Jesucristo', titulo: 'La cruz de Jesucristo', pista: 'Sube hasta la cruz más alta de Barcelona y tócala.', pie: 'Torre de Jesucristo · 172,5 m · 2026',
        texto: 'Corona la torre más alta del templo a 172,5 metros y hace de la Sagrada Família la iglesia más alta del mundo. La última pieza se colocó el 20 de febrero de 2026, y la torre se bendijo el 10 de junio de 2026, cien años después de la muerte de Gaudí. Se dice que él la quiso un poco más baja que Montjuïc, para que la obra del hombre no superara la de Dios.' },
      { nombre: 'The cross of Jesus Christ', titulo: 'The cross of Jesus Christ', pista: 'Climb up to the highest cross in Barcelona and touch it.', pie: 'Tower of Jesus Christ · 172.5 m · 2026',
        texto: 'It crowns the temple’s tallest tower at 172.5 metres and makes the Sagrada Família the tallest church in the world. The last piece was put in place on 20 February 2026, and the tower was blessed on 10 June 2026, a hundred years after Gaudí’s death. It is said that he wanted it slightly lower than Montjuïc, so that the work of man would not surpass the work of God.' }]
  });
})();
