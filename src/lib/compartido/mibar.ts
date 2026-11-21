// Copiado de eltragodeldia-web/src/lib/mibar.ts. Mantener igual.
// "¿Qué puedo hacer con lo que tengo?": cada receta se reduce a las botellas y a los
// ingredientes de cocina que necesita (cítricos, frutas, sodas, lácteos, huevo, hierbas...).
// Solo se dan por hechos el hielo, el agua, el azúcar, el sirope simple, la sal y las
// especias, y lo que es solo para decorar.
import type { Receta } from './tipos';
import type { Idioma } from './idioma';

export interface Botella { clave: string; grupo: 'destilados' | 'licores' | 'otros'; es: string; en: string; patron: RegExp }

export const BOTELLAS: Botella[] = [
  { clave: 'ron-blanco', grupo: 'destilados', es: 'Ron blanco', en: 'White rum', patron: /ron blanco|white rum/ },
  { clave: 'ron-agricola', grupo: 'destilados', es: 'Ron agrícola', en: 'Rhum agricole', patron: /agrícola|agricole/ },
  { clave: 'ron-anejo', grupo: 'destilados', es: 'Ron añejo u oscuro', en: 'Aged or dark rum', patron: /ron (añejo|oscuro|jamaicano|demerara|dorado)|(aged|dark|jamaican|demerara|gold) rum|\bron\b|\brum\b/ },
  { clave: 'tequila-blanco', grupo: 'destilados', es: 'Tequila blanco', en: 'Blanco tequila', patron: /tequila blanco|blanco tequila|\btequila\b(?!.*reposado)/ },
  { clave: 'tequila-reposado', grupo: 'destilados', es: 'Tequila reposado', en: 'Reposado tequila', patron: /reposado/ },
  { clave: 'mezcal', grupo: 'destilados', es: 'Mezcal', en: 'Mezcal', patron: /mezcal/ },
  { clave: 'gin', grupo: 'destilados', es: 'Gin', en: 'Gin', patron: /\bgin\b|ginebra/ },
  { clave: 'whisky', grupo: 'destilados', es: 'Whisky (bourbon, rye o escocés)', en: 'Whiskey (bourbon, rye or Scotch)', patron: /whisk|bourbon|\brye\b|escocés|scotch/ },
  { clave: 'vodka', grupo: 'destilados', es: 'Vodka', en: 'Vodka', patron: /vodka/ },
  { clave: 'brandy', grupo: 'destilados', es: 'Coñac o brandy', en: 'Cognac or brandy', patron: /coñac|cognac|brandy|calvados|applejack/ },
  { clave: 'pisco', grupo: 'destilados', es: 'Pisco', en: 'Pisco', patron: /pisco/ },
  { clave: 'cachaca', grupo: 'destilados', es: 'Cachaça', en: 'Cachaça', patron: /cachaça|cachaca/ },
  { clave: 'vermut-rojo', grupo: 'licores', es: 'Vermut rojo', en: 'Sweet vermouth', patron: /vermut (rojo|dulce)|sweet vermouth|punt e mes/ },
  { clave: 'vermut-seco', grupo: 'licores', es: 'Vermut seco o blanco', en: 'Dry or blanc vermouth', patron: /vermut (seco|blanco)|(dry|blanc) vermouth|lillet/ },
  { clave: 'campari', grupo: 'licores', es: 'Campari', en: 'Campari', patron: /campari/ },
  { clave: 'aperol', grupo: 'licores', es: 'Aperol', en: 'Aperol', patron: /aperol/ },
  { clave: 'naranja', grupo: 'licores', es: 'Licor de naranja (triple sec, Cointreau, curaçao)', en: 'Orange liqueur (triple sec, Cointreau, curaçao)', patron: /triple sec|cointreau|curaçao|curacao|licor de naranja|orange liqueur/ },
  { clave: 'maraschino', grupo: 'licores', es: 'Maraschino', en: 'Maraschino', patron: /maraschino(?! cherr)(?!.*para decorar)|marrasquino(?!.*decorar)/ },
  { clave: 'chartreuse-verde', grupo: 'licores', es: 'Green Chartreuse', en: 'Green Chartreuse', patron: /green chartreuse|chartreuse verde/ },
  { clave: 'chartreuse-amarillo', grupo: 'licores', es: 'Yellow Chartreuse', en: 'Yellow Chartreuse', patron: /yellow chartreuse|chartreuse amarillo/ },
  { clave: 'cafe', grupo: 'licores', es: 'Licor de café', en: 'Coffee liqueur', patron: /licor de café|coffee liqueur|kahl/ },
  { clave: 'amaretto', grupo: 'licores', es: 'Amaretto', en: 'Amaretto', patron: /amaretto/ },
  { clave: 'benedictine', grupo: 'licores', es: 'Bénédictine', en: 'Bénédictine', patron: /bénédictine|benedictine/ },
  { clave: 'sauco', grupo: 'licores', es: 'Licor de saúco', en: 'Elderflower liqueur', patron: /saúco|elderflower|st-germain/ },
  { clave: 'cassis', grupo: 'licores', es: 'Crème de cassis o mûre', en: 'Crème de cassis or mûre', patron: /cassis|mûre/ },
  { clave: 'amaro', grupo: 'licores', es: 'Amaro (Cynar, Fernet, Nonino...)', en: 'Amaro (Cynar, Fernet, Nonino...)', patron: /amaro|cynar|fernet|jägermeister/ },
  { clave: 'licor43', grupo: 'licores', es: 'Licor 43', en: 'Licor 43', patron: /licor 43/ },
  { clave: 'galliano', grupo: 'licores', es: 'Galliano', en: 'Galliano', patron: /galliano/ },
  { clave: 'cacao', grupo: 'licores', es: 'Crème de cacao', en: 'Crème de cacao', patron: /crème de cacao|licor de cacao|cacao blanco/ },
  { clave: 'menthe', grupo: 'licores', es: 'Crème de menthe', en: 'Crème de menthe', patron: /menthe/ },
  { clave: 'fruta', grupo: 'licores', es: 'Licor de fruta (durazno, albaricoque, frambuesa, lychee)', en: 'Fruit liqueur (peach, apricot, raspberry, lychee)', patron: /licor de (durazno|albaricoque|melocotón|frambuesa|lychee|lichi)|(peach|apricot|raspberry|lychee) liqueur/ },
  { clave: 'allspice', grupo: 'licores', es: 'Allspice dram', en: 'Allspice dram', patron: /allspice|pimienta de jamaica/ },
  { clave: 'heering', grupo: 'licores', es: 'Cherry Heering', en: 'Cherry Heering', patron: /heering/ },
  { clave: 'violette', grupo: 'licores', es: 'Crème de violette', en: 'Crème de violette', patron: /violette/ },
  { clave: 'pimms', grupo: 'licores', es: "Pimm's", en: "Pimm's", patron: /pimm/ },
  { clave: 'absenta', grupo: 'otros', es: 'Absenta', en: 'Absinthe', patron: /absenta|absinthe/ },
  { clave: 'angostura', grupo: 'otros', es: 'Angostura', en: 'Angostura', patron: /angostura|bitter aromático|aromatic bitters/ },
  { clave: 'bitters', grupo: 'otros', es: "Otros bitters (naranja, Peychaud's)", en: "Other bitters (orange, Peychaud's)", patron: /bitter de naranja|orange bitters|peychaud|bitters? de/ },
  { clave: 'falernum', grupo: 'otros', es: 'Falernum', en: 'Falernum', patron: /falernum/ },
  { clave: 'orgeat', grupo: 'otros', es: 'Orgeat', en: 'Orgeat', patron: /orgeat/ },
  { clave: 'espumoso', grupo: 'otros', es: 'Vino espumoso (cava, prosecco, champán)', en: 'Sparkling wine (cava, prosecco, Champagne)', patron: /espumoso|sparkling|prosecco|champ|\bcava\b/ },
  { clave: 'vino-tinto', grupo: 'otros', es: 'Vino tinto', en: 'Red wine', patron: /vino tinto|red wine|malbec/ },
  { clave: 'jerez', grupo: 'otros', es: 'Jerez', en: 'Sherry', patron: /jerez|sherry/ },
  { clave: 'cerveza', grupo: 'otros', es: 'Cerveza', en: 'Beer', patron: /cerveza|\bbeer\b(?! ginger)/ },
];

