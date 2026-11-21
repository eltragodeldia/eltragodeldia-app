// Copiado de eltragodeldia-web/src/lib/tipos.ts (solo recetas). Mantener igual.
export const DESTILADOS = ['Ron', 'Tequila', 'Mezcal', 'Gin', 'Whisky', 'Vodka', 'Licores', 'Sin alcohol'] as const;
export const DIFICULTADES = ['Fácil', 'Intermedia', 'Avanzada'] as const;
export const TIPOS_LUGAR = ['Coctelería', 'Restaurante', 'Hotel'] as const;
export const CATEGORIAS = ['Destilados', 'Técnica', 'Cultura', 'Opinión', 'Viajes', 'Entrevistas'] as const;
/** Categorías del mapa: momentos y estilos, no solo tipo de lugar. Un lugar puede tener varias. */
export const CATEGORIAS_LUGAR = [
  'Coctelería de autor',
  'Speakeasy',
  'Rooftop',
  'Clásicos cubanos',
  'Para una cita',
  'Primera vez en Miami',
  'Íconos de Miami',
  'Música en vivo',
  'Happy hour',
  'Lo nuevo',
] as const;

export const UNIDADES = ['oz', 'dash', 'unidad', 'hojas', 'al gusto'] as const;

export type Destilado = (typeof DESTILADOS)[number];
export type TipoLugar = (typeof TIPOS_LUGAR)[number];

export interface Ingrediente {
  cantidad: number | null;
  unidad: (typeof UNIDADES)[number];
  ingrediente: string;
}

export interface Receta {
  /** Votos de "¡Me salió delicioso!" al momento del build (db/009). */
  deliciosos?: number;
  id: string;
  slug: string;
  nombre: string;
  destilado: Destilado;
  dificultad: (typeof DIFICULTADES)[number];
  tiempo_min: number | null;
  vaso: string | null;
  tecnica: string | null;
  ocasion: string | null;
  resumen: string | null;
  historia: string | null;
  ingredientes: Ingrediente[];
  pasos: string[];
  error_comun: string | null;
  foto_url: string | null;
  video_url: string | null;
  destacada: boolean;
  nombre_en?: string | null;
  resumen_en?: string | null;
  historia_en?: string | null;
  error_comun_en?: string | null;
  vaso_en?: string | null;
  tecnica_en?: string | null;
  ocasion_en?: string | null;
  ingredientes_en?: string[];
  pasos_en?: string[];
  /** Calculadora de batch (db/014). Vacío = se deduce de la técnica. */
  batch_modo?: 'revuelto' | 'agitado' | 'construido' | 'no' | null;
  batch_dilucion?: number | null;
  batch_nota?: string | null;
  batch_nota_en?: string | null;
  exclusivo: boolean;
  publicado: boolean;
  publicado_en: string | null;
  actualizado_en: string;
}

