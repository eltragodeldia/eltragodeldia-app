// "¿Qué me tomo hoy?": a partir del sabor y el destilado que se le antojan a la persona,
// elige 3 recetas de la biblioteca. No inventa nada: solo ordena lo que ya existe.
// Copiada del sitio (src/lib/antojo.ts); si cambia allá, se copia igual aquí.

export interface Candidata {
  slug: string;
  destilado: string;
  sabores: string[];
}

/** Número pseudoaleatorio estable para una semilla y un texto (así "Otras 3" no repite y el resultado no salta al volver). */
function azar(semilla: number, texto: string): number {
  let h = 2166136261 ^ semilla;
  for (let i = 0; i < texto.length; i++) h = Math.imul(h ^ texto.charCodeAt(i), 16777619);
  return ((h >>> 0) % 100000) / 100000;
}

/**
 * Elige hasta `cuantas` recetas. Sabor y destilado vacíos significan "Sorpréndeme".
 * Primero las que cumplen todo; si no alcanzan, completa con las del mismo sabor o el mismo destilado,
 * para que nunca quede vacío. `ronda` cambia el grupo (botón "Otras 3") sin repetir las anteriores.
 */
export function elegirAntojo<T extends Candidata>(lista: T[], sabor: string | null, destilado: string | null, ronda = 0, cuantas = 3, semilla = 7): T[] {
  const puntaje = (r: T) => (sabor && r.sabores.includes(sabor) ? 2 : 0) + (destilado && r.destilado === destilado ? 2 : 0);
  const maximo = (sabor ? 2 : 0) + (destilado ? 2 : 0);
  const exactas = lista.filter((r) => puntaje(r) === maximo);
  const parciales = maximo ? lista.filter((r) => puntaje(r) > 0 && puntaje(r) < maximo) : [];
  const mezclar = (xs: T[]) => [...xs].sort((a, b) => azar(semilla, a.slug) - azar(semilla, b.slug));
  // Si no alcanzan las exactas para esta ronda, se completa con las parciales.
  const orden = [...mezclar(exactas), ...mezclar(parciales)];
  if (!orden.length) return [];
  const inicio = (ronda * cuantas) % orden.length;
  const salida: T[] = [];
  for (let i = 0; i < Math.min(cuantas, orden.length); i++) salida.push(orden[(inicio + i) % orden.length]);
  return salida;
}

/** Cuántas recetas cumplen exactamente lo elegido (para decir "Hay 12 que encajan"). */
export function cuantasEncajan(lista: Candidata[], sabor: string | null, destilado: string | null): number {
  return lista.filter((r) => (!sabor || r.sabores.includes(sabor)) && (!destilado || r.destilado === destilado)).length;
}
