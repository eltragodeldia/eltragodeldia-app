import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Lugar, Receta } from './compartido/tipos';
import type { Idioma } from './compartido/idioma';
import { supabase } from './supabase';
import demo from './demo.json';
import demoArticulos from './demo-articulos.json';
import demoLugares from './demo-lugares.json';

export interface ArticuloApp { slug: string; titulo: string; resumen: string | null; titulo_en: string | null; resumen_en: string | null; contenido?: string | null; contenido_en?: string | null; foto_url: string | null; publicado_en: string | null; categoria: string | null }

const CLAVE = 'etd-catalogo-v4';
const DEMO = (): Catalogo => ({ recetas: demo as unknown as Receta[], articulos: demoArticulos as ArticuloApp[], lugares: demoLugares as unknown as Lugar[], actualizado: Date.now(), origen: 'demo' });

export interface Catalogo { recetas: Receta[]; articulos: ArticuloApp[]; lugares: Lugar[]; actualizado: number; origen: 'red' | 'guardado' | 'demo' }

/** Recetas publicadas: primero la red; sin conexión, la última copia guardada; sin base configurada, las de ejemplo. */
export async function cargarCatalogo(): Promise<Catalogo> {
  if (!supabase) return DEMO();
  try {
    const [rec, art, lug, del] = await Promise.all([
      supabase.from('recetas').select('*').eq('publicado', true).eq('exclusivo', false).order('publicado_en', { ascending: false }),
      supabase.from('articulos').select('slug,titulo,resumen,titulo_en,resumen_en,contenido,contenido_en,foto_url,publicado_en,categoria').eq('publicado', true).eq('exclusivo', false).order('publicado_en', { ascending: false }),
      supabase.from('lugares').select('*').eq('publicado', true).order('nombre'),
      supabase.rpc('deliciosos_totales'),
    ]);
    if (rec.error) throw rec.error;
    // Votos de "¡Me salió delicioso!" por receta, para la colección de las más deliciosas.
    const votos = new Map(((del.data ?? []) as { receta_slug: string; total: number }[]).map((v) => [v.receta_slug, v.total]));
    const cat: Catalogo = { recetas: ((rec.data ?? []) as Receta[]).map((r) => ({ ...r, deliciosos: votos.get(r.slug) ?? 0 })), articulos: (art.data ?? []) as ArticuloApp[], lugares: (lug.data ?? []) as Lugar[], actualizado: Date.now(), origen: 'red' };
    AsyncStorage.setItem(CLAVE, JSON.stringify(cat)).catch(() => {});
    return cat;
  } catch {
    const guardado = await AsyncStorage.getItem(CLAVE).catch(() => null);
    if (guardado) { const g = JSON.parse(guardado) as Catalogo; return { ...g, articulos: g.articulos ?? [], lugares: g.lugares ?? [], origen: 'guardado' }; }
    return DEMO();
  }
}

/** La receta en el idioma pedido. Sin traducción, queda en español. */
export function enIdioma(r: Receta, idioma: Idioma): Receta {
  if (idioma === 'es' || !r.nombre_en) return r;
  return {
    ...r,
    nombre: r.nombre_en ?? r.nombre,
    resumen: r.resumen_en ?? r.resumen,
    historia: r.historia_en ?? r.historia,
    error_comun: r.error_comun_en ?? r.error_comun,
    vaso: r.vaso_en ?? r.vaso,
    tecnica: r.tecnica_en ?? r.tecnica,
    ocasion: r.ocasion_en ?? r.ocasion,
    pasos: r.pasos_en?.length ? r.pasos_en : r.pasos,
    ingredientes: r.ingredientes.map((i, n) => ({ ...i, ingrediente: r.ingredientes_en?.[n] ?? i.ingrediente })),
  };
}

/** El trago del día: uno distinto cada día, el mismo para todos ese día. */
export function tragoDelDia(recetas: Receta[], fecha = new Date()): Receta | undefined {
  if (!recetas.length) return undefined;
  const lista = [...recetas].sort((a, b) => a.slug.localeCompare(b.slug));
  const dia = Math.floor(Date.UTC(fecha.getFullYear(), fecha.getMonth(), fecha.getDate()) / 86400000);
  return lista[((dia * 7919) % lista.length + lista.length) % lista.length];
}

/** El lugar en el idioma pedido. */
export function lugarEnIdioma(l: Lugar, idioma: Idioma): Lugar {
  if (idioma === 'es') return l;
  return { ...l, porque: l.porque_en ?? l.porque, pedido: l.pedido_en ?? l.pedido, ocasion: l.ocasion_en ?? l.ocasion, horario: l.horario_en ?? l.horario };
}

/** El artículo en el idioma pedido. Sin traducción, queda en español. */
export function articuloEnIdioma(a: ArticuloApp, idioma: Idioma): ArticuloApp {
  if (idioma === 'es' || !a.titulo_en) return a;
  return { ...a, titulo: a.titulo_en, resumen: a.resumen_en ?? a.resumen, contenido: a.contenido_en || a.contenido };
}
