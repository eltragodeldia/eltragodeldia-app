// Copiado de eltragodeldia-web/src/lib/utilidades.ts. Mantener igual.
import type { Ingrediente } from './tipos';
import type { Idioma } from './idioma';

const FRACCIONES: Record<string, string> = { '0.25': '¼', '0.5': '½', '0.75': '¾', '0.33': '⅓', '0.67': '⅔' };

/** 1.5 -> "1½", 0.75 -> "¾", 2 -> "2" */
export function formatoOz(n: number): string {
  const entero = Math.floor(n);
  const resto = Math.round((n - entero) * 100) / 100;
  const frac = FRACCIONES[resto.toFixed(2).replace(/0$/, '')] ?? FRACCIONES[String(resto)];
  if (resto === 0) return String(entero);
  if (frac) return (entero > 0 ? String(entero) : '') + frac;
  return n.toLocaleString('es', { maximumFractionDigits: 2 });
}

/** Convención de barra: 1 oz = 30 ml */
export function formatoMl(n: number, idioma: Idioma = 'es'): string {
  const ml = Math.round(n * 30 * 2) / 2;
  return ml.toLocaleString(idioma === 'en' ? 'en-US' : 'es', { maximumFractionDigits: 1 });
}

export function cantidadTexto(i: Ingrediente, sistema: 'oz' | 'ml', idioma: Idioma = 'es'): string {
  if (i.unidad === 'al gusto' || i.cantidad == null) return idioma === 'en' ? 'to taste' : 'al gusto';
  if (i.unidad === 'oz') return sistema === 'oz' ? `${formatoOz(i.cantidad)} oz` : `${formatoMl(i.cantidad, idioma)} ml`;
  if (i.unidad === 'dash') return `${formatoOz(i.cantidad)} ${i.cantidad === 1 ? 'dash' : 'dashes'}`;
  if (i.unidad === 'hojas') return `${formatoOz(i.cantidad)} ${idioma === 'en' ? 'leaves' : 'hojas'}`;
  return formatoOz(i.cantidad);
}