// Lo que se da por hecho aunque contenga una palabra de botella (ej. "ginger beer", "cereza marrasquino").
const DESPENSA = /tomate|tomato|ginger beer|ginger ale|para decorar|to garnish|cereza|cherry(?! heering)|sirope de|syrup|piel de|peel/;

export function botellasDe(r: Receta): string[] {
  const claves = new Set<string>();
  for (const i of r.ingredientes) {
    const n = i.ingrediente.toLowerCase();
    if (DESPENSA.test(n) && !/orgeat|heering|maraschino liqueur|licor maraschino/.test(n)) continue;
    const b = BOTELLAS.find((x) => x.patron.test(n));
    if (b) claves.add(b.clave);
  }
  return [...claves];
}

export interface Ingrediente { clave: string; grupo: 'frutas' | 'sodas' | 'cocina'; es: string; en: string; patron: RegExp }

// El orden importa: primero sodas (para que "soda de limón" no cuente como limones), luego cocina, luego frutas.
export const INGREDIENTES: Ingrediente[] = [
  { clave: 'tonica', grupo: 'sodas', es: 'Agua tónica', en: 'Tonic water', patron: /tónica|tonica|tonic/ },
  { clave: 'ginger', grupo: 'sodas', es: 'Ginger beer o ginger ale', en: 'Ginger beer or ginger ale', patron: /ginger beer|ginger ale|cerveza de jengibre/ },
  { clave: 'cola', grupo: 'sodas', es: 'Refresco de cola', en: 'Cola', patron: /(^|[^a-záéíóúñ])cola\b|\bcoke\b/ },
  { clave: 'soda-toronja', grupo: 'sodas', es: 'Soda de toronja', en: 'Grapefruit soda', patron: /soda de toronja|refresco de toronja|grapefruit soda|squirt/ },
  { clave: 'soda-limon', grupo: 'sodas', es: 'Soda de limón o limonada', en: 'Lemon-lime soda or lemonade', patron: /soda de lim[oó]n|refresco de lim[oó]n|gaseosa de lim[oó]n|lemon-lime|limonada|lemonade|sprite/ },
  { clave: 'agua-gas', grupo: 'sodas', es: 'Agua con gas', en: 'Soda water', patron: /agua (con gas|mineral|gaseosa)|soda water|club soda|sparkling water|mineral water|seltzer|^soda\b(?! de)/ },
  { clave: 'cafe-te', grupo: 'cocina', es: 'Café o té', en: 'Coffee or tea', patron: /caf[eé](?!.*licor)|espresso|coffee|\bt[eé]\b|\btea\b|earl grey/ },
  { clave: 'lacteos', grupo: 'cocina', es: 'Leche o crema', en: 'Milk or cream', patron: /leche(?! de coco)|crema(?! de coco)|nata|half and half|(?<!coconut )cream(?! of coconut)|(?<!coconut )milk/ },
  { clave: 'coco', grupo: 'cocina', es: 'Leche o crema de coco', en: 'Coconut milk or cream', patron: /coco|coconut/ },
  { clave: 'huevo', grupo: 'cocina', es: 'Huevos', en: 'Eggs', patron: /huevo|clara|yema|\begg/ },
  { clave: 'miel-agave', grupo: 'cocina', es: 'Miel o agave', en: 'Honey or agave', patron: /miel|honey|agave/ },
  { clave: 'granadina', grupo: 'cocina', es: 'Granadina', en: 'Grenadine', patron: /granadina|grenadine/ },
  { clave: 'hierbas', grupo: 'cocina', es: 'Menta o hierbas frescas', en: 'Mint or fresh herbs', patron: /menta|hierbabuena|albahaca|romero|tomillo|\bmint\b|basil|rosemary|thyme/ },
  { clave: 'picante', grupo: 'cocina', es: 'Chile o picante', en: 'Chile or hot sauce', patron: /chile|jalape|habanero|tajín|tajin|chamoy|picante|salsa (inglesa|valentina|tabasco)|hot sauce|worcestershire/ },
  { clave: 'tomate', grupo: 'cocina', es: 'Jugo de tomate o Clamato', en: 'Tomato juice or Clamato', patron: /tomate|tomato|clamato|bloody mary mix/ },
  { clave: 'pepino', grupo: 'cocina', es: 'Pepino', en: 'Cucumber', patron: /pepino|cucumber/ },
  { clave: 'limones', grupo: 'frutas', es: 'Limones (verdes o amarillos)', en: 'Limes or lemons', patron: /lim[oó]n|\blima\b|\blime|lemon/ },
  { clave: 'naranja-fruta', grupo: 'frutas', es: 'Naranjas', en: 'Oranges', patron: /naranja|orange/ },
  { clave: 'toronja', grupo: 'frutas', es: 'Toronja', en: 'Grapefruit', patron: /toronja|pomelo|grapefruit/ },
  { clave: 'pina', grupo: 'frutas', es: 'Piña o jugo de piña', en: 'Pineapple or pineapple juice', patron: /piña|pineapple/ },
  { clave: 'arandano', grupo: 'frutas', es: 'Jugo de arándano', en: 'Cranberry juice', patron: /ar[aá]ndano|cranberry/ },
  { clave: 'frutas', grupo: 'frutas', es: 'Otras frutas (fresa, mango, maracuyá...)', en: 'Other fruit (strawberry, mango, passion fruit...)', patron: /fresa|frambuesa|\bmora|mango|maracuy|parchita|sand[ií]a|durazno|melocot|manzana|\bpera\b|kiwi|lichi|lychee|guayaba|tamarindo|jamaica|uva|strawberr|raspberr|blackberr|passion|watermelon|peach|apple|\bpear\b|guava|grape/ },
];

