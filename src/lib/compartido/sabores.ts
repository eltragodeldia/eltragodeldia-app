// Copiado del sitio (src/lib/sabores.ts); si cambia allá, se copia igual aquí.
// Perfil de sabor de una receta, calculado de sus ingredientes, vaso y técnica.
// Sirve para filtrar por "sensación" en /recetas. Las palabras clave cubren
// español e inglés porque en /en los ingredientes ya vienen traducidos.
import type { Receta } from './tipos';
import type { Idioma } from './idioma';

export const SABORES = ['refrescante', 'citrico', 'dulce', 'amargo', 'fuerte', 'cremoso', 'ahumado', 'tropical'] as const;
export type Sabor = (typeof SABORES)[number];

export const NOMBRE_SABOR: Record<Idioma, Record<Sabor, string>> = {
  es: { refrescante: 'Refrescante', citrico: 'Cítrico', dulce: 'Dulce', amargo: 'Amargo', fuerte: 'Fuerte', cremoso: 'Cremoso', ahumado: 'Ahumado', tropical: 'Tropical' },
  en: { refrescante: 'Refreshing', citrico: 'Citrusy', dulce: 'Sweet', amargo: 'Bitter', fuerte: 'Spirit-forward', cremoso: 'Creamy', ahumado: 'Smoky', tropical: 'Tropical' },
};

const tiene = (texto: string, claves: string[]) => claves.some((c) => texto.includes(c));

export function sabores(r: Receta): Sabor[] {
  const ing = r.ingredientes.map((i) => i.ingrediente.toLowerCase());
  const todo = ing.join(' | ').replace(/tomates? campari/g, 'tomate');
  const oz = (claves: string[]) => r.ingredientes.filter((i) => i.unidad === 'oz' && tiene(i.ingrediente.toLowerCase(), claves)).reduce((s, i) => s + (i.cantidad ?? 0), 0);
  const vaso = (r.vaso ?? '').toLowerCase();
  const tec = (r.tecnica ?? '').toLowerCase();
  const s = new Set<Sabor>();

  const largo = tiene(todo, ['soda', 'agua con gas', 'tónica', 'tonic', 'ginger', 'espumoso', 'sparkling', 'prosecco', 'champ', 'cava', 'gaseosa', 'cerveza', 'beer', 'refresco']) || /(^|[^a-záéíóúñ])cola\b/.test(todo);
  if (largo || tiene(todo, ['menta', 'mint', 'pepino', 'cucumber']) || tiene(vaso, ['alto', 'collins', 'highball']) || tiene(tec, ['swizzle', 'licuado', 'blended'])) s.add('refrescante');
  if (oz(['limón', 'lima', 'lime', 'lemon', 'toronja', 'grapefruit']) >= 0.5) s.add('citrico');
  if (tiene(todo, ['crema de coco', 'cream of coconut', 'leche condensada', 'condensed', 'licor de café', 'coffee liqueur', 'amaretto', 'cacao', 'chocolate', 'vainilla', 'vanilla', 'fresa', 'strawberr', 'maracuyá', 'passion', 'durazno', 'peach', 'lychee', 'lichi', 'coquito', 'galliano']) || oz(['sirope', 'syrup', 'granadina', 'grenadine', 'orgeat']) >= 1) s.add('dulce');
  if (tiene(todo, ['campari', 'aperol', 'amaro', 'cynar', 'fernet', 'punt e mes', 'jägermeister']) || oz(['angostura']) > 0) s.add('amargo');
  const mixer = largo || tiene(todo, ['jugo', 'juice', 'leche', 'milk', 'crema', 'cream', 'puré', 'purée']);
  if (r.destilado !== 'Sin alcohol' && (tiene(tec, ['revuelto', 'stirred']) || (!mixer && oz(['limón', 'lima', 'lime', 'lemon']) === 0))) s.add('fuerte');
  if (tiene(todo, ['crema', 'cream', 'leche', 'milk', 'clara', 'egg', 'huevo', 'coco', 'coconut'])) s.add('cremoso');
  if (tiene(todo, ['mezcal', 'islay', 'ahumad', 'smoked', 'smoky']) || tiene(r.slug, ['smoked'])) s.add('ahumado');
  if (tiene(todo, ['piña', 'pineapple', 'coco', 'coconut', 'maracuyá', 'passion', 'mango', 'falernum', 'orgeat', 'guayaba', 'guava']) || tiene(vaso, ['tiki', 'hurricane'])) s.add('tropical');
  return SABORES.filter((x) => s.has(x));
}
