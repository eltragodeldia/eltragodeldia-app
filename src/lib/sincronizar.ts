// Cuentas de la app: entrar con un código que llega al correo (sin contraseña) y
// sincronizar favoritas, Mi bar, lista de compra y ajustes con las tablas app_* (db/016 del sitio).
// La seguridad por filas deja a cada persona ver y cambiar solo lo suyo.
// Lo del teléfono nunca se pierde: al entrar se junta con lo de la cuenta.
import type { Idioma } from './compartido/idioma';
import { supabase } from './supabase';

export interface Sincronizable { favoritos: string[]; mibar: string[]; lista: { s: string; p: number }[]; idioma: Idioma; unidad: 'oz' | 'ml' }

const base = () => {
  if (!supabase) throw new Error('sin-base');
  return supabase;
};

export async function enviarCodigo(correo: string) {
  const { error } = await base().auth.signInWithOtp({ email: correo.trim().toLowerCase(), options: { shouldCreateUser: true } });
  if (error) throw error;
}

export async function verificarCodigo(correo: string, codigo: string) {
  const { error } = await base().auth.verifyOtp({ email: correo.trim().toLowerCase(), token: codigo.replace(/\D/g, ''), type: 'email' });
  if (error) throw error;
}

export async function salir() {
  await base().auth.signOut();
}

/** Borra la cuenta y todo lo guardado en ella (en cascada). Lo del teléfono se queda. */
export async function borrarCuenta() {
  const { error } = await base().rpc('borrar_mi_cuenta');
  if (error) throw error;
  await base().auth.signOut({ scope: 'local' });
}

const unir = (a: string[], b: string[]) => [...new Set([...a, ...b])];

/** Al entrar o al abrir la app con sesión: junta lo del teléfono con lo de la cuenta y deja los dos iguales. */
export async function fusionar(local: Sincronizable, uid: string): Promise<Sincronizable> {
  const sb = base();
  const [fav, bar, lis, aj] = await Promise.all([
    sb.from('app_favoritos').select('slug').order('creado_en', { ascending: false }),
    sb.from('app_mibar').select('clave'),
    sb.from('app_lista').select('datos').maybeSingle(),
    sb.from('app_ajustes').select('idioma,unidad').maybeSingle(),
  ]);
  for (const r of [fav, bar, lis, aj]) if (r.error) throw r.error;
  const remotaLista = (Array.isArray(lis.data?.datos) ? lis.data!.datos : []) as Sincronizable['lista'];
  const vistos = new Set(local.lista.map((x) => x.s));
  const junto: Sincronizable = {
    favoritos: unir(local.favoritos, (fav.data ?? []).map((x) => x.slug)),
    mibar: unir(local.mibar, (bar.data ?? []).map((x) => x.clave)),
    lista: [...local.lista, ...remotaLista.filter((x) => x && typeof x.s === 'string' && !vistos.has(x.s))],
    // Si la cuenta ya tenía ajustes, mandan los de la cuenta; si no, se suben los del teléfono.
    idioma: (aj.data?.idioma as Idioma) ?? local.idioma,
    unidad: (aj.data?.unidad as 'oz' | 'ml') ?? local.unidad,
  };
  // Solo se sube lo que la cuenta no tenía.
  const remoto: Sincronizable = {
    favoritos: (fav.data ?? []).map((x) => x.slug),
    mibar: (bar.data ?? []).map((x) => x.clave),
    lista: lis.data ? remotaLista : (null as unknown as Sincronizable['lista']),
    idioma: (aj.data?.idioma as Idioma) ?? ('' as Idioma),
    unidad: (aj.data?.unidad as 'oz' | 'ml') ?? ('' as 'oz'),
  };
  await subir(remoto, junto, uid);
  return junto;
}

/** Sube solo lo que cambió desde la última vez (antes = null sube todo). */
export async function subir(antes: Sincronizable | null, ahora: Sincronizable, uid: string) {
  const sb = base();
  const tareas: PromiseLike<{ error: unknown }>[] = [];
  const cambios = (a: string[] | undefined, b: string[]) => ({ nuevos: b.filter((x) => !a?.includes(x)), fuera: (a ?? []).filter((x) => !b.includes(x)) });

  const f = cambios(antes?.favoritos, ahora.favoritos);
  if (f.nuevos.length) tareas.push(sb.from('app_favoritos').upsert(f.nuevos.map((slug) => ({ user_id: uid, slug })), { ignoreDuplicates: true }));
  if (f.fuera.length) tareas.push(sb.from('app_favoritos').delete().eq('user_id', uid).in('slug', f.fuera));

  const m = cambios(antes?.mibar, ahora.mibar);
  if (m.nuevos.length) tareas.push(sb.from('app_mibar').upsert(m.nuevos.map((clave) => ({ user_id: uid, clave })), { ignoreDuplicates: true }));
  if (m.fuera.length) tareas.push(sb.from('app_mibar').delete().eq('user_id', uid).in('clave', m.fuera));

  if (!antes || JSON.stringify(antes.lista) !== JSON.stringify(ahora.lista)) {
    tareas.push(sb.from('app_lista').upsert({ user_id: uid, datos: ahora.lista, actualizado_en: new Date().toISOString() }));
  }
  if (!antes || antes.idioma !== ahora.idioma || antes.unidad !== ahora.unidad) {
    let zona: string | null = null;
    try { zona = Intl.DateTimeFormat().resolvedOptions().timeZone ?? null; } catch { /* sin zona */ }
    tareas.push(sb.from('app_ajustes').upsert({ user_id: uid, idioma: ahora.idioma, unidad: ahora.unidad, zona_horaria: zona, actualizado_en: new Date().toISOString() }));
  }
  const res = await Promise.all(tareas);
  const err = res.find((r) => r.error)?.error;
  if (err) throw err;
}
