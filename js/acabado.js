/* Barcelona Incognita · el acabado de mosaico de la interfaz (Pau, 31/10/2026)
   Los paneles y botones (título, cuaderno, instrumentos, ayuda, idiomas, avisos, botones de la entrada y los créditos)
   llevan el mismo trencadís que el mapa, pintado una vez con las mismas piezas (BC.mapa.pieza) y puesto como imagen CSS:
     --mosaico-fondo   un trencadís oscuro (cerámica casi negra con su junta y un esmalte muy suave), que se repite
     --mosaico-ribete  una tira de teselas de colores (oro, terracota, cobalto, verde, cal) que enmarca el panel por los cuatro lados
     --mosaico-ribete-v la misma tira en vertical, para los lados
     --mosaico-oro     teselas de oro, para el botón activo y los botones al pasar el cursor */
(function () {
  'use strict';
  var BC = window.BC, M = BC.mapa, d = Math.min(window.devicePixelRatio || 1, 2);
  function lienzo(w, h) { var c = document.createElement('canvas'); c.width = w * d; c.height = h * d; var x = c.getContext('2d'); x.setTransform(d, 0, 0, d, 0, 0); return { c: c, x: x }; }
  // una rejilla de cuadriláteros con las esquinas movidas que encaja sin costura al repetirse (las esquinas del borde se repiten)
  function rejilla(x, w, h, paso, junta, pal, sem, k0, k1, canto) {
    var nx = Math.round(w / paso), ny = Math.max(1, Math.round(h / paso)), px = w / nx, py = h / ny;
    function e(i, j) {
      var ii = ((i % nx) + nx) % nx, jj = ((j % ny) + ny) % ny, mx = (M.h(ii, jj, sem) - 0.5) * 0.42, my = (M.h(jj, ii, sem + 1) - 0.5) * 0.42;
      return [(i + mx) * px, (j + my) * py];
    }
    x.fillStyle = junta; x.fillRect(0, 0, w, h);
    for (var j = -1; j <= ny; j++) for (var i = -1; i <= nx; i++) {
      var q = [e(i, j), e(i + 1, j), e(i + 1, j + 1), e(i, j + 1)], ii = ((i % nx) + nx) % nx, jj = ((j % ny) + ny) % ny;
      var col = pal[Math.floor(M.h(ii * 3, jj * 7, sem + 2) * pal.length)];
      M.pieza(x, q, M.tono(col, k0 + M.h(jj, ii, sem + 3) * (k1 - k0)), Math.max(0.6, paso * 0.07), (canto || 1) * Math.max(0.6, paso * 0.06));
    }
  }
  var fondo = lienzo(120, 120);
  rejilla(fondo.x, 120, 120, 15, '#100d0b', ['#1d1814', '#1b1612', '#1f1a15', '#1a1511'], 41, 0.98, 1.04, 0.45);   // tonos muy juntos y cantos suaves: textura, no dibujo (Pau: «más legible»)
  var ribete = lienzo(132, 6);
  rejilla(ribete.x, 132, 6, 6, '#0b0907', ['#f2b33d', '#e8892f', '#c9693e', '#2f5fae', '#4f9a3c', '#f3eee2', '#f2b33d', '#3b7dc4'], 7, 0.95, 1.08);
  // la misma tira en vertical, para los lados (el marco da la vuelta entera, Pau 31/10)
  var ribeteV = lienzo(6, 132);
  rejilla(ribeteV.x, 6, 132, 6, '#0b0907', ['#f2b33d', '#e8892f', '#c9693e', '#2f5fae', '#4f9a3c', '#f3eee2', '#f2b33d', '#3b7dc4'], 19, 0.95, 1.08);
  var oro = lienzo(60, 60);
  rejilla(oro.x, 60, 60, 12, '#8a5f1c', ['#f2b33d', '#f4c24e', '#e9a92e', '#f6cf6a'], 13, 0.96, 1.06);
  var r = document.documentElement.style;
  r.setProperty('--mosaico-fondo', 'url(' + fondo.c.toDataURL('image/png') + ')');
  r.setProperty('--mosaico-ribete', 'url(' + ribete.c.toDataURL('image/png') + ')');
  r.setProperty('--mosaico-ribete-v', 'url(' + ribeteV.c.toDataURL('image/png') + ')');
  r.setProperty('--mosaico-oro', 'url(' + oro.c.toDataURL('image/png') + ')');
  document.documentElement.classList.add('con-mosaico');
})();
