import { chromium } from '/opt/npm-tools/node_modules/playwright/index.mjs';
import fs from 'fs';
const C = { cassis: '#351E28', crema: '#FDF6EC', beige: '#E8D5C4', wasabi: '#E9F056', azul: '#223C5B', verde: '#2C4E3A' };
const piezas = {
  es: [['r1', 'El trago de cada día', 'Uno distinto cada día y, si quieres, te aviso a las 5 de la tarde.', C.cassis],
       ['r2', 'Más de 180 recetas probadas en casa', 'Porciones, onzas o mililitros y el error más común de cada trago.', C.verde],
       ['r3', 'Prepáralo paso a paso', 'Letra grande, temporizador y la pantalla siempre encendida.', C.azul],
       ['r4', '¿Qué hago con lo que tengo?', 'Marca tus botellas y te digo qué tragos ya puedes hacer.', C.cassis],
       ['r5', 'Colecciones para cada ocasión', 'Del Caribe, tiki, margaritas, sin alcohol y más.', C.verde],
       ['r6', 'Busca por destilado o ingrediente', 'Ron, tequila, mezcal, gin, whisky, vodka y sin alcohol.', C.azul]],
  en: [['e1', 'A new drink every day', 'A different one daily and, if you want, a reminder at 5 p.m.', C.cassis],
       ['e2', '180+ recipes tested at home', 'Servings, ounces or milliliters and the most common mistake.', C.verde],
       ['e3', 'Make it step by step', 'Big text, a timer and the screen stays on.', C.azul],
       ['e4', 'What can I make with what I have?', 'Check your bottles and see what you can make now.', C.cassis],
       ['e5', 'Collections for every occasion', 'Caribbean, tiki, margaritas, zero proof and more.', C.verde],
       ['e6', 'Search by spirit or ingredient', 'Rum, tequila, mezcal, gin, whiskey, vodka and zero proof.', C.azul]],
};
const b64 = (f) => fs.readFileSync(f).toString('base64');
const fuentes = `@font-face{font-family:A;src:url(data:font/ttf;base64,${b64('/tmp/tienda/ArchivoExpandedBlack.ttf')})}@font-face{font-family:N;src:url(data:font/ttf;base64,${b64('/tmp/tienda/Nunito_800ExtraBold.ttf')})}`;
const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome' });
const p = await b.newPage({ viewport: { width: 1320, height: 2868 }, deviceScaleFactor: 1 });
for (const [idioma, lista] of Object.entries(piezas)) {
  for (const [i, [img, titulo, sub, fondo]] of lista.entries()) {
    await p.setContent(`<style>${fuentes}*{margin:0;box-sizing:border-box}body{width:1320px;height:2868px;background:${fondo};overflow:hidden;position:relative;font-family:N}
    h1{font-family:A;color:${C.crema};font-size:96px;line-height:1.02;text-transform:uppercase;padding:170px 96px 0}
    .r{width:150px;height:22px;background:${C.wasabi};border-radius:11px;margin:52px 96px 0}
    p{color:${C.beige};font-size:48px;line-height:1.35;padding:44px 96px 0;max-width:1240px}
    .tel{position:absolute;left:130px;right:130px;top:${0}px;bottom:-80px;border-radius:84px;border:18px solid ${C.crema};overflow:hidden;background:${C.crema};box-shadow:0 30px 80px rgba(0,0,0,.35)}
    .tel img{width:100%;display:block}</style>
    <h1>${titulo}</h1><div class="r"></div><p>${sub}</p>
    <div class="tel" id="t"><img src="data:image/png;base64,${b64('/tmp/cap/' + img + '.png')}"></div>`);
    await p.evaluate(() => { const t = document.getElementById('t'); const pp = document.querySelector('p'); t.style.top = (pp.getBoundingClientRect().bottom + 90) + 'px'; });
    await p.waitForTimeout(200);
    fs.mkdirSync(`/tmp/tienda/${idioma}`, { recursive: true });
    await p.screenshot({ path: `/tmp/tienda/${idioma}/${i + 1}.png` });
  }
}
await b.close();
console.log('ok');
