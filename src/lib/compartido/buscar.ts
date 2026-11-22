// Búsqueda de recetas que perdona: palabras en cualquier orden, sin acentos,
// por el comienzo de cada palabra y con uno o dos errores de tipeo.
// La misma función vive en la app (src/lib/compartido/buscar.ts); si cambia aquí, se copia igual.

/** Texto sin acentos, en minúsculas, con ñ como n y sin signos. */
export function normalizar(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/** Palabras que no ayudan a encontrar nada. */
const VACIAS = new Set(['de', 'del', 'la', 'el', 'los', 'las', 'con', 'y', 'a', 'al', 'en', 'un', 'una', 'the', 'of', 'and', 'with']);

export function palabras(s: string): string[] {
  return normalizar(s).split(' ').filter((p) => p && !VACIAS.has(p));
}

/** Distancia de edición entre dos palabras, cortando cuando ya pasa del tope. */
function distancia(a: string, b: string, tope: number): number {
  if (Math.abs(a.length - b.length) > tope) return tope + 1;
  let previa = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const fila = [i];
    let menor = i;
    for (let j = 1; j <= b.length; j++) {
      const v = Math.min(previa[j] + 1, fila[j - 1] + 1, previa[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      fila.push(v);
      if (v < menor) menor = v;
    }
    if (menor > tope) return tope + 1;
    previa = fila;
  }
  return previa[b.length];
}

/** Cuántos errores se perdonan según el largo de lo que escribió la persona. */
const errores = (n: number) => (n >= 7 ? 2 : n >= 4 ? 1 : 0);

/** Qué tan bien una palabra buscada encaja con una palabra del texto: 3 exacta, 2 empieza igual, 1 con error de tipeo, 0 nada. */
function encaje(buscada: string, palabra: string, conErrores = true): number {
  if (palabra === buscada) return 3;
  if (palabra.startsWith(buscada)) return 2;
  const e = conErrores ? errores(buscada.length) : 0;
  if (!e) return 0;
  // Compara con la palabra completa y con su comienzo del mismo largo (por si aún está escribiendo).
  if (distancia(buscada, palabra, e) <= e) return 1;
  if (palabra.length > buscada.length && distancia(buscada, palabra.slice(0, buscada.length), e) <= e) return 1;
  return 0;
}

export interface Buscable {
  nombre: string;
  /** Destilado, ingredientes y lo demás que también cuenta, pero menos que el nombre. */
  extra: string;
  /** Otros nombres del mismo trago (destornillador, cubata...). Cuentan igual que el nombre. */
  alias?: string | null;
}

/**
 * Palabras que en un país se dicen de una forma y en otro de otra. Lo buscado también encuentra su par.
 * Lima y limón no se tocan: en las recetas son frutas distintas.
 */
const SINONIMOS: Record<string, string[]> = {
  zumo: ['jugo'], jugo: ['zumo', 'juice'],
  jarabe: ['sirope'], almibar: ['sirope'], sirope: ['jarabe', 'syrup'],
  pomelo: ['toronja'], toronja: ['pomelo', 'grapefruit'],
  anana: ['pina'], ananas: ['pina'], pina: ['anana', 'pineapple'],
  frutilla: ['fresa'], frutillas: ['fresa'], fresa: ['frutilla', 'strawberry'],
  parchita: ['maracuya'], chinola: ['maracuya'], maracuya: ['parchita', 'chinola', 'passion'],
  hierbabuena: ['menta'], menta: ['hierbabuena', 'mint'],
  jengibre: ['ginger'], ginger: ['jengibre'],
  rum: ['ron'], ron: ['rum'],
  whiskey: ['whisky'], whisky: ['whiskey'],
  cafe: ['espresso', 'coffee'], espresso: ['cafe'], expreso: ['espresso'],
  coco: ['coconut'], cream: ['crema'], crema: ['cream'],
};

const variantes = (b: string) => [b, ...(SINONIMOS[b] ?? [])];

/**
 * Puntaje de una receta para lo buscado. 0 = no aparece.
 * Cada palabra buscada tiene que encajar en el nombre o en lo demás; el nombre suma más.
 */
export function puntaje(q: string, item: Buscable): number {
  const buscadas = palabras(q);
  if (!buscadas.length) return 1;
  const nombre = palabras(item.nombre);
  const alias = (item.alias ?? '').split(',').map(palabras).filter((a) => a.length);
  const extra = palabras(item.extra);
  // El nombre pegado ayuda con "pinacolada" o "old fashioned" escrito junto.
  const pegados = [nombre.join(''), ...alias.map((a) => a.join(''))];
  const enNombres = [...nombre, ...alias.flat()];
  let total = 0;
  for (const b of buscadas) {
    const vs = variantes(b);
    // Los sinónimos solo cuentan escritos bien: "fresa" con un error ya sería "fresco".
    const enNombre = Math.max(0, ...vs.flatMap((v, i) => enNombres.map((p) => encaje(v, p, i === 0))), pegados.some((x) => x.startsWith(b)) && b.length > 3 ? 2 : 0);
    const enExtra = Math.max(0, ...vs.flatMap((v, i) => extra.map((p) => encaje(v, p, i === 0))));
    if (!enNombre && !enExtra) return 0;
    total += enNombre ? 10 + enNombre * 3 : enExtra;
  }
  // Si todo lo buscado coincide con el comienzo del nombre, va primero.
  const junto = buscadas.join(' ');
  if (normalizar(item.nombre).startsWith(junto) || (item.alias ?? '').split(',').some((a) => palabras(a).join(' ').startsWith(junto))) total += 20;
  return total;
}

/** Filtra y ordena: primero lo que más encaja; a igual puntaje, el nombre más corto (la versión clásica) y después el orden original. */
export function buscar<T>(q: string, lista: T[], comoBuscable: (x: T) => Buscable): T[] {
  if (!palabras(q).length) return lista;
  return lista
    .map((x, i) => { const b = comoBuscable(x); return { x, i, p: puntaje(q, b), n: b.nombre.length }; })
    .filter((r) => r.p > 0)
    .sort((a, b) => b.p - a.p || a.n - b.n || a.i - b.i)
    .map((r) => r.x);
}
