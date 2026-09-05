/* ══════════════════════════════════════════════════════════════
   MANTARO — materias primas
   Cada ingrediente se dibuja con volumen, textura de superficie y
   sombra propia. La luz siempre entra por arriba a la izquierda.
   Si existe img/<id>.jpg y el id está en img/manifest.json,
   la foto real reemplaza la lámina.
   ══════════════════════════════════════════════════════════════ */

/* ── filtros de material, uno por lámina ─────────────────────── */
function filtros(id){
  return `
  <filter id="fx-poro-${id}" x="-6%" y="-6%" width="112%" height="112%">
    <feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="4" seed="3" result="n"/>
    <feDiffuseLighting in="n" surfaceScale="1.5" diffuseConstant="1" lighting-color="#fff" result="l">
      <feDistantLight azimuth="135" elevation="58"/>
    </feDiffuseLighting>
    <feComposite in="l" in2="SourceAlpha" operator="in" result="lr"/>
    <feBlend in="SourceGraphic" in2="lr" mode="multiply"/>
  </filter>

  <filter id="fx-veta-${id}" x="-6%" y="-6%" width="112%" height="112%">
    <feTurbulence type="fractalNoise" baseFrequency=".013 .82" numOctaves="4" seed="11" result="n"/>
    <feDiffuseLighting in="n" surfaceScale="2.2" diffuseConstant="1.05" lighting-color="#fff" result="l">
      <feDistantLight azimuth="140" elevation="52"/>
    </feDiffuseLighting>
    <feComposite in="l" in2="SourceAlpha" operator="in" result="lr"/>
    <feBlend in="SourceGraphic" in2="lr" mode="multiply"/>
  </filter>

  <filter id="fx-fibra-${id}" x="-6%" y="-6%" width="112%" height="112%">
    <feTurbulence type="fractalNoise" baseFrequency=".7 .05" numOctaves="3" seed="5" result="n"/>
    <feDiffuseLighting in="n" surfaceScale="1.8" diffuseConstant="1" lighting-color="#fff" result="l">
      <feDistantLight azimuth="135" elevation="55"/>
    </feDiffuseLighting>
    <feComposite in="l" in2="SourceAlpha" operator="in" result="lr"/>
    <feBlend in="SourceGraphic" in2="lr" mode="multiply"/>
  </filter>

  <filter id="fx-aspero-${id}" x="-6%" y="-6%" width="112%" height="112%">
    <feTurbulence type="fractalNoise" baseFrequency=".16" numOctaves="5" seed="19" result="n"/>
    <feDiffuseLighting in="n" surfaceScale="3.4" diffuseConstant="1.05" lighting-color="#fff" result="l">
      <feDistantLight azimuth="135" elevation="46"/>
    </feDiffuseLighting>
    <feComposite in="l" in2="SourceAlpha" operator="in" result="lr"/>
    <feBlend in="SourceGraphic" in2="lr" mode="multiply"/>
  </filter>

  <filter id="fx-mate-${id}" x="-6%" y="-6%" width="112%" height="112%">
    <feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="3" seed="29" result="n"/>
    <feDiffuseLighting in="n" surfaceScale=".9" diffuseConstant="1" lighting-color="#fff" result="l">
      <feDistantLight azimuth="135" elevation="62"/>
    </feDiffuseLighting>
    <feComposite in="l" in2="SourceAlpha" operator="in" result="lr"/>
    <feBlend in="SourceGraphic" in2="lr" mode="multiply"/>
  </filter>

  <filter id="fx-suave-${id}" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="9"/></filter>
  <filter id="fx-micro-${id}" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="2.2"/></filter>
  <filter id="fx-hilo-${id}"  x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation=".9"/></filter>`;
}

/* ── piezas reutilizables ────────────────────────────────────── */

/* cuerpo esférico: degradado radial, luz de rebote y especular */
function esfera(id, k, o){
  const { cx, cy, r, claro, base, oscuro, rebote = '#ffffff', tex = 'poro', brillo = .5 } = o;
  return {
    defs: `<radialGradient id="${k}-${id}" cx=".34" cy=".26" r=".84">
      <stop offset="0"   stop-color="${claro}"/>
      <stop offset=".40" stop-color="${base}"/>
      <stop offset=".80" stop-color="${oscuro}"/>
      <stop offset="1"   stop-color="${oscuro}"/>
    </radialGradient>`,
    body: `
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#${k}-${id})" filter="url(#fx-${tex}-${id})"/>
      <path d="M${cx - r * .88} ${cy + r * .46} A${r * .98} ${r * .98} 0 0 0 ${cx + r * .66} ${cy + r * .72}"
            stroke="${rebote}" stroke-width="${(r * .14).toFixed(1)}" fill="none" opacity=".38" filter="url(#fx-micro-${id})"/>
      <ellipse cx="${cx - r * .33}" cy="${cy - r * .43}" rx="${(r * .27).toFixed(1)}" ry="${(r * .17).toFixed(1)}"
               transform="rotate(-28 ${cx - r * .33} ${cy - r * .43})" fill="#fff" opacity="${brillo}" filter="url(#fx-micro-${id})"/>
      <ellipse cx="${cx - r * .21}" cy="${cy - r * .55}" rx="${(r * .075).toFixed(1)}" ry="${(r * .05).toFixed(1)}"
               fill="#fff" opacity="${(brillo + .28).toFixed(2)}"/>`
  };
}

/* media fruta cortada: gajos translúcidos, albedo y pared de cáscara */
function corte(id, k, o){
  const { cx, cy, r, gajos = 10, pulpa, pulpaOsc, jugo, albedo, piel, pielOsc } = o;
  const seg = [];
  for (let i = 0; i < gajos; i++){
    const a = (i * 360 / gajos - 90) * Math.PI / 180;
    const b = ((i + 1) * 360 / gajos - 90) * Math.PI / 180;
    const rr = r * .74;
    seg.push(`<path d="M${cx} ${cy} L${(cx + Math.cos(a) * rr).toFixed(1)} ${(cy + Math.sin(a) * rr).toFixed(1)}
      A${rr} ${rr} 0 0 1 ${(cx + Math.cos(b) * rr).toFixed(1)} ${(cy + Math.sin(b) * rr).toFixed(1)} Z"
      fill="url(#${k}g-${id})" stroke="${albedo}" stroke-width="${(r * .045).toFixed(1)}" stroke-linejoin="round"/>`);
  }
  /* gotas de jugo sobre la pulpa */
  const gotas = [[.30,-.34,.055],[-.36,.12,.045],[.10,.44,.05],[-.14,-.46,.038],[.46,.16,.036]]
    .map(([dx,dy,s]) => `<ellipse cx="${(cx + r*dx).toFixed(1)}" cy="${(cy + r*dy).toFixed(1)}"
      rx="${(r*s).toFixed(1)}" ry="${(r*s*.72).toFixed(1)}" fill="#fff" opacity=".5"/>`).join('');

  return {
    defs: `
      <radialGradient id="${k}p-${id}" cx=".36" cy=".28" r=".8">
        <stop offset="0" stop-color="${piel}"/><stop offset="1" stop-color="${pielOsc}"/>
      </radialGradient>
      <radialGradient id="${k}g-${id}" cx=".4" cy=".3" r=".85">
        <stop offset="0"   stop-color="${jugo}"/>
        <stop offset=".55" stop-color="${pulpa}"/>
        <stop offset="1"   stop-color="${pulpaOsc}"/>
      </radialGradient>`,
    body: `
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#${k}p-${id})" filter="url(#fx-poro-${id})"/>
      <circle cx="${cx}" cy="${cy}" r="${(r * .86).toFixed(1)}" fill="${albedo}" filter="url(#fx-mate-${id})"/>
      ${seg.join('')}
      <circle cx="${cx}" cy="${cy}" r="${(r * .09).toFixed(1)}" fill="${albedo}"/>
      ${gotas}
      <circle cx="${cx}" cy="${cy}" r="${(r * .86).toFixed(1)}" fill="none" stroke="#fff" stroke-width="${(r*.03).toFixed(1)}" opacity=".35"/>
      <path d="M${cx - r*.7} ${cy - r*.5} A${r} ${r} 0 0 1 ${cx + r*.1} ${cy - r*.94}"
            stroke="#fff" stroke-width="${(r*.09).toFixed(1)}" fill="none" opacity=".3" filter="url(#fx-micro-${id})" stroke-linecap="round"/>`
  };
}

