// Colecciones: páginas que agrupan recetas por tema (los 20 con ron, clásicos
// modernos, tragos del Caribe...). Se arman en el build con las recetas publicadas;
// una colección con menos de 3 recetas no genera página.
import type { Receta } from './tipos';
import type { Idioma } from './idioma';

type Texto = Record<Idioma, string>;

export interface Coleccion {
  slug: string; // igual en los dos idiomas
  titulo: Texto;
  intro: Texto;
  /** Lista fija de slugs en orden, o un filtro. */
  slugs?: string[];
  filtro?: (r: Receta) => boolean;
  /** Orden propio para las recetas del filtro (si no, primero las que tienen video). */
  orden?: (a: Receta, b: Receta) => number;
  max?: number;
}

const porDestilado = (d: string) => (r: Receta) => r.destilado === d;

const DESTILADOS: [string, string, string, string, string][] = [
  ['ron', 'Ron', 'Rum', 'ron', 'rum'],
  ['tequila', 'Tequila', 'Tequila', 'tequila', 'tequila'],
  ['mezcal', 'Mezcal', 'Mezcal', 'mezcal', 'mezcal'],
  ['gin', 'Gin', 'Gin', 'gin', 'gin'],
  ['whisky', 'Whisky', 'Whiskey', 'whisky', 'whiskey'],
  ['vodka', 'Vodka', 'Vodka', 'vodka', 'vodka'],
];