// Lo que es solo para decorar no se exige.
const DECORAR = /para decorar|to garnish|garnish|decorar|escarchar|para el borde|for the rim|\brim\b|\bpiel\b|c[aá]scara|twist|\bpeel\b|ramita|sprig|\brueda\b|\bwheel\b|cereza|cherry(?! heering)/;

export interface Necesita { b: string[]; i: string[]; l: Record<string, string> }

/** Botellas e ingredientes de cocina que pide una receta, con el nombre tal como aparece en ella. */
export function necesitaDe(r: Receta): Necesita {
  const b = new Set<string>();
  const i = new Set<string>();
  const l: Record<string, string> = {};
  for (const ing of r.ingredientes) {
    const n = ing.ingrediente.toLowerCase();
    if (DECORAR.test(n)) continue;
    const esDespensa = DESPENSA.test(n) && !/orgeat|heering|maraschino liqueur|licor maraschino/.test(n);
    const bot = esDespensa ? undefined : BOTELLAS.find((x) => x.patron.test(n));
    if (bot) { b.add(bot.clave); continue; }
    const coc = INGREDIENTES.find((x) => x.patron.test(n));
    if (coc && !i.has(coc.clave)) { i.add(coc.clave); l[coc.clave] = ing.ingrediente; }
  }
  return { b: [...b], i: [...i], l };
}

