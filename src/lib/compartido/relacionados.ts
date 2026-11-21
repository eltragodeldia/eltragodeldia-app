// Enlaces internos (ETD-003, tabla aprobada por Yunior el 20 nov 2026).
// - Receta → hasta 2 artículos, primero los temas específicos (espresso, mojito, siropes) y después
//   técnica y hielo. Si no encaja en ninguno, "El bar de casa con 10 botellas".
// - Artículo → hasta 6 recetas de su tema.
// - Receta → "Más con este destilado": 4 recetas del mismo destilado que rotan según la receta,
//   para que los enlaces se repartan por todo el catálogo.
// - Lugar → artículos que lo mencionan por nombre.
// Funciona igual en los dos idiomas: las reglas miran nombres en español y en inglés.
import type { Receta } from './tipos';
// En la app el artículo es ArticuloApp (sin contenido en la lista vieja guardada).
type Articulo = { slug: string; titulo: string; resumen: string | null; contenido?: string | null };

type Regla = { slug: string; aplica: (r: Receta, texto: { ing: string; tec: string; pasos: string }) => boolean };

const REGLAS: Regla[] = [
  { slug: 'espuma-espresso-martini-hasta-cuando-batir', aplica: (r) => r.ingredientes.some((i) => /espresso|caf[eé]\b|coffee/i.test(i.ingrediente) && !/licor de caf|coffee liqueur/i.test(i.ingrediente)) },
  { slug: 'buscando-el-mejor-mojito-de-miami-calle-ocho', aplica: (r) => /mojito/.test(r.slug) },
  { slug: 'siropes-caseros-para-cocteles', aplica: (_, t) => /sirope|jarabe|syrup|miel|honey|demerara|granadina|grenadine|orgeat/i.test(t.ing) },
  { slug: 'tecnicas-de-cocteleria-agitar-revolver-construir', aplica: (_, t) => /agit|revuel|constru|batch|shak|stirr|built|build/i.test(t.tec) },
  { slug: 'guia-del-hielo-para-cocteles', aplica: (_, t) => /revuel|stirr/i.test(t.tec) || /cubo grande|hielo grande|bloque|picado|frapp|crushed|large cube|big cube/i.test(t.pasos) },
];
export const RESPALDO = 'el-bar-de-casa-con-10-botellas';

const textos = (r: Receta) => ({
  ing: r.ingredientes.map((i) => i.ingrediente).join(' | '),
  tec: r.tecnica ?? '',
  pasos: (r.pasos ?? []).join(' '),
});

/** Slugs de artículos que corresponden a una receta, en orden de prioridad (sin límite). */
export function temasDeReceta(r: Receta): string[] {
  const t = textos(r);
  return REGLAS.filter((x) => x.aplica(r, t)).map((x) => x.slug);
}

/** Hasta 2 artículos para una receta, entre los que existen en ese idioma. */
export function articulosDeReceta(r: Receta, articulos: Articulo[], max = 2): Articulo[] {
  const porSlug = new Map(articulos.map((a) => [a.slug, a]));
  const elegidos = temasDeReceta(r).map((s) => porSlug.get(s)).filter((a): a is Articulo => !!a).slice(0, max);
  if (!elegidos.length && porSlug.has(RESPALDO)) elegidos.push(porSlug.get(RESPALDO)!);
  return elegidos;
}

/** Hasta 6 recetas para un artículo: las de su tema, primero las más votadas, destacadas y con
 *  video, y variando el destilado (una de cada uno antes de repetir). */
export function recetasDeArticulo(a: Articulo, recetas: Receta[], max = 6): Receta[] {
  const orden = (x: Receta, y: Receta) =>
    (y.deliciosos ?? 0) - (x.deliciosos ?? 0) || Number(y.destacada) - Number(x.destacada) || Number(!!y.video_url) - Number(!!x.video_url) || x.nombre.localeCompare(y.nombre);
  const delTema = (a.slug === RESPALDO ? recetas.filter((r) => temasDeReceta(r).length === 0) : recetas.filter((r) => temasDeReceta(r).includes(a.slug))).sort(orden);
  const elegidas: Receta[] = [];
  const vistos = new Set<string>();
  for (const r of delTema) if (elegidas.length < max && !vistos.has(r.destilado)) { elegidas.push(r); vistos.add(r.destilado); }
  for (const r of delTema) if (elegidas.length < max && !elegidas.includes(r)) elegidas.push(r);
  return elegidas;
}

/** 4 recetas del mismo destilado, las que siguen a esta en el catálogo (vuelta circular). */
export function masConDestilado(r: Receta, recetas: Receta[], max = 4): Receta[] {
  const mismas = recetas.filter((x) => x.destilado === r.destilado).sort((x, y) => x.slug.localeCompare(y.slug));
  const i = mismas.findIndex((x) => x.slug === r.slug);
  const giradas = [...mismas.slice(i + 1), ...mismas.slice(0, Math.max(i, 0))].filter((x) => x.slug !== r.slug);
  const elegidas = giradas.slice(0, max);
  // Si el destilado tiene pocas recetas, se completa con otras.
  if (elegidas.length < max) elegidas.push(...recetas.filter((x) => x.slug !== r.slug && x.destilado !== r.destilado).sort((x, y) => x.slug.localeCompare(y.slug)).slice(0, max - elegidas.length));
  return elegidas;
}

/** Artículos que mencionan un lugar por su nombre (título, resumen o contenido). */
export function articulosDeLugar(nombre: string, articulos: Articulo[]): Articulo[] {
  const n = nombre.trim().toLowerCase();
  if (n.length < 4) return [];
  return articulos.filter((a) => `${a.titulo} ${a.resumen ?? ''} ${a.contenido ?? ''}`.toLowerCase().includes(n));
}