export const COLECCIONES: Coleccion[] = [
  {
    slug: 'las-mas-deliciosas',
    titulo: { es: 'Las más deliciosas', en: 'The most delicioso' },
    intro: {
      es: 'Las recetas que más personas prepararon en casa y marcaron con "¡Me salió delicioso!". La lista cambia según lo que ustedes votan.',
      en: 'The recipes the most people made at home and marked "Mine came out delicioso!". The list changes with your votes.',
    },
    filtro: (r) => (r.deliciosos ?? 0) > 0,
    orden: (a, b) => (b.deliciosos ?? 0) - (a.deliciosos ?? 0),
    max: 20,
  },
  ...DESTILADOS.map(([slug, d, , es, en]) => ({
    slug: `tragos-con-${slug}`,
    titulo: { es: `Los mejores tragos con ${es}`, en: `The best ${en} cocktails` },
    intro: {
      es: `Mis recetas favoritas con ${es}: primero los clásicos que todo el mundo debería saber hacer y después los que me gusta preparar cuando quiero sorprender.`,
      en: `My favorite ${en} recipes: first the classics everyone should know how to make, then the ones I make when I want to surprise someone.`,
    },
    filtro: porDestilado(d),
    max: 20,
  })),
  {
    slug: 'clasicos-modernos',
    titulo: { es: 'Clásicos modernos que todo bartender debe saber', en: 'Modern classics every bartender should know' },
    intro: {
      es: 'Tragos creados en barras de todo el mundo desde los años 2000 que ya se ganaron su lugar junto a los clásicos de siempre. Cada receta dice quién la creó y dónde.',
      en: 'Drinks created in bars around the world since the 2000s that have earned their place next to the old classics. Every recipe says who created it and where.',
    },
    slugs: ['penicillin', 'paper-plane', 'naked-and-famous', 'old-cuban', 'gold-rush', 'enzoni', 'gin-basil-smash', 'gin-gin-mule', 'earl-grey-marteani', 'red-hook', 'greenpoint', 'little-italy', 'final-ward', 'division-bell', 'oaxaca-old-fashioned', 'death-flip', 'trinidad-sour', 'jungle-bird', 'pina-verde', 'bitter-giuseppe', 'revolver', 'chartreuse-swizzle', 'industry-sour', 'tommys-margarita', 'espresso-martini', 'pornstar-martini', 'cosmopolitan', 'bramble'],
  },
  {
    slug: 'tragos-del-caribe',
    titulo: { es: 'Tragos del Caribe', en: 'Caribbean drinks' },
    intro: {
      es: 'De La Habana a San Juan, de Santo Domingo a Barbados: los tragos que nacieron en las islas o que no se entienden sin ellas.',
      en: 'From Havana to San Juan, from Santo Domingo to Barbados: drinks born in the islands, or that make no sense without them.',
    },
    slugs: ['daiquiri', 'mojito-cubano', 'cuba-libre', 'el-presidente', 'hemingway-daiquiri', 'canchanchara', 'hotel-nacional', 'mary-pickford', 'old-cuban', 'pina-colada', 'coquito-para-2-personas', 'painkiller', 'planters-punch', 'queens-park-swizzle', 'ti-punch', 'corn-n-oil', 'jungle-bird', 'trinidad-sour', 'remember-the-maine', 'mulata-daiquiri', 'morir-sonando', 'libertad-tropical'],
  },
  {
    slug: 'tiki',
    titulo: { es: 'Tiki: los clásicos del trago tropical', en: 'Tiki: the classic tropical drinks' },
    intro: {
      es: 'Los tragos de Don the Beachcomber, Trader Vic y sus herederos. Varios rones, especias, frutas y hielo picado. El tiki tiene historia y técnica, y aquí está lo esencial.',
      en: 'The drinks of Don the Beachcomber, Trader Vic and their heirs. Several rums, spices, fruit and crushed ice. Tiki has history and technique, and here are the essentials.',
    },
    slugs: ['mai-tai', 'zombie', 'navy-grog', 'jet-pilot', 'scorpion', 'three-dots-and-a-dash', 'missionarys-downfall', 'saturn', 'painkiller', 'jungle-bird', 'hurricane', 'singapore-sling', 'queens-park-swizzle', 'chartreuse-swizzle', 'pina-verde', 'tia-mia', 'army-and-navy'],
  },
  {
    slug: 'margaritas',
    titulo: { es: 'Una Margarita para cada ánimo', en: 'A Margarita for every mood' },
    intro: {
      es: 'La clásica, la de agave, la de jamaica, la de mezcal, la de jarra con mango y chile. Y sus primas que también llevan tequila y limón.',
      en: 'The classic, the agave one, the hibiscus one, the mezcal one, the pitcher with mango and chile. And their cousins that also take tequila and lime.',
    },
    slugs: ['margarita', 'tommys-margarita', 'margarita-de-jamaica', 'margarita-50-50-mezcal-y-tequila', 'margarita-en-batch-mango-y-chile', 'mezcalita-negra', 'paloma', 'mezcal-paloma', 'ranch-water', 'el-pepino', 'cantarito', 'kamikaze'],
  },
  {
    slug: 'hispanos-y-latinos',
    titulo: { es: 'Tragos de España y Latinoamérica', en: 'Drinks from Spain and Latin America' },
    intro: {
      es: 'Lo que se toma en nuestras fiestas, ferias y casas: de la Feria de Abril a un colmado en Santo Domingo, de Lima a Jalisco.',
      en: 'What people drink at our parties, fairs and homes: from the April Fair to a corner store in Santo Domingo, from Lima to Jalisco.',
    },
    slugs: ['tinto-de-verano', 'rebujito', 'kalimotxo', 'agua-de-valencia', 'pisco-sour', 'chilcano', 'caipirinha', 'batida-de-coco', 'morir-sonando', 'michelada', 'cantarito', 'charro-negro', 'vampiro', 'batanga', 'carajillo-con-tequila-reposado', 'canchanchara', 'mojito-cubano', 'coquito-para-2-personas'],
  },
  {
    slug: 'bajo-alcohol-y-sin-alcohol',
    titulo: { es: 'Bajo alcohol y sin alcohol', en: 'Low and no alcohol' },
    intro: {
      es: 'Para tomar algo con sabor sin cargar la noche. Aperitivos, spritz, highballs y tragos sin una gota de alcohol que no saben a castigo.',
      en: 'For a drink with flavor without loading up the night. Aperitifs, spritzes, highballs and zero-proof drinks that do not taste like punishment.',
    },
    filtro: (r) => r.destilado === 'Sin alcohol' && r.slug !== 'sirope-el-trago-del-dia',
    slugs: ['americano', 'aperol-spritz', 'hugo-spritz', 'amaro-highball', 'bitter-giuseppe', 'sherry-cobbler', 'rebujito', 'tinto-de-verano', 'kir-royal', 'mimosa', 'bellini', 'pimms-cup'],
  },
  {
    slug: 'para-el-brunch',
    titulo: { es: 'Tragos para el brunch', en: 'Brunch drinks' },
    intro: {
      es: 'Bloody Marys, burbujas, cítricos y café. Lo que quiero en la mesa un domingo a media mañana.',
      en: 'Bloody Marys, bubbles, citrus and coffee. What I want on the table on a Sunday morning.',
    },
    filtro: (r) => r.ocasion === 'Brunch',
  },
  {
    slug: 'para-noches-frias-y-navidad',
    titulo: { es: 'Tragos para noches frías y Navidad', en: 'Drinks for cold nights and the holidays' },
    intro: {
      es: 'Calientes, cremosos o revueltos con whiskey. Los que preparo cuando baja la temperatura y en las fiestas de fin de año.',
      en: 'Hot, creamy or stirred with whiskey. The ones I make when the temperature drops and during the year-end holidays.',
    },
    filtro: (r) => r.ocasion === 'Noche fría' || r.ocasion === 'Navidad',
    slugs: ['coquito-para-2-personas', 'irish-coffee', 'hot-toddy', 'brandy-alexander', 'white-russian', 'espresso-martini'],
  },
];

/** Recetas de una colección, en orden: primero la lista fija, luego las del filtro (con video y destacadas primero). */
export function recetasDe(c: Coleccion, todas: Receta[]): Receta[] {
  const porSlug = new Map(todas.map((r) => [r.slug, r]));
  const fijas = (c.slugs ?? []).map((s) => porSlug.get(s)).filter(Boolean) as Receta[];
  const vistas = new Set(fijas.map((r) => r.slug));
  const extra = c.filtro
    ? todas
        .filter((r) => c.filtro!(r) && !vistas.has(r.slug))
        .sort(c.orden ?? ((a, b) => Number(Boolean(b.video_url)) - Number(Boolean(a.video_url)) || Number(b.destacada) - Number(a.destacada)))
    : [];
  const lista = [...fijas, ...extra];
  return c.max ? lista.slice(0, c.max) : lista;
}

export const MINIMO = 3;
