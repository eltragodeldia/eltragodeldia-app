// Aviso diario del trago del día: notificaciones locales, programadas en el teléfono
// para los próximos 14 días a las 5:00 p. m. Se vuelven a programar cada vez que se
// abre la app, así la ventana siempre va adelante y sigue al catálogo nuevo.
// No usa servidor ni guarda nada fuera del teléfono.
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import type { Receta } from './compartido/tipos';
import type { Idioma } from './compartido/idioma';
import { tragoDelDia } from './datos';

export const HORA_AVISO = 17;
const DIAS = 14;
const disponible = Platform.OS !== 'web';

if (disponible) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: false, shouldSetBadge: false }),
  });
}

export type Permiso = 'si' | 'no' | 'sin-preguntar';

export async function permiso(): Promise<Permiso> {
  if (!disponible) return 'no';
  const p = await Notifications.getPermissionsAsync();
  if (p.granted || p.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL) return 'si';
  return p.canAskAgain && p.status === 'undetermined' ? 'sin-preguntar' : 'no';
}

/** Pide permiso (solo si nunca se ha preguntado). Devuelve si quedó con permiso. */
export async function pedirPermiso(): Promise<boolean> {
  if (!disponible) return false;
  const ahora = await permiso();
  if (ahora === 'si') return true;
  if (ahora === 'no') return false;
  const r = await Notifications.requestPermissionsAsync({ ios: { allowAlert: true, allowSound: true, allowBadge: false } });
  return r.granted;
}

const TEXTO = {
  es: { titulo: (n: string) => `El trago de hoy: ${n}`, cierre: 'Toca para prepararlo.' },
  en: { titulo: (n: string) => `Today's drink: ${n}`, cierre: 'Tap to make it.' },
};

/** Borra lo programado y, si el aviso está activo y hay permiso, programa los próximos días. */
export async function programarAvisos(recetas: Receta[], idioma: Idioma, activo: boolean) {
  if (!disponible) return;
  await Notifications.cancelAllScheduledNotificationsAsync();
  if (!activo || !recetas.length || (await permiso()) !== 'si') return;
  const ahora = new Date();
  const tx = TEXTO[idioma];
  for (let i = 0; i < DIAS; i++) {
    const fecha = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate() + i, HORA_AVISO, 0, 0);
    if (fecha <= ahora) continue;
    const r = tragoDelDia(recetas, fecha);
    if (!r) continue;
    await Notifications.scheduleNotificationAsync({
      content: { title: tx.titulo(r.nombre), body: [r.resumen, tx.cierre].filter(Boolean).join(' '), data: { slug: r.slug } },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: fecha },
    });
  }
}

/** Slug de la receta de un aviso tocado. */
export const slugDeAviso = (r: Notifications.NotificationResponse | null | undefined) => {
  const s = r?.notification.request.content.data?.slug;
  return typeof s === 'string' ? s : null;
};
