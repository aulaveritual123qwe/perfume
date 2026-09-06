/* ══════════════════════════════════════════════════════════════
   MANTARO — el frasco
   Vidrio cilíndrico, tapa de metal cepillado y etiqueta de
   laboratorio. El nivel y el color del jugo se interpolan.
   ══════════════════════════════════════════════════════════════ */

const Flacon = (() => {

  const LENTO = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── color ─────────────────────────────────────────────────── */
  const hex2rgb = h => {
    h = h.replace('#','');
    if (h.length === 3) h = h.split('').map(c => c + c).join('');
    return [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)];
  };
  const rgb2hex = c =>
    '#' + c.map(v => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2,'0')).join('');

  /* mezcla en luz lineal: los acordes salen luminosos, no barrosos */
  function mezclar(items){
    if (!items.length) return '#d8bb8c';
    const total = items.reduce((s,i) => s + i.w, 0) || 1;
    const acc = [0,0,0];
    items.forEach(i => {
      const c = hex2rgb(i.color), w = i.w / total;
      for (let k = 0; k < 3; k++) acc[k] += Math.pow(c[k]/255, 2.2) * w;
    });
    return rgb2hex(acc.map(v => Math.pow(v, 1/2.2) * 255));
  }

  const aclarar = (hex, a) => {
    const c = hex2rgb(hex);
    return rgb2hex(a >= 0 ? c.map(v => v + (255 - v) * a) : c.map(v => v * (1 + a)));
  };
  const saturar = (hex, k) => {
    const c = hex2rgb(hex);
    const l = .2126*c[0] + .7152*c[1] + .0722*c[2];
    return rgb2hex(c.map(v => l + (v - l) * k));
  };
  const lerpColor = (a, b, t) => {
    const x = hex2rgb(a), y = hex2rgb(b);
    return rgb2hex(x.map((v,i) => v + (y[i] - v) * t));
  };

  /* ── el dibujo ─────────────────────────────────────────────── */
  const CUERPO = 'M100 272 C100 230 128 208 168 204 L292 204 C332 208 360 230 360 272 '
               + 'L360 674 C360 692 348 702 330 702 L130 702 C112 702 100 692 100 674 Z';

  function markup(s){
    return `
<svg class="flacon" viewBox="0 0 460 780" role="img" aria-label="Frasco MANTARO">
  <defs>
    <linearGradient id="vidrio-${s}" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0"   stop-color="#fff" stop-opacity=".34"/>
      <stop offset=".12" stop-color="#fff" stop-opacity=".06"/>
      <stop offset=".42" stop-color="#fff" stop-opacity=".14"/>
      <stop offset=".70" stop-color="#fff" stop-opacity=".04"/>
      <stop offset=".90" stop-color="#fff" stop-opacity=".20"/>
      <stop offset="1"   stop-color="#fff" stop-opacity=".38"/>
    </linearGradient>

    <linearGradient id="jugo-${s}" x1="0" y1="0" x2=".4" y2="1">
      <stop id="j1-${s}" offset="0"   stop-color="#efe0c4"/>
      <stop id="j2-${s}" offset=".5"  stop-color="#d8bb8c"/>
      <stop id="j3-${s}" offset="1"   stop-color="#9c7842"/>
    </linearGradient>

    <linearGradient id="metal-${s}" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0"   stop-color="#6e6a62"/>
      <stop offset=".14" stop-color="#c8c3b8"/>
      <stop offset=".32" stop-color="#efeae0"/>
      <stop offset=".5"  stop-color="#a9a396"/>
      <stop offset=".72" stop-color="#7c766c"/>
      <stop offset=".88" stop-color="#cdc7bb"/>
      <stop offset="1"   stop-color="#5f5b53"/>
    </linearGradient>

    <linearGradient id="brillo-${s}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0"   stop-color="#fff" stop-opacity="0"/>
      <stop offset=".24" stop-color="#fff" stop-opacity=".62"/>
      <stop offset=".6"  stop-color="#fff" stop-opacity=".14"/>
      <stop offset="1"   stop-color="#fff" stop-opacity="0"/>
    </linearGradient>

    <radialGradient id="sombra-${s}" cx=".5" cy=".5" r=".5">
      <stop offset="0"   stop-color="#0f0b08" stop-opacity=".8"/>
      <stop offset=".6"  stop-color="#0f0b08" stop-opacity=".28"/>
      <stop offset="1"   stop-color="#0f0b08" stop-opacity="0"/>
    </radialGradient>

    <radialGradient id="aura-${s}" cx=".5" cy=".5" r=".5">
      <stop id="a1-${s}" offset="0"  stop-color="#d8bb8c" stop-opacity=".4"/>
      <stop id="a2-${s}" offset="1"  stop-color="#d8bb8c" stop-opacity="0"/>
    </radialGradient>

    <clipPath id="corte-${s}"><path d="${CUERPO}"/></clipPath>
  </defs>

  <ellipse cx="232" cy="452" rx="212" ry="248" fill="url(#aura-${s})"/>
  <ellipse cx="234" cy="722" rx="150" ry="22" fill="url(#sombra-${s})"/>

  <g id="grupo-${s}">
    <!-- tapa de metal cepillado -->
    <g>
      <rect x="176" y="46" width="108" height="126" rx="6" fill="url(#metal-${s})"/>
      <rect x="176" y="46" width="108" height="9" rx="4" fill="#f2ede3" opacity=".5"/>
      <rect x="176" y="163" width="108" height="9" rx="4" fill="#3f3b35" opacity=".45"/>
      ${[192,206,238,262].map(x => `<rect x="${x}" y="52" width="1.6" height="114" fill="#fff" opacity=".16"/>`).join('')}
    </g>

    <!-- cuello -->
    <path d="M198 172 L262 172 L258 210 L202 210 Z" fill="url(#vidrio-${s})" stroke="rgba(255,255,255,.22)" stroke-width="1"/>

    <!-- vidrio -->
    <path d="${CUERPO}" fill="url(#vidrio-${s})"/>

    <!-- jugo -->
    <g clip-path="url(#corte-${s})">
      <rect id="jugo-r-${s}" x="60" y="430" width="340" height="360" fill="url(#jugo-${s})"/>
      <ellipse id="menisco-${s}" cx="230" cy="430" rx="170" ry="11" fill="#fff" fill-opacity=".28"/>
      <!-- base gruesa de vidrio -->
      <rect x="60" y="664" width="340" height="40" fill="#fff" opacity=".14"/>
      <ellipse cx="230" cy="666" rx="140" ry="13" fill="#fff" opacity=".18"/>
    </g>

    <!-- tubo interior -->
    <path id="tubo-${s}" d="M231 206 L228 690" stroke="rgba(255,255,255,.5)" stroke-width="3.2" fill="none"/>
    <path d="M231 206 L228 690" stroke="rgba(120,95,60,.35)" stroke-width="1.2" fill="none"/>

    <!-- canto del vidrio -->
    <path d="${CUERPO}" fill="none" stroke="rgba(255,255,255,.42)" stroke-width="1.5"/>
    <path d="${CUERPO}" fill="none" stroke="rgba(255,255,255,.12)" stroke-width="8"/>

    <!-- etiqueta -->
    <g>
      <rect x="128" y="392" width="204" height="186" fill="#efe9dc"/>
      <rect x="128" y="392" width="204" height="186" fill="none" stroke="#d5cdbd" stroke-width="1"/>
      <text id="nombre-${s}" class="et-nombre" x="140" y="420">MANTARO</text>
      <text class="et-linea" x="140" y="437">50ml 1,7 FL.OZ.</text>
      <line x1="128" y1="446" x2="332" y2="446" stroke="#c9c0ae" stroke-width="1"/>
      <text class="et-linea" x="140" y="463">eau de parfum / vaporisateur</text>
      <text class="et-linea" x="140" y="477">natural spray</text>
      <line x1="128" y1="487" x2="332" y2="487" stroke="#c9c0ae" stroke-width="1"/>
      <text class="et-linea" x="140" y="504">Elaborado:</text>
      <text class="et-linea" x="212" y="504">en nuestro lab</text>
      <text class="et-linea" x="140" y="522">Frescor:</text>
      <text id="frescor-${s}" class="et-linea" x="212" y="522">12 meses</text>
      <line x1="128" y1="532" x2="332" y2="532" stroke="#c9c0ae" stroke-width="1"/>
      <text class="et-linea" x="140" y="550">Hecho a mano - MANTARO</text>
      <text class="et-linea" x="140" y="564">Lima, Perú</text>
    </g>

    <!-- reflejos -->
    <g clip-path="url(#corte-${s})">
      <rect class="brillo brillo-a" x="116" y="200" width="20" height="510" rx="10" fill="url(#brillo-${s})"/>
      <rect class="brillo brillo-b" x="330" y="200" width="12" height="510" rx="6" fill="url(#brillo-${s})"/>
      <rect class="brillo brillo-barrido" x="-120" y="180" width="56" height="560" rx="28" fill="url(#brillo-${s})" opacity=".5"/>
    </g>
  </g>
</svg>`;
  }

  /* ── instancias ────────────────────────────────────────────── */
  const vivos = [];

  function mount(contenedor, s){
    if (!contenedor || contenedor.querySelector('svg')) return;
    /* añade el frasco sin borrar otros hijos ya presentes (p. ej. el pedestal del héroe) */
    contenedor.insertAdjacentHTML('beforeend', markup(s));
    const q = id => contenedor.querySelector('#' + id + '-' + s);
    vivos.push({
      jugo: q('jugo-r'), menisco: q('menisco'),
      j1: q('j1'), j2: q('j2'), j3: q('j3'),
      a1: q('a1'), a2: q('a2'),
      nombre: q('nombre'), tubo: q('tubo'),
      svg: contenedor.querySelector('svg')
    });
    pintar();
  }

  /* ── estado + interpolación ────────────────────────────────── */
  const meta = { color:'#d8bb8c', nivel:.30 };
  const hoy  = { color:'#d8bb8c', nivel:.30 };
  let raf = null;

  const ARRIBA = 640, RECORRIDO = 330;   // el nivel nunca tapa la etiqueta

  function pintar(){
    const y = ARRIBA - hoy.nivel * RECORRIDO;
    const claro = saturar(aclarar(hoy.color,  .34), 1.05);
    const hondo = saturar(aclarar(hoy.color, -.42), 1.1);

    vivos.forEach(v => {
      v.jugo.setAttribute('y', y.toFixed(1));
      v.jugo.setAttribute('height', (790 - y).toFixed(1));
      v.menisco.setAttribute('cy', y.toFixed(1));
      v.j1.setAttribute('stop-color', claro);
      v.j2.setAttribute('stop-color', hoy.color);
      v.j3.setAttribute('stop-color', hondo);
      v.a1.setAttribute('stop-color', hoy.color);
      v.a2.setAttribute('stop-color', hoy.color);
    });

    const raiz = document.documentElement.style;
    raiz.setProperty('--jugo-claro', claro);
    raiz.setProperty('--jugo', hoy.color);
    raiz.setProperty('--jugo-hondo', hondo);
  }

  function correr(){
    const k = LENTO ? 1 : .085;
    hoy.nivel += (meta.nivel - hoy.nivel) * k;
    hoy.color  = lerpColor(hoy.color, meta.color, k);
    pintar();
    const quieto = Math.abs(meta.nivel - hoy.nivel) < .0015 && hoy.color === meta.color;
    raf = quieto ? null : requestAnimationFrame(correr);
    if (quieto){ hoy.nivel = meta.nivel; hoy.color = meta.color; pintar(); }
  }
  const empujar = () => { if (!raf) raf = requestAnimationFrame(correr); };

  function setColor(hex){ meta.color = hex; empujar(); }
  function setNivel(v){ meta.nivel = Math.max(.12, Math.min(.92, v)); empujar(); }
  function setNombre(txt){
    const t = (txt || 'MANTARO').toUpperCase();
    vivos.forEach(v => {
      v.nombre.textContent = t.length > 15 ? t.slice(0,15) : t;
      v.nombre.classList.remove('et-pop');
      void v.nombre.getBBox();
      v.nombre.classList.add('et-pop');
    });
  }

  /* ── parallax del frasco del inicio ────────────────────────── */
  function parallax(contenedor){
    if (LENTO || !contenedor) return;
    let tx = 0, ty = 0, cx = 0, cy = 0, r = null;
    const paso = () => {
      cx += (tx - cx) * .075;
      cy += (ty - cy) * .075;
      const svg = contenedor.querySelector('svg');
      if (svg){
        svg.style.setProperty('--rx', (-cy * 7).toFixed(2) + 'deg');
        svg.style.setProperty('--ry', ( cx * 12).toFixed(2) + 'deg');
        svg.style.setProperty('--tx', ( cx * 15).toFixed(1) + 'px');
        svg.style.setProperty('--ty', ( cy * 11).toFixed(1) + 'px');
      }
      r = (Math.abs(tx-cx) > .001 || Math.abs(ty-cy) > .001) ? requestAnimationFrame(paso) : null;
    };
    const arrancar = () => { if (!r) r = requestAnimationFrame(paso); };
    window.addEventListener('pointermove', e => {
      tx = Math.max(-1.3, Math.min(1.3, (e.clientX / innerWidth  - .5) * 2));
      ty = Math.max(-1.3, Math.min(1.3, (e.clientY / innerHeight - .5) * 2));
      arrancar();
    }, { passive:true });
    window.addEventListener('pointerleave', () => { tx = 0; ty = 0; arrancar(); }, { passive:true });
  }

  return { mount, setColor, setNivel, setNombre, parallax, mezclar, aclarar, saturar };
})();