/** Lo que casi todo el mundo tiene en la cocina (para el botón "Tengo lo básico"). */
export const BASICOS = ['limones', 'naranja-fruta', 'agua-gas', 'huevo', 'lacteos', 'miel-agave'];

export const GRUPOS_COCINA: Record<Idioma, Record<Ingrediente['grupo'], string>> = {
  es: { frutas: 'Frutas y jugos', sodas: 'Sodas', cocina: 'De la cocina' },
  en: { frutas: 'Fruit and juice', sodas: 'Sodas', cocina: 'From the kitchen' },
};

export const GRUPOS: Record<Idioma, Record<Botella['grupo'], string>> = {
  es: { destilados: 'Destilados', licores: 'Licores y aperitivos', otros: 'Bitters, vinos y otros' },
  en: { destilados: 'Spirits', licores: 'Liqueurs and aperitifs', otros: 'Bitters, wine and more' },
};

/** Clave de Mi bar de un ingrediente suelto (botella o de cocina), o null si no se reconoce
 *  o es solo para decorar. Sirve para la lista de compra: "ya lo tengo" según lo marcado en Mi bar. */
export function claveMiBar(nombre: string): string | null {
  const n = nombre.toLowerCase();
  if (DECORAR.test(n)) return null;
  const esDespensa = DESPENSA.test(n) && !/orgeat|heering|maraschino liqueur|licor maraschino/.test(n);
  const bot = esDespensa ? undefined : BOTELLAS.find((x) => x.patron.test(n));
  if (bot) return bot.clave;
  return INGREDIENTES.find((x) => x.patron.test(n))?.clave ?? null;
}
