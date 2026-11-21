// Copiado de eltragodeldia-web/src/lib/proxima.ts. Mantener igual.
// "Tu próxima botella": con lo que la persona marcó en Mi bar, qué botella sola le abre más recetas.
// Una receta cuenta para una botella solo si esa botella es lo ÚNICO que le falta (ni otra botella
// ni nada de la cocina). Es determinista: los números salen del catálogo y se pueden comprobar a mano.

export interface RecetaMiBar { s: string; b: string[]; i: string[] }
export interface Sugerencia { clave: string; recetas: string[] }

export function proximasBotellas(recetas: RecetaMiBar[], tengo: Set<string>, max = 3): Sugerencia[] {
  const abre = new Map<string, string[]>();
  for (const r of recetas) {
    if (!r.b.length) continue;
    const faltan = [...new Set([...r.b, ...r.i])].filter((k) => !tengo.has(k));
    if (faltan.length !== 1 || !r.b.includes(faltan[0])) continue;
    const k = faltan[0];
    abre.set(k, [...(abre.get(k) ?? []), r.s]);
  }
  return [...abre.entries()]
    .map(([clave, rs]) => ({ clave, recetas: rs }))
    .sort((a, b) => b.recetas.length - a.recetas.length || a.clave.localeCompare(b.clave))
    .slice(0, max);
}
