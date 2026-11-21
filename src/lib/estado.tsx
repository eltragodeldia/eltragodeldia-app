import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Idioma } from './compartido/idioma';
import type { Lugar, Receta } from './compartido/tipos';
import { cargarCatalogo, enIdioma, lugarEnIdioma, type Catalogo } from './datos';
import { TEXTOS, type Textos } from './textos';

// Todo se guarda en el teléfono. Con cuenta (próxima versión) se sincroniza con app_favoritos, app_mibar, app_lista y app_ajustes.
export interface EnLista { s: string; p: number }
interface Guardado { edad: 'si' | 'no' | null; idioma: Idioma; unidad: 'oz' | 'ml'; aviso: boolean; favoritos: string[]; mibar: string[]; lista: EnLista[]; hechos: string[] }

const CLAVE = 'etd-estado-v1';
const idiomaTelefono = (): Idioma => (getLocales()[0]?.languageCode === 'en' ? 'en' : 'es');
const inicial = (): Guardado => ({ edad: null, idioma: idiomaTelefono(), unidad: 'oz', aviso: true, favoritos: [], mibar: [], lista: [], hechos: [] });

interface Ctx extends Guardado {
  listo: boolean;
  t: Textos;
  catalogo: Catalogo | null;
  recetas: Receta[];
  receta: (slug: string) => Receta | undefined;
  lugares: Lugar[];
  cambiar: (p: Partial<Guardado>) => void;
  alternarFavorito: (slug: string) => void;
  alternarMiBar: (clave: string) => void;
  agregarALista: (slug: string, porciones: number) => void;
  quitarDeLista: (slug: string) => void;
  recargar: () => Promise<void>;
}

const Contexto = createContext<Ctx | null>(null);

export function EstadoProvider({ children }: { children: ReactNode }) {
  const [g, setG] = useState<Guardado>(inicial);
  const [listo, setListo] = useState(false);
  const [catalogo, setCatalogo] = useState<Catalogo | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(CLAVE)
      .then((v) => { if (v) setG({ ...inicial(), ...(JSON.parse(v) as Partial<Guardado>) }); })
      .catch(() => {})
      .finally(() => setListo(true));
    cargarCatalogo().then(setCatalogo);
  }, []);

  useEffect(() => { if (listo) AsyncStorage.setItem(CLAVE, JSON.stringify(g)).catch(() => {}); }, [g, listo]);

  const cambiar = useCallback((p: Partial<Guardado>) => setG((x) => ({ ...x, ...p })), []);
  const alternar = (lista: string[], v: string) => (lista.includes(v) ? lista.filter((x) => x !== v) : [v, ...lista]);

  const recetas = useMemo(() => (catalogo?.recetas ?? []).map((r) => enIdioma(r, g.idioma)), [catalogo, g.idioma]);
  const lugares = useMemo(() => (catalogo?.lugares ?? []).map((l) => lugarEnIdioma(l, g.idioma)), [catalogo, g.idioma]);

  const valor: Ctx = {
    ...g,
    listo,
    t: TEXTOS[g.idioma],
    catalogo,
    recetas,
    lugares,
    receta: (slug) => recetas.find((r) => r.slug === slug),
    cambiar,
    alternarFavorito: (s) => setG((x) => ({ ...x, favoritos: alternar(x.favoritos, s) })),
    alternarMiBar: (k) => setG((x) => ({ ...x, mibar: alternar(x.mibar, k) })),
    agregarALista: (s, p) => setG((x) => ({ ...x, lista: [{ s, p }, ...x.lista.filter((r) => r.s !== s)] })),
    quitarDeLista: (s) => setG((x) => ({ ...x, lista: x.lista.filter((r) => r.s !== s) })),
    recargar: async () => setCatalogo(await cargarCatalogo()),
  };
  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useEstado() {
  const c = useContext(Contexto);
  if (!c) throw new Error('useEstado fuera de EstadoProvider');
  return c;
}
