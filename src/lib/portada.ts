import type { ArticuloApp } from './datos';
import { SITIO } from './tema';

/** Foto del artículo o, si no tiene, la portada ilustrada del sitio. */
export const portada = (a: ArticuloApp) => a.foto_url ?? `${SITIO}/portadas/articulos/${a.slug}.svg?v=2`;

/** Minutos de lectura, a 220 palabras por minuto. */
export const minutosDeLectura = (texto: string | null | undefined) => Math.max(1, Math.round((texto ?? '').split(/\s+/).filter(Boolean).length / 220));