/* sombra propia bajo un objeto */
const sombraDe = (id, cx, cy, rx, ry, op = .34) =>
  `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#241a10" opacity="${op}" filter="url(#fx-suave-${id})"/>`;

/* hoja con nervadura y volumen */
function hoja(id, k, o){
  const { x, y, rot, esc = 1, claro, base, oscuro, largo = 62, ancho = 34, tex = 'mate' } = o;
  return {
    defs: `<linearGradient id="${k}-${id}" x1=".2" y1="0" x2=".85" y2="1">
      <stop offset="0" stop-color="${claro}"/><stop offset=".5" stop-color="${base}"/><stop offset="1" stop-color="${oscuro}"/>
    </linearGradient>`,
    body: `<g transform="translate(${x},${y}) rotate(${rot}) scale(${esc})">
      <path d="M0 ${-largo} C${ancho} ${-largo*.6} ${ancho*1.1} ${largo*.35} 0 ${largo}
               C${-ancho*1.1} ${largo*.35} ${-ancho} ${-largo*.6} 0 ${-largo} Z"
            fill="url(#${k}-${id})" filter="url(#fx-${tex}-${id})"/>
      <path d="M0 ${-largo*.92} L0 ${largo*.9}" stroke="${claro}" stroke-width="2.4" opacity=".55"/>
      ${[-.55,-.28,0,.3,.58].map(v => `<path d="M0 ${(largo*v).toFixed(0)} C${(ancho*.4)} ${(largo*v+largo*.08).toFixed(0)} ${(ancho*.62)} ${(largo*v+largo*.2).toFixed(0)} ${(ancho*.78)} ${(largo*v+largo*.26).toFixed(0)}
        M0 ${(largo*v).toFixed(0)} C${(-ancho*.4)} ${(largo*v+largo*.08).toFixed(0)} ${(-ancho*.62)} ${(largo*v+largo*.2).toFixed(0)} ${(-ancho*.78)} ${(largo*v+largo*.26).toFixed(0)}"
        stroke="${claro}" stroke-width="1.5" fill="none" opacity=".35"/>`).join('')}
      <path d="M${-ancho*.5} ${-largo*.55} C${-ancho*.2} ${-largo*.75} ${ancho*.1} ${-largo*.8} ${ancho*.3} ${-largo*.6}"
            stroke="#fff" stroke-width="4" fill="none" opacity=".22" filter="url(#fx-micro-${id})" stroke-linecap="round"/>
    </g>`
  };
}

/* tabla de madera con veta y canto */
function tabla(id, k, o){
  const { x, y, rot, w, h, claro, base, oscuro, canto } = o;
  return {
    defs: `<linearGradient id="${k}-${id}" x1="0" y1="0" x2=".3" y2="1">
      <stop offset="0" stop-color="${claro}"/><stop offset=".45" stop-color="${base}"/><stop offset="1" stop-color="${oscuro}"/>
    </linearGradient>`,
    body: `<g transform="translate(${x},${y}) rotate(${rot})">
      <rect x="${-w/2}" y="${-h/2}" width="${w}" height="${h}" rx="4" fill="url(#${k}-${id})" filter="url(#fx-veta-${id})"/>
      <rect x="${-w/2}" y="${-h/2}" width="${w}" height="${(h*.2).toFixed(1)}" rx="4" fill="#fff" opacity=".16"/>
      <rect x="${-w/2}" y="${(h/2 - h*.26).toFixed(1)}" width="${w}" height="${(h*.26).toFixed(1)}" rx="4" fill="${canto}" opacity=".55"/>
      <path d="M${-w/2+8} ${-h*.12} C${-w*.15} ${-h*.2} ${w*.15} ${-h*.05} ${w/2-8} ${-h*.16}"
            stroke="${oscuro}" stroke-width="1.6" fill="none" opacity=".45"/>
      <path d="M${-w/2+8} ${h*.16} C${-w*.15} ${h*.08} ${w*.15} ${h*.22} ${w/2-8} ${h*.1}"
            stroke="${oscuro}" stroke-width="1.3" fill="none" opacity=".35"/>
    </g>`
  };
}

/* junta defs + body de varias piezas */
const armar = piezas => ({
  defs: piezas.map(p => p.defs).join(''),
  body: piezas.map(p => p.body).join('')
});

