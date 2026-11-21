import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { Idioma } from './compartido/idioma';
import type { Lugar, Receta } from './compartido/tipos';
import { programarAvisos } from './aviso';
import { cargarCatalogo, enIdioma, lugarEnIdioma, type Catalogo } from './datos';
import { fusionar, subir, type Sincronizable } from './sincronizar';
import { supabase } from './supabase';
import { TEXTOS, type Textos } from './textos';

// Todo se guarda en el teléfono. Con cuenta, además se sincroniza con app_favoritos, app_mibar, app_lista y app_ajustes (sincronizar.ts).
export interface EnLista { s: string; p: number }
interface Guardado { edad: 'si' | 'no' | null; idioma: Idioma; unidad: 'oz' | 'ml'; aviso: boolean; avisoPreguntado: boolean; favoritos: string[]; mibar: string[]; lista: EnLista[]; hechos: string[] }

const CLAVE = 'etd-estado-v1';
const idiomaTelefono = (): Idioma => (getLocales()[0]?.languageCode === 'en' ? 'en' : 'es');
const inicial = (): Guardado => ({ edad: null, idioma: idiomaTelefono(), unidad: 'oz', aviso: true, avisoPreguntado: false, favoritos: [], mibar: [], lista: [], hechos: [] });

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
  usuario: Usuario | null;
  sincro: 'listo' | 'subiendo' | 'error';
}

export interface Usuario { id: string; correo: string }
const parteSincronizable = (g: Guardado): Sincronizable => ({ favoritos: g.favoritos, mibar: g.mibar, lista: g.lista, idioma: g.idioma, unidad: g.unidad });

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

  // Cuenta: la sesión la guarda supabase-js en el teléfono y se renueva sola.
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [sincro, setSincro] = useState<Ctx['sincro']>('listo');
  const ultimo = useRef<Sincronizable | null>(null);
  useEffect(() => {
    if (!supabase) return;
    const poner = (u: { id: string; email?: string } | null | undefined) => setUsuario((x) => (u ? (x?.id === u.id ? x : { id: u.id, correo: u.email ?? '' }) : null));
    supabase.auth.getSession().then(({ data }) => poner(data.session?.user)).catch(() => {});
    const { data } = supabase.auth.onAuthStateChange((_e, sesion) => poner(sesion?.user));
    return () => data.subscription.unsubscribe();
  }, []);
  // Al entrar (o al abrir la app con sesión) se junta lo del teléfono con lo de la cuenta.
  const gRef = useRef(g);
  gRef.current = g;
  useEffect(() => {
    ultimo.current = null;
    if (!listo || !usuario) return;
    let vivo = true;
    setSincro('subiendo');
    fusionar(parteSincronizable(gRef.current), usuario.id)
      .then((junto) => { if (!vivo) return; ultimo.current = junto; setG((x) => ({ ...x, ...junto })); setSincro('listo'); })
      .catch(() => { if (vivo) setSincro('error'); });
    return () => { vivo = false; };
  }, [listo, usuario]);
  // Después, cada cambio se sube un segundo más tarde (solo lo que cambió).
  useEffect(() => {
    if (!usuario || !ultimo.current) return;
    const ahora = parteSincronizable(g);
    if (JSON.stringify(ahora) === JSON.stringify(ultimo.current)) return;
    const id = setTimeout(() => {
      const antes = ultimo.current;
      setSincro('subiendo');
      subir(antes, ahora, usuario.id)
        .then(() => { ultimo.current = ahora; setSincro('listo'); })
        .catch(() => setSincro('error'));
    }, 1000);
    return () => clearTimeout(id);
  }, [g, usuario]);

  const cambiar = useCallback((p: Partial<Guardado>) => setG((x) => ({ ...x, ...p })), []);
  const alternar = (lista: string[], v: string) => (lista.includes(v) ? lista.filter((x) => x !== v) : [v, ...lista]);

  const recetas = useMemo(() => (catalogo?.recetas ?? []).map((r) => enIdioma(r, g.idioma)), [catalogo, g.idioma]);
  // El aviso diario se vuelve a programar al abrir la app y cada vez que cambia el catálogo, el idioma o el interruptor.
  useEffect(() => {
    if (listo && g.edad === 'si' && catalogo) programarAvisos(recetas, g.idioma, g.aviso).catch(() => {});
  }, [listo, g.edad, g.aviso, g.idioma, catalogo, recetas]);
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
    usuario,
    sincro,
  };
  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useEstado() {
  const c = useContext(Contexto);
  if (!c) throw new Error('useEstado fuera de EstadoProvider');
  return c;
}
