// Búsqueda de recetas que perdona: palabras en cualquier orden, sin acentos,
// por el comienzo de cada palabra y con uno o dos errores de tipeo.
// Copiada del sitio (src/lib/buscar.ts); si cambia allá, se copia igual aquí.

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
function encaje(buscada: string, palabra: string): number {
  if (palabra === buscada) return 3;
  if (palabra.startsWith(buscada)) return 2;
  const e = errores(buscada.length);
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
}

/**
 * Puntaje de una receta para lo buscado. 0 = no aparece.
 * Cada palabra buscada tiene que encajar en el nombre o en lo demás; el nombre suma más.
 */
export function puntaje(q: string, item: Buscable): number {
  const buscadas = palabras(q);
  if (!buscadas.length) return 1;
  const nombre = palabras(item.nombre);
  const extra = palabras(item.extra);
  // El nombre pegado ayuda con "pinacolada" o "old fashioned" escrito junto.
  const pegado = nombre.join('');
  let total = 0;
  for (const b of buscadas) {
    const enNombre = Math.max(0, ...nombre.map((p) => encaje(b, p)), pegado.startsWith(b) && b.length > 3 ? 2 : 0);
    const enExtra = Math.max(0, ...extra.map((p) => encaje(b, p)));
    if (!enNombre && !enExtra) return 0;
    total += enNombre ? 10 + enNombre * 3 : enExtra;
  }
  // Si todo lo buscado coincide con el comienzo del nombre, va primero.
  if (normalizar(item.nombre).startsWith(buscadas.join(' '))) total += 20;
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