/* ══════════ SUJETOS ══════════ */
const ART = {

vainilla: id => {
  const vaina = (dx, dy, rot, c1, c2, c3) => ({
    defs: `<linearGradient id="vv${dx}-${id}" x1=".1" y1="0" x2=".9" y2=".4">
      <stop offset="0" stop-color="${c1}"/><stop offset=".38" stop-color="${c2}"/><stop offset="1" stop-color="${c3}"/>
    </linearGradient>`,
    body: `<g transform="translate(${dx},${dy}) rotate(${rot})">
      <path d="M-96 34 C-52 -6 6 -46 88 -62 C96 -58 98 -50 94 -44 C16 -26 -40 12 -84 48 Z"
            fill="url(#vv${dx}-${id})" filter="url(#fx-fibra-${id})"/>
      <path d="M-90 30 C-48 -8 8 -44 86 -58" stroke="#fff" stroke-width="2.6" fill="none" opacity=".22" filter="url(#fx-hilo-${id})"/>
      <path d="M-84 46 C-42 12 12 -26 92 -46" stroke="#0d0805" stroke-width="2" fill="none" opacity=".4"/>
      ${[-60,-24,12,48].map(v => `<path d="M${v} ${(-v*.42-6).toFixed(0)} l6 12" stroke="#0d0805" stroke-width="1.4" opacity=".35"/>`).join('')}
    </g>`
  });

  const petalo = (cx, cy, rx, ry, rot, c1, c2) => ({
    defs: `<linearGradient id="vp${cx}${cy}-${id}" x1=".2" y1="0" x2=".8" y2="1">
      <stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/>
    </linearGradient>`,
    body: `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" transform="rotate(${rot} ${cx} ${cy})"
            fill="url(#vp${cx}${cy}-${id})" filter="url(#fx-mate-${id})"/>`
  });

  return armar([
    { defs:'', body: sombraDe(id, 214, 336, 118, 20) },
    vaina(-4, 18, 6,  '#6b4c34', '#3a281b', '#170f09'),
    vaina(6, 44, -2,  '#5c4029', '#2e2015', '#120c07'),
    vaina(16, 68, 4,  '#523823', '#281b11', '#0e0906'),
    { defs:'', body: sombraDe(id, 262, 316, 46, 12, .3) },
    petalo(240, 292, 30, 17, -22, '#fffaf0', '#d9c9a8'),
    petalo(276, 274, 32, 17,  14, '#fdf6e8', '#cdbb98'),
    petalo(282, 306, 30, 16,  -6, '#fffbf2', '#d5c4a2'),
    petalo(246, 264, 26, 15, -54, '#f6eeda', '#c2b090'),
    { defs: `<radialGradient id="vc-${id}" cx=".35" cy=".3" r=".8">
        <stop offset="0" stop-color="#f3e2b6"/><stop offset="1" stop-color="#b99a63"/></radialGradient>`,
      body: `<ellipse cx="262" cy="288" rx="14" ry="12" fill="url(#vc-${id})" filter="url(#fx-mate-${id})"/>
             <ellipse cx="257" cy="283" rx="4" ry="3" fill="#fff" opacity=".7"/>` }
  ]);
},

lavanda: id => {
  const tallo = (x, dy, rot, i) => {
    const flores = Array.from({ length: 11 }, (_, k) => {
      const yy = -70 + k * 8.4, xx = k % 2 ? 5.5 : -5.5;
      const c = k % 3 === 0 ? '#4e3f7e' : k % 3 === 1 ? '#6d5da6' : '#5b4d92';
      return `<ellipse cx="${xx}" cy="${yy}" rx="7.6" ry="5.8" fill="${c}" filter="url(#fx-mate-${id})"/>
              <ellipse cx="${xx - 2}" cy="${yy - 2}" rx="2.6" ry="1.8" fill="#b8a9e0" opacity=".55"/>`;
    }).join('');
    return {
      defs: '',
      body: `<g transform="translate(${x},${dy}) rotate(${rot})">
        <path d="M0 52 C-4 6 -3 -30 0 -66" stroke="url(#lt-${id})" stroke-width="4.6" fill="none" stroke-linecap="round" filter="url(#fx-fibra-${id})"/>
        ${flores}
        <ellipse cx="0" cy="-80" rx="6.4" ry="8" fill="#7565b2" filter="url(#fx-mate-${id})"/>
        <ellipse cx="-2" cy="-83" rx="2.4" ry="2.8" fill="#c4b6e8" opacity=".6"/>
      </g>`
    };
  };
  return armar([
    { defs: `<linearGradient id="lt-${id}" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#8b9668"/><stop offset=".5" stop-color="#66714a"/><stop offset="1" stop-color="#414a2c"/>
      </linearGradient>`,
      body: sombraDe(id, 224, 340, 100, 18) },
    tallo(160, 274, -9, 0), tallo(190, 268, -4, 1),
    tallo(220, 272, 1, 2),  tallo(250, 266, 6, 3), tallo(278, 274, 11, 4),
    { defs: `<linearGradient id="lz-${id}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#8a7a5c"/><stop offset="1" stop-color="#544726"/></linearGradient>`,
      body: `<path d="M148 318 C186 336 250 336 292 318 L288 336 C248 352 190 352 152 336 Z"
              fill="url(#lz-${id})" filter="url(#fx-fibra-${id})"/>
             <path d="M150 320 C188 336 250 336 290 320" stroke="#b7a684" stroke-width="2" fill="none" opacity=".45"/>` }
  ]);
},

limon: id => armar([
  { defs:'', body: sombraDe(id, 212, 330, 118, 20) },
  esfera(id, 'li', { cx:162, cy:262, r:66, claro:'#d8e88a', base:'#8dbd3c', oscuro:'#3f6317', rebote:'#c8dd7a', brillo:.42 }),
  { defs:'', body: `<path d="M162 196 C138 202 128 214 130 226 C142 214 152 204 168 200 Z" fill="#4d6b23" filter="url(#fx-mate-${id})"/>` },
  corte(id, 'lc', { cx:276, cy:274, r:56, gajos:9, piel:'#dcea9e', pielOsc:'#93b348',
                    albedo:'#f4f7e2', jugo:'#fbfde8', pulpa:'#e2f0ac', pulpaOsc:'#b9d472' })
]),

canela: id => {
  const quill = (x, y, rot, l, c1, c2, c3) => ({
    defs: `<linearGradient id="cq${x}-${id}" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${c3}"/><stop offset=".22" stop-color="${c1}"/>
      <stop offset=".55" stop-color="${c2}"/><stop offset="1" stop-color="${c3}"/>
    </linearGradient>
    <radialGradient id="cb${x}-${id}" cx=".4" cy=".35" r=".7">
      <stop offset="0" stop-color="#c98c55"/><stop offset=".6" stop-color="#8a5227"/><stop offset="1" stop-color="#3f2410"/>
    </radialGradient>`,
    body: `<g transform="translate(${x},${y}) rotate(${rot})">
      <rect x="-19" y="${-l/2}" width="38" height="${l}" rx="18" fill="url(#cq${x}-${id})" filter="url(#fx-fibra-${id})"/>
      <path d="M-8 ${-l/2+4} L-6 ${l/2-4}" stroke="#2f1a0a" stroke-width="2.4" opacity=".45"/>
      <path d="M9 ${-l/2+4} L7 ${l/2-4}" stroke="#2f1a0a" stroke-width="1.8" opacity=".3"/>
      <path d="M-13 ${-l/2+6} L-12 ${l/2-6}" stroke="#e2b183" stroke-width="2" opacity=".3"/>
      <ellipse cx="0" cy="${-l/2}" rx="19" ry="7.6" fill="url(#cb${x}-${id})"/>
      <ellipse cx="1" cy="${-l/2}" rx="9" ry="3.4" fill="#331c0b"/>
      <ellipse cx="-6" cy="${-l/2-1}" rx="3" ry="1.4" fill="#d8a273" opacity=".6"/>
    </g>`
  });
  return armar([
    { defs:'', body: sombraDe(id, 224, 348, 108, 18) },
    quill(168, 266, -9, 168, '#a86232', '#7c4220', '#4a2610'),
    quill(214, 258,  3, 178, '#b56f3c', '#8b4c25', '#512a12'),
    quill(262, 270, 13, 164, '#9d5a2c', '#733d1c', '#43220e')
  ]);
},

toronja: id => armar([
  { defs:'', body: sombraDe(id, 218, 336, 116, 20) },
  corte(id, 'tc', { cx:206, cy:262, r:80, gajos:11, piel:'#f2c2a4', pielOsc:'#c47a56',
                    albedo:'#f8ece2', jugo:'#f8b9a4', pulpa:'#e07f66', pulpaOsc:'#b8543c' }),
  esfera(id, 'te', { cx:302, cy:298, r:44, claro:'#f6d0ae', base:'#e0996e', oscuro:'#a35c33', rebote:'#f0bb96', brillo:.4 })
]),

mandarina: id => armar([
  { defs:'', body: sombraDe(id, 214, 336, 112, 19) },
  esfera(id, 'ma', { cx:180, cy:266, r:70, claro:'#ffcf7e', base:'#e8862a', oscuro:'#9c4a0c', rebote:'#f7b463', brillo:.44 }),
  { defs: `<linearGradient id="mh-${id}" x1=".1" y1="0" x2=".9" y2="1">
      <stop offset="0" stop-color="#7f9d4c"/><stop offset=".5" stop-color="#4f6b2c"/><stop offset="1" stop-color="#2c3f18"/>
    </linearGradient>`,
    body: `<path d="M178 196 C192 172 226 164 250 176 C234 198 206 204 178 196 Z" fill="url(#mh-${id})" filter="url(#fx-mate-${id})"/>
           <path d="M180 195 C198 180 222 174 246 177" stroke="#a2bd70" stroke-width="2.4" fill="none" opacity=".6"/>
           <path d="M176 198 C172 190 172 184 174 178" stroke="#5c4a22" stroke-width="5" fill="none" stroke-linecap="round"/>` },
  { defs: `<radialGradient id="mg-${id}" cx=".2" cy=".3" r=".9">
      <stop offset="0" stop-color="#ffe0ae"/><stop offset=".5" stop-color="#f5a949"/><stop offset="1" stop-color="#d0761f"/>
    </radialGradient>`,
    body: `${sombraDe(id, 292, 330, 44, 11, .3)}
      <path d="M266 306 A46 46 0 0 1 266 218 Z" fill="url(#mg-${id})" filter="url(#fx-mate-${id})"/>
      <path d="M266 306 A46 46 0 0 1 266 218" fill="none" stroke="#fdddb0" stroke-width="4.6" opacity=".85"/>
      ${Array.from({length:7},(_,k)=>`<path d="M266 ${232+k*11} l16 ${k<3?4:-4}" stroke="#fff" stroke-width="1.5" opacity=".3"/>`).join('')}
      <path d="M300 292 A34 34 0 0 1 300 232 Z" fill="url(#mg-${id})" filter="url(#fx-mate-${id})"/>
      <path d="M300 292 A34 34 0 0 1 300 232" fill="none" stroke="#fde2bb" stroke-width="4" opacity=".8"/>
      <ellipse cx="278" cy="248" rx="7" ry="4" fill="#fff" opacity=".45" filter="url(#fx-micro-${id})"/>` }
]),

ambar: id => armar([
  { defs:'', body: sombraDe(id, 224, 340, 96, 17, .42) },
  { defs: `
      <linearGradient id="a1-${id}" x1=".1" y1="0" x2=".8" y2="1">
        <stop offset="0" stop-color="#ffd98a"/><stop offset=".45" stop-color="#e39a2c"/><stop offset="1" stop-color="#a85f0d"/>
      </linearGradient>
      <linearGradient id="a2-${id}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#d78e26"/><stop offset="1" stop-color="#7d4207"/>
      </linearGradient>
      <linearGradient id="a3-${id}" x1="0" y1="0" x2=".6" y2="1">
        <stop offset="0" stop-color="#b06f14"/><stop offset="1" stop-color="#5e3005"/>
      </linearGradient>
      <radialGradient id="a4-${id}" cx=".5" cy=".55" r=".6">
        <stop offset="0" stop-color="#ffcf6e" stop-opacity=".9"/><stop offset="1" stop-color="#ffcf6e" stop-opacity="0"/>
      </radialGradient>`,
    body: `
      <ellipse cx="222" cy="272" rx="70" ry="62" fill="url(#a4-${id})" filter="url(#fx-suave-${id})"/>
      <path d="M148 292 L182 202 L252 178 L302 236 L286 310 L206 336 Z" fill="url(#a2-${id})" filter="url(#fx-aspero-${id})"/>
      <path d="M148 292 L182 202 L252 178 L228 262 Z" fill="url(#a1-${id})" filter="url(#fx-aspero-${id})"/>
      <path d="M252 178 L302 236 L286 310 L228 262 Z" fill="url(#a3-${id})" filter="url(#fx-aspero-${id})"/>
      <path d="M206 336 L148 292 L228 262 Z" fill="#7a4206" filter="url(#fx-aspero-${id})"/>
      <path d="M184 214 L226 198 L212 246 Z" fill="#ffd583" opacity=".55"/>
      <path d="M248 192 L288 234 L252 254 Z" fill="#f6b94e" opacity=".4"/>
      <path d="M170 268 L208 288 L192 318 Z" fill="#fff" opacity=".12"/>
      <path d="M182 202 L252 178" stroke="#ffe7ae" stroke-width="3" opacity=".65"/>
      <path d="M148 292 L182 202" stroke="#ffdd96" stroke-width="2.2" opacity=".45"/>
      <ellipse cx="196" cy="224" rx="11" ry="6" transform="rotate(-32 196 224)" fill="#fff" opacity=".5" filter="url(#fx-micro-${id})"/>` }
]),

menta: id => {
  const hojas = [
    { x:212, y:196, rot:-4,  esc:.82 }, { x:158, y:238, rot:-38, esc:.9 },
    { x:266, y:236, rot:36,  esc:.9 },  { x:150, y:296, rot:-24, esc:.86 },
    { x:274, y:294, rot:26,  esc:.86 }, { x:186, y:336, rot:-13, esc:.74 },
    { x:242, y:336, rot:14,  esc:.74 }
  ].map((o, i) => hoja(id, 'mh' + i, {
    ...o, claro:'#a8d878', base:'#4e8f42', oscuro:'#22461f', largo:56, ancho:32
  }));
  return armar([
    { defs:'', body: sombraDe(id, 224, 348, 96, 16) },
    { defs:'', body: `<path d="M214 348 C212 300 212 250 214 196" stroke="#4a7a3c" stroke-width="6" fill="none"
        stroke-linecap="round" filter="url(#fx-fibra-${id})"/>` },
    ...hojas
  ]);
},

cuero: id => armar([
  { defs:'', body: sombraDe(id, 220, 344, 128, 18, .4) },
  { defs: `
      <linearGradient id="cu1-${id}" x1=".1" y1="0" x2=".9" y2="1">
        <stop offset="0" stop-color="#8a583a"/><stop offset=".45" stop-color="#553a26"/><stop offset="1" stop-color="#2a1a11"/>
      </linearGradient>
      <linearGradient id="cu2-${id}" x1=".1" y1="0" x2=".9" y2="1">
        <stop offset="0" stop-color="#75492e"/><stop offset=".5" stop-color="#452b1b"/><stop offset="1" stop-color="#1f130c"/>
      </linearGradient>
      <linearGradient id="cu3-${id}" x1=".1" y1="0" x2=".9" y2="1">
        <stop offset="0" stop-color="#9a6440"/><stop offset=".5" stop-color="#5d3a24"/><stop offset="1" stop-color="#2c1b11"/>
      </linearGradient>`,
    body: `
      <path d="M96 196 C158 162 286 162 348 196 L348 266 C286 232 158 232 96 266 Z" fill="url(#cu2-${id})" filter="url(#fx-aspero-${id})"/>
      <path d="M96 252 C158 218 286 218 348 252 L348 316 C286 282 158 282 96 316 Z" fill="url(#cu1-${id})" filter="url(#fx-aspero-${id})"/>
      <path d="M96 302 C158 268 286 268 348 302 L348 356 C286 322 158 322 96 356 Z" fill="url(#cu3-${id})" filter="url(#fx-aspero-${id})"/>
      <path d="M110 194 C166 166 278 166 334 194" stroke="#b98459" stroke-width="3.4" fill="none" opacity=".45" filter="url(#fx-hilo-${id})"/>
      <path d="M110 300 C166 272 278 272 334 300" stroke="#c08d61" stroke-width="3" fill="none" opacity=".4" filter="url(#fx-hilo-${id})"/>
      <path d="M96 266 C158 232 286 232 348 266" stroke="#150d08" stroke-width="4" fill="none" opacity=".5"/>
      <path d="M96 316 C158 282 286 282 348 316" stroke="#150d08" stroke-width="4" fill="none" opacity=".45"/>
      <ellipse cx="176" cy="216" rx="52" ry="14" transform="rotate(-10 176 216)" fill="#fff" opacity=".1" filter="url(#fx-suave-${id})"/>` }
]),

sandalo: id => armar([
  { defs:'', body: sombraDe(id, 232, 344, 122, 18) },
  tabla(id, 's1', { x:198, y:256, rot:-14, w:186, h:56, claro:'#e6c298', base:'#c39468', oscuro:'#8a5f38', canto:'#6e4a2a' }),
  tabla(id, 's2', { x:238, y:308, rot:7,   w:170, h:48, claro:'#d5ae83', base:'#b08252', oscuro:'#7a5028', canto:'#5f3f22' }),
  { defs: `<radialGradient id="sr-${id}" cx=".4" cy=".4" r=".7">
      <stop offset="0" stop-color="#e8c9a2"/><stop offset="1" stop-color="#9a6f45"/></radialGradient>`,
    body: `<g transform="translate(288,238) rotate(-14)">
      <ellipse rx="12" ry="28" fill="url(#sr-${id})" filter="url(#fx-mate-${id})"/>
      <ellipse rx="8" ry="19" fill="none" stroke="#8a6440" stroke-width="1.4" opacity=".6"/>
      <ellipse rx="4" ry="10" fill="none" stroke="#8a6440" stroke-width="1.2" opacity=".5"/>
    </g>` }
]),

cedro: id => armar([
  { defs:'', body: sombraDe(id, 232, 344, 124, 18) },
  tabla(id, 'c1', { x:206, y:250, rot:-8, w:196, h:44, claro:'#c79a68', base:'#8f6339', oscuro:'#5b3d1f', canto:'#452d16' }),
  tabla(id, 'c2', { x:242, y:296, rot:5,  w:184, h:40, claro:'#b98c5c', base:'#815733', oscuro:'#4e341b', canto:'#3c2713' }),
  tabla(id, 'c3', { x:214, y:336, rot:-3, w:150, h:34, claro:'#a87e50', base:'#714b2b', oscuro:'#432c16', canto:'#33200f' })
]),

pimienta: id => {
  const granos = Array.from({ length: 30 }, (_, k) => {
    const a = k * 137.508 * Math.PI / 180;
    const rr = Math.sqrt(k / 30) * 118;
    const x = 216 + Math.cos(a) * rr;
    const y = 296 + Math.sin(a) * rr * .42;
    const s = 8.5 + (k * 7) % 5;
    const oscuro = k % 3 ? '#241a12' : '#33251a';
    return `<g transform="translate(${x.toFixed(1)},${y.toFixed(1)})">
      <ellipse cx="1.5" cy="${(s*.7).toFixed(1)}" rx="${s}" ry="${(s*.34).toFixed(1)}" fill="#2a1e14" opacity=".4" filter="url(#fx-micro-${id})"/>
      <circle r="${s}" fill="url(#pg-${id})" filter="url(#fx-aspero-${id})"/>
      <circle r="${s}" fill="${oscuro}" opacity=".28"/>
      <ellipse cx="${(-s*.32).toFixed(1)}" cy="${(-s*.36).toFixed(1)}" rx="${(s*.3).toFixed(1)}" ry="${(s*.2).toFixed(1)}"
               transform="rotate(-30)" fill="#a08a72" opacity=".5"/>
      <circle cx="${(-s*.22).toFixed(1)}" cy="${(-s*.44).toFixed(1)}" r="${(s*.1).toFixed(1)}" fill="#e0d2c0" opacity=".55"/>
    </g>`;
  }).join('');
  return {
    defs: `<radialGradient id="pg-${id}" cx=".33" cy=".28" r=".85">
      <stop offset="0" stop-color="#6e5744"/><stop offset=".5" stop-color="#3a2a1d"/><stop offset="1" stop-color="#150e09"/>
    </radialGradient>`,
    body: sombraDe(id, 220, 320, 132, 22, .3) + granos
  };
},

bergamota: id => armar([
  { defs:'', body: sombraDe(id, 214, 332, 116, 19) },
  esfera(id, 'be', { cx:168, cy:266, r:64, claro:'#e3ef9e', base:'#9bbe46', oscuro:'#4a661c', rebote:'#cfe084', brillo:.42 }),
  { defs: `<linearGradient id="bh-${id}" x1=".1" y1="0" x2=".9" y2="1">
      <stop offset="0" stop-color="#7c9a4a"/><stop offset=".5" stop-color="#4c672a"/><stop offset="1" stop-color="#2a3b16"/>
    </linearGradient>`,
    body: `<path d="M170 202 C186 176 222 168 246 180 C230 202 200 210 170 202 Z" fill="url(#bh-${id})" filter="url(#fx-mate-${id})"/>
           <path d="M172 201 C192 186 218 180 242 182" stroke="#a5c072" stroke-width="2.4" fill="none" opacity=".55"/>` },
  corte(id, 'bc', { cx:284, cy:284, r:52, gajos:8, piel:'#e6f0b6', pielOsc:'#9db857',
                    albedo:'#f6f9e6', jugo:'#fcfdee', pulpa:'#e6f2b8', pulpaOsc:'#bcd47c' })
]),

almizcle: id => {
  const piedras = [[164,272,40],[214,236,46],[262,272,42],[228,314,36],[178,326,30],[292,232,28],[302,312,24]];
  return {
    defs: `
      <radialGradient id="al-${id}" cx=".32" cy=".26" r=".85">
        <stop offset="0" stop-color="#ffffff"/><stop offset=".5" stop-color="#efe9dd"/><stop offset="1" stop-color="#b9b0a0"/>
      </radialGradient>
      <radialGradient id="alg-${id}" cx=".5" cy=".5" r=".5">
        <stop offset="0" stop-color="#fff8ea" stop-opacity=".7"/><stop offset="1" stop-color="#fff8ea" stop-opacity="0"/>
      </radialGradient>`,
    body: sombraDe(id, 224, 344, 116, 18, .3)
      + `<ellipse cx="224" cy="282" rx="110" ry="90" fill="url(#alg-${id})" filter="url(#fx-suave-${id})"/>`
      + piedras.map(([x, y, r]) => `<g transform="translate(${x},${y})">
          <ellipse cx="2" cy="${(r*.82).toFixed(0)}" rx="${(r*.86).toFixed(0)}" ry="${(r*.24).toFixed(0)}" fill="#7d7466" opacity=".34" filter="url(#fx-micro-${id})"/>
          <circle r="${r}" fill="url(#al-${id})" filter="url(#fx-mate-${id})"/>
          <path d="M${-r*.72} ${r*.3} A${r} ${r} 0 0 0 ${r*.6} ${r*.66}" stroke="#fffdf6" stroke-width="${(r*.14).toFixed(1)}" fill="none" opacity=".55" filter="url(#fx-micro-${id})"/>
          <ellipse cx="${(-r*.3).toFixed(0)}" cy="${(-r*.4).toFixed(0)}" rx="${(r*.3).toFixed(0)}" ry="${(r*.2).toFixed(0)}" transform="rotate(-30)" fill="#fff" opacity=".85" filter="url(#fx-micro-${id})"/>
          <circle cx="${(-r*.2).toFixed(0)}" cy="${(-r*.52).toFixed(0)}" r="${(r*.1).toFixed(0)}" fill="#fff"/>
        </g>`).join('')
  };
},

jengibre: id => armar([
  { defs:'', body: sombraDe(id, 222, 338, 118, 18) },
  { defs: `<linearGradient id="jr-${id}" x1=".15" y1="0" x2=".85" y2="1">
      <stop offset="0" stop-color="#f0d5a0"/><stop offset=".4" stop-color="#d2a765"/><stop offset="1" stop-color="#8d6631"/>
    </linearGradient>`,
    body: `
      <path d="M124 288 C124 244 162 224 202 232 C224 206 268 208 282 238 C324 234 348 268 334 302
               C318 340 266 350 226 334 C180 348 128 328 124 288 Z"
            fill="url(#jr-${id})" filter="url(#fx-fibra-${id})"/>
      <path d="M162 232 C174 262 172 294 158 322" stroke="#a17b41" stroke-width="3.6" fill="none" opacity=".55"/>
      <path d="M246 214 C236 250 240 292 258 328" stroke="#a17b41" stroke-width="3.2" fill="none" opacity=".5"/>
      <path d="M130 278 C168 264 216 262 262 272" stroke="#b98f52" stroke-width="2.4" fill="none" opacity=".5"/>
      <path d="M300 244 C310 268 310 292 300 314" stroke="#a17b41" stroke-width="2.6" fill="none" opacity=".45"/>
      <path d="M150 250 C176 236 210 232 240 240" stroke="#fff" stroke-width="7" fill="none" opacity=".22" filter="url(#fx-micro-${id})" stroke-linecap="round"/>` },
  { defs: `<radialGradient id="js-${id}" cx=".38" cy=".32" r=".8">
      <stop offset="0" stop-color="#fdf3dc"/><stop offset=".6" stop-color="#f0dfb6"/><stop offset="1" stop-color="#cfb887"/>
    </radialGradient>`,
    body: `<g transform="translate(292,332) rotate(-6)">
      <ellipse cy="9" rx="44" ry="12" fill="#6d5836" opacity=".3" filter="url(#fx-micro-${id})"/>
      <ellipse rx="44" ry="15" fill="#d8b57c" filter="url(#fx-mate-${id})"/>
      <ellipse rx="37" ry="11.5" fill="url(#js-${id})" filter="url(#fx-mate-${id})"/>
      <ellipse rx="37" ry="11.5" fill="none" stroke="#e0c491" stroke-width="1.8"/>
      <ellipse rx="22" ry="6.5" fill="none" stroke="#dcbe89" stroke-width="1.4" opacity=".7"/>
      <ellipse cx="-12" cy="-4" rx="8" ry="3" fill="#fff" opacity=".5"/>
    </g>` }
]),

marinas: id => ({
  defs: `
    <linearGradient id="w1-${id}" x1=".2" y1="0" x2=".8" y2="1">
      <stop offset="0" stop-color="#7fb4c4"/><stop offset=".5" stop-color="#3d7188"/><stop offset="1" stop-color="#1c3e51"/>
    </linearGradient>
    <linearGradient id="w2-${id}" x1=".2" y1="0" x2=".8" y2="1">
      <stop offset="0" stop-color="#5d95a8"/><stop offset=".6" stop-color="#2b5568"/><stop offset="1" stop-color="#122c3c"/>
    </linearGradient>
    <linearGradient id="w3-${id}" x1=".3" y1="0" x2=".7" y2="1">
      <stop offset="0" stop-color="#ffffff"/><stop offset=".55" stop-color="#e6f1f2"/><stop offset="1" stop-color="#b6ccd2"/>
    </linearGradient>
    <radialGradient id="wg-${id}" cx=".4" cy=".3" r=".7">
      <stop offset="0" stop-color="#cfe8ec" stop-opacity=".55"/><stop offset="1" stop-color="#cfe8ec" stop-opacity="0"/>
    </radialGradient>`,
  body: `
    <path d="M40 352 C110 314 168 348 232 316 C296 284 340 226 400 208 L400 400 L40 400 Z"
          fill="url(#w2-${id})" filter="url(#fx-mate-${id})"/>
    <path d="M40 372 C116 336 174 366 240 334 C306 302 348 250 400 234 L400 400 L40 400 Z"
          fill="url(#w1-${id})" filter="url(#fx-mate-${id})"/>
    <path d="M172 328 C216 296 258 244 322 224 C362 212 386 232 378 258 C344 236 302 258 258 296 C230 320 196 340 172 328 Z"
          fill="url(#w3-${id})" filter="url(#fx-aspero-${id})"/>
    <ellipse cx="290" cy="250" rx="80" ry="34" transform="rotate(-22 290 250)" fill="url(#wg-${id})" filter="url(#fx-suave-${id})"/>
    <path d="M84 350 C132 334 172 346 214 330" stroke="#e8f3f4" stroke-width="8" fill="none" stroke-linecap="round" opacity=".65" filter="url(#fx-micro-${id})"/>
    <path d="M56 372 C104 358 138 368 178 356" stroke="#cfe2e6" stroke-width="6" fill="none" stroke-linecap="round" opacity=".45" filter="url(#fx-micro-${id})"/>
    ${[[300,206,4.5],[330,220,3.4],[268,214,3],[348,196,2.6],[286,190,2.2],[318,242,2.8]]
      .map(([x,y,r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" opacity=".75"/>`).join('')}`
}),

salvia: id => {
  const hojas = [
    { x:150, y:262, rot:-32, esc:1 }, { x:216, y:236, rot:-5, esc:1.08 },
    { x:284, y:266, rot:29,  esc:1 }, { x:180, y:330, rot:-17, esc:.92 },
    { x:258, y:332, rot:16,  esc:.92 }
  ].map((o, i) => hoja(id, 'sv' + i, {
    ...o, claro:'#c3ccae', base:'#8b9a76', oscuro:'#4e5a3c', largo:66, ancho:34, tex:'mate'
  }));
  return armar([{ defs:'', body: sombraDe(id, 224, 356, 106, 16) }, ...hojas]);
},

rosa: id => {
  const anillo = (n, rad, rx, ry, c1, c2, off) => Array.from({ length: n }, (_, k) => {
    const a = (k * 360 / n + off);
    const x = 216 + Math.cos(a * Math.PI / 180) * rad;
    const y = 268 + Math.sin(a * Math.PI / 180) * rad;
    return `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${rx}" ry="${ry}"
      transform="rotate(${(a + 90).toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)})"
      fill="url(#${c1}-${id})" filter="url(#fx-mate-${id})"/>
      <path d="M${(x - rx * .5).toFixed(1)} ${(y - ry * .3).toFixed(1)} Q${x.toFixed(1)} ${(y - ry).toFixed(1)} ${(x + rx * .5).toFixed(1)} ${(y - ry * .3).toFixed(1)}"
      stroke="${c2}" stroke-width="1.6" fill="none" opacity=".4"/>`;
  }).join('');

  return {
    defs: `
      <radialGradient id="rp1-${id}" cx=".4" cy=".28" r=".85">
        <stop offset="0" stop-color="#f4c3ce"/><stop offset=".55" stop-color="#d4859c"/><stop offset="1" stop-color="#9c4f66"/>
      </radialGradient>
      <radialGradient id="rp2-${id}" cx=".4" cy=".3" r=".85">
        <stop offset="0" stop-color="#f8d2da"/><stop offset=".55" stop-color="#dd94a9"/><stop offset="1" stop-color="#a85a72"/>
      </radialGradient>
      <radialGradient id="rp3-${id}" cx=".42" cy=".32" r=".85">
        <stop offset="0" stop-color="#fbdde3"/><stop offset=".55" stop-color="#e6a2b5"/><stop offset="1" stop-color="#b3657c"/>
      </radialGradient>
      <radialGradient id="rc-${id}" cx=".4" cy=".35" r=".7">
        <stop offset="0" stop-color="#c9738d"/><stop offset=".6" stop-color="#a24f6a"/><stop offset="1" stop-color="#6e3145"/>
      </radialGradient>
      <linearGradient id="rh-${id}" x1=".1" y1="0" x2=".9" y2="1">
        <stop offset="0" stop-color="#6f8a4c"/><stop offset="1" stop-color="#33452a"/>
      </linearGradient>`,
    body: `
      ${sombraDe(id, 222, 350, 104, 18)}
      <path d="M120 330 C150 302 190 310 210 334 C180 356 140 352 120 330 Z" fill="url(#rh-${id})" filter="url(#fx-mate-${id})"/>
      <path d="M316 338 C286 310 246 318 228 342 C258 364 298 360 316 338 Z" fill="url(#rh-${id})" filter="url(#fx-mate-${id})"/>
      <circle cx="216" cy="268" r="94" fill="url(#rp1-${id})" filter="url(#fx-mate-${id})"/>
      ${anillo(7, 60, 46, 38, 'rp1', '#b46a83', 0)}
      ${anillo(6, 40, 36, 30, 'rp2', '#c07a92', 26)}
      ${anillo(5, 22, 26, 22, 'rp3', '#cc8ba1', 52)}
      <circle cx="216" cy="268" r="20" fill="url(#rc-${id})" filter="url(#fx-mate-${id})"/>
      <path d="M204 262 C210 252 224 251 230 262 C224 274 208 275 204 262 Z" fill="#8b3f57"/>
      <ellipse cx="180" cy="222" rx="34" ry="18" transform="rotate(-32 180 222)" fill="#fff" opacity=".2" filter="url(#fx-suave-${id})"/>`
  };
},

manzana: id => armar([
  { defs:'', body: sombraDe(id, 220, 344, 100, 17) },
  { defs: `<radialGradient id="mz-${id}" cx=".34" cy=".26" r=".86">
      <stop offset="0" stop-color="#e3f0a2"/><stop offset=".42" stop-color="#95bd3f"/><stop offset=".82" stop-color="#4c711a"/>
      <stop offset="1" stop-color="#3a5a12"/>
    </radialGradient>`,
    body: `
      <path d="M216 214 C186 186 128 204 128 258 C128 312 170 356 216 356 C262 356 304 312 304 258 C304 204 246 186 216 214 Z"
            fill="url(#mz-${id})" filter="url(#fx-poro-${id})"/>
      ${Array.from({length:26},(_,k)=>{const a=k*137.5*Math.PI/180,rr=Math.sqrt(k/26)*74;
        return `<circle cx="${(216+Math.cos(a)*rr).toFixed(1)}" cy="${(272+Math.sin(a)*rr*.92).toFixed(1)}" r="1.6" fill="#e8f4b4" opacity=".38"/>`;}).join('')}
      <path d="M150 316 A88 88 0 0 0 268 340" stroke="#c6dd7c" stroke-width="11" fill="none" opacity=".3" filter="url(#fx-micro-${id})"/>
      <path d="M216 212 C218 192 214 178 210 168" stroke="#5a4227" stroke-width="8" fill="none" stroke-linecap="round" filter="url(#fx-fibra-${id})"/>
      <path d="M218 190 C240 170 274 176 282 194 C262 210 232 206 218 190 Z" fill="#5d7c36" filter="url(#fx-mate-${id})"/>
      <path d="M220 190 C240 178 264 180 278 192" stroke="#8aa858" stroke-width="2.2" fill="none" opacity=".6"/>
      <ellipse cx="176" cy="236" rx="26" ry="15" transform="rotate(-34 176 236)" fill="#fff" opacity=".42" filter="url(#fx-micro-${id})"/>
      <ellipse cx="186" cy="222" rx="7" ry="4" transform="rotate(-34 186 222)" fill="#fff" opacity=".75"/>` }
]),

pachuli: id => {
  const hojas = [
    { x:152, y:254, rot:-30, esc:1 }, { x:222, y:228, rot:2, esc:1.1 },
    { x:292, y:258, rot:28,  esc:1 }, { x:184, y:326, rot:-15, esc:.94 },
    { x:262, y:330, rot:18,  esc:.94 }
  ].map((o, i) => hoja(id, 'pc' + i, {
    ...o, claro:'#8b9a5e', base:'#54613a', oscuro:'#242c17', largo:62, ancho:38, tex:'mate'
  }));
  return armar([{ defs:'', body: sombraDe(id, 224, 352, 108, 16) }, ...hojas]);
}
};

/* ── la placa: yeso, luz dura y profundidad de campo ─────────── */
function plate(id, tono, art){
  const a = typeof art === 'function' ? art(id) : { defs:'', body:art };
  return `<svg viewBox="0 0 400 460" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
  <defs>
    <linearGradient id="bg-${id}" x1="0" y1="0" x2=".78" y2="1">
      <stop offset="0"   stop-color="${tono[0]}"/>
      <stop offset=".5"  stop-color="${tono[1]}"/>
      <stop offset="1"   stop-color="${tono[2]}"/>
    </linearGradient>
    <linearGradient id="sh-${id}" x1="0" y1="0" x2=".8" y2="1">
      <stop offset="0" stop-color="#1c1209" stop-opacity=".46"/>
      <stop offset="1" stop-color="#1c1209" stop-opacity=".08"/>
    </linearGradient>
    <linearGradient id="piso-${id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#000" stop-opacity="0"/>
      <stop offset="1" stop-color="#000" stop-opacity=".3"/>
    </linearGradient>
    <radialGradient id="gl-${id}" cx=".3" cy=".22" r=".72">
      <stop offset="0" stop-color="#fff4e0" stop-opacity=".4"/>
      <stop offset="1" stop-color="#fff4e0" stop-opacity="0"/>
    </radialGradient>
    <filter id="fondo-${id}" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency=".55" numOctaves="4" seed="41" result="n"/>
      <feDiffuseLighting in="n" surfaceScale="1.1" diffuseConstant="1" lighting-color="#fff" result="l">
        <feDistantLight azimuth="135" elevation="60"/>
      </feDiffuseLighting>
      <feComposite in="l" in2="SourceAlpha" operator="in" result="lr"/>
      <feBlend in="SourceGraphic" in2="lr" mode="multiply"/>
    </filter>
    <filter id="dof-${id}" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="3.4"/></filter>
    ${filtros(id)}
    ${a.defs}
  </defs>

  <g filter="url(#dof-${id})">
    <rect width="400" height="460" fill="url(#bg-${id})" filter="url(#fondo-${id})"/>
    <path d="M400 -40 L400 460 L96 460 Z" fill="url(#sh-${id})"/>
    <rect y="300" width="400" height="160" fill="url(#piso-${id})"/>
  </g>
  <rect width="400" height="460" fill="url(#gl-${id})"/>

  <g transform="translate(200,244) scale(1.42) translate(-200,-268)">${a.body}</g>
</svg>`;
}

/* paletas de fondo por familia */
const TONO = {
  calido:  ['#cdb897','#a38869','#614c37'],
  fresco:  ['#cec1a4','#a4967a','#5b5240'],
  verde:   ['#c5c0a2','#96967a','#525541'],
  madera:  ['#c1ab8b','#927357','#513e2d'],
  oscuro:  ['#937e64','#5b4938','#2d221a'],
  marino:  ['#adb9ba','#788d93','#3b4b53'],
  rosa:    ['#cfb4a7','#a6867c','#5f4640']
};

/* ── inventario ─────────────────────────────────────────────── */
const INGREDIENTES = [
  { id:'vainilla',  nombre:'Vainilla',      sub:'Dulce · Cálida',            fam:'dulce',    capa:'fondo',   color:'#e0bd82', tono:TONO.calido, art:ART.vainilla,
    nota:'Vainilla bourbon en absoluto: cremosa, resinosa, apenas licorosa.', para:['hombre','mujer'] },
  { id:'lavanda',   nombre:'Lavanda',       sub:'Aromática · Relajante',     fam:'floral',   capa:'corazon', color:'#9a8fd0', tono:TONO.verde,  art:ART.lavanda,
    nota:'Lavanda de altura, herbácea y fría, casi meditativa.', para:['hombre','mujer'] },
  { id:'limon',     nombre:'Limón',         sub:'Cítrica · Fresca',          fam:'citrico',  capa:'salida',  color:'#d9d94f', tono:TONO.fresco, art:ART.limon,
    nota:'Ralladura de limón recién abierta: un destello de luz fría.', para:['hombre','mujer'] },
  { id:'canela',    nombre:'Canela',        sub:'Especiada · Cálida',        fam:'especia',  capa:'corazon', color:'#b85c2e', tono:TONO.madera, art:ART.canela,
    nota:'Corteza de Ceilán: un calor dulce que avanza despacio sobre la piel.', para:['hombre','mujer'] },
  { id:'toronja',   nombre:'Toronja',       sub:'Cítrica · Vibrante',        fam:'citrico',  capa:'salida',  color:'#e5836b', tono:TONO.rosa,   art:ART.toronja,
    nota:'Toronja rosada, entre la cáscara amarga y la pulpa efervescente.', para:['hombre','mujer'] },
  { id:'mandarina', nombre:'Mandarina',     sub:'Cítrica · Jugosa',          fam:'citrico',  capa:'salida',  color:'#ec9a3c', tono:TONO.calido, art:ART.mandarina,
    nota:'Cáscara de mandarina: más redonda y golosa que el limón.', para:['hombre','mujer'] },
  { id:'ambar',     nombre:'Ámbar',         sub:'Cálida · Envolvente',       fam:'dulce',    capa:'fondo',   color:'#c8862f', tono:TONO.calido, art:ART.ambar,
    nota:'Acorde dorado de ládano y benjuí que se enciende con el calor.', para:['hombre','mujer'] },
  { id:'menta',     nombre:'Menta',         sub:'Fresca · Revitalizante',    fam:'fresco',   capa:'salida',  color:'#6fc79c', tono:TONO.verde,  art:ART.menta,
    nota:'Menta de huerto recién estrujada: glacial, verde, algo picante.', para:['hombre','mujer'] },
  { id:'cuero',     nombre:'Cuero',         sub:'Intensa · Sofisticada',     fam:'elegante', capa:'fondo',   color:'#7a4a2e', tono:TONO.oscuro, art:ART.cuero,
    nota:'Ante y abedul: un guante olvidado sobre una silla de terciopelo.', para:['hombre','mujer'] },
  { id:'sandalo',   nombre:'Sándalo',       sub:'Amaderada · Cremosa',       fam:'madera',   capa:'fondo',   color:'#c79a6a', tono:TONO.madera, art:ART.sandalo,
    nota:'Sándalo lácteo y redondo, la madera más serena que existe.', para:['hombre','mujer'] },
  { id:'cedro',     nombre:'Cedro',         sub:'Amaderada · Elegante',      fam:'madera',   capa:'fondo',   color:'#8a6a45', tono:TONO.madera, art:ART.cedro,
    nota:'Cedro seco y vertical, como un bosque frío al mediodía.', para:['hombre','mujer'] },
  { id:'pimienta',  nombre:'Pimienta',      sub:'Especiada · Intensa',       fam:'especia',  capa:'corazon', color:'#8a6a5a', tono:TONO.oscuro, art:ART.pimienta,
    nota:'Pimienta negra y rosa recién quebrada: seca, eléctrica.', para:['hombre','mujer'] },
  { id:'bergamota', nombre:'Bergamota',     sub:'Cítrica · Refinada',        fam:'citrico',  capa:'salida',  color:'#bcd25f', tono:TONO.fresco, art:ART.bergamota,
    nota:'Bergamota de Calabria: cítrico con una elegancia amarga, casi de té.', para:['hombre','mujer'] },
  { id:'almizcle',  nombre:'Almizcle',      sub:'Limpia · Sensual',          fam:'elegante', capa:'fondo',   color:'#d8c6b4', tono:TONO.fresco, art:ART.almizcle,
    nota:'Almizcles blancos: el olor de la piel tibia y la ropa limpia.', para:['hombre','mujer'] },
  { id:'jengibre',  nombre:'Jengibre',      sub:'Especiada · Energizante',   fam:'especia',  capa:'corazon', color:'#dda24a', tono:TONO.calido, art:ART.jengibre,
    nota:'Raíz fresca: fuego cítrico con un fondo de tierra.', para:['hombre','mujer'] },
  { id:'marinas',   nombre:'Notas marinas', sub:'Acuática · Refrescante',    fam:'fresco',   capa:'corazon', color:'#6fb6d8', tono:TONO.marino, art:ART.marinas,
    nota:'Salitre, piedra mojada y aire abierto: el olor de la distancia.', para:['hombre','mujer'] },
  { id:'salvia',    nombre:'Salvia',        sub:'Aromática · Herbal',        fam:'fresco',   capa:'corazon', color:'#a9be96', tono:TONO.verde,  art:ART.salvia,
    nota:'Salvia esclarea: aromática, plateada, ligeramente medicinal.', para:['hombre','mujer'] },
  { id:'rosa',      nombre:'Rosa',          sub:'Floral · Atemporal',        fam:'floral',   capa:'corazon', color:'#d97a96', tono:TONO.rosa,   art:ART.rosa,
    nota:'Rosa de mayo al amanecer: pétalo de terciopelo, tallo verde, una gota de miel.', para:['hombre','mujer'] },

  /* extras — sólo aparecen en el paso 2 */
  { id:'manzana',   nombre:'Manzana',       sub:'Dulce · Crujiente',         fam:'dulce',    capa:'salida',  color:'#b7d46a', tono:TONO.verde,  art:ART.manzana, extra:true,
    nota:'Manzana verde recién partida: jugosa, ácida, viva.', para:['hombre','mujer'] },
  { id:'pachuli',   nombre:'Pachulí',       sub:'Terrosa · Magnética',       fam:'madera',   capa:'fondo',   color:'#6e6a4a', tono:TONO.verde,  art:ART.pachuli, extra:true,
    nota:'Terroso, húmedo, con un fondo achocolatado: el verde más oscuro.', para:['hombre','mujer'] }
];

/* ── afinidades: qué acompaña bien a qué familia ──────────────── */
const AFINIDAD = {
  dulce:    ['madera','especia','elegante'],
  floral:   ['elegante','citrico','dulce'],
  citrico:  ['fresco','madera','especia'],
  especia:  ['madera','dulce','elegante'],
  madera:   ['elegante','citrico','dulce'],
  fresco:   ['citrico','madera','elegante'],
  elegante: ['madera','dulce','floral']
};

/* ── carácter por familia ─────────────────────────────────────── */
const CARACTER = {
  dulce:    ['Dulce','Envolvente','Golosa'],
  floral:   ['Floral','Romántica','Luminosa'],
  citrico:  ['Cítrica','Chispeante','Fresca'],
  especia:  ['Especiada','Intensa','Magnética'],
  madera:   ['Amaderada','Serena','Elegante'],
  fresco:   ['Fresca','Limpia','Aireada'],
  elegante: ['Sensual','Íntima','Sofisticada']
};

const FRASE = {
  dulce:    'se abre como miel tibia sobre la piel',
  floral:   'florece entre dos estaciones',
  citrico:  'entra como aire frío por una ventana abierta',
  especia:  'guarda un calor lento y deliberado',
  madera:   'se asienta en algo quieto y arquitectónico',
  fresco:   'respira limpio, sin pedir permiso',
  elegante: 'se queda cerca de la piel, casi en secreto'
};

const CAPA_LABEL = { salida:'Salida', corazon:'Corazón', fondo:'Fondo' };
