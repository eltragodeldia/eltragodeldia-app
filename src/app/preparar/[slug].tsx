import { useKeepAwake } from 'expo-keep-awake';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Boton, BotonIcono, Texto } from '../../components/ui';
import { useEstado } from '../../lib/estado';
import { color, letra } from '../../lib/tema';

// Segundos del temporizador según lo que pide el paso (agitar, revolver). Sin tiempo claro, no hay temporizador.
function segundosDe(paso: string): number | null {
  const p = paso.toLowerCase();
  const m = p.match(/(\d+)\s*(segundos|seconds|s\b)/);
  const palabras: Record<string, number> = { cinco: 5, ocho: 8, diez: 10, doce: 12, quince: 15, veinte: 20, veinticinco: 25, treinta: 30, cuarenta: 40, five: 5, eight: 8, ten: 10, twelve: 12, fifteen: 15, twenty: 20, 'twenty-five': 25, thirty: 30, forty: 40 };
  const w = Object.keys(palabras).find((k) => new RegExp(`(^|[^a-z])${k}\\s+(segundos|seconds)`).test(p));
  if (m) return Number(m[1]);
  if (w) return palabras[w];
  if (/agita|shake/.test(p)) return 15;
  if (/revuelv|revolv|stir/.test(p)) return 30;
  return null;
}

export default function Preparar() {
  useKeepAwake();
  const { slug, p } = useLocalSearchParams<{ slug: string; p?: string }>();
  const { t, receta } = useEstado();
  const r = receta(String(slug));
  const [paso, setPaso] = useState(0);
  const total = r?.pasos.length ?? 0;
  const seg = useMemo(() => (r ? segundosDe(r.pasos[paso] ?? '') : null), [r, paso]);
  const [quedan, setQuedan] = useState<number | null>(null);
  const [corriendo, setCorriendo] = useState(false);

  useEffect(() => { setQuedan(seg); setCorriendo(false); }, [seg, paso]);
  useEffect(() => {
    if (!corriendo || quedan == null) return;
    if (quedan <= 0) { setCorriendo(false); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {}); return; }
    const id = setTimeout(() => setQuedan((q) => (q == null ? q : q - 1)), 1000);
    return () => clearTimeout(id);
  }, [corriendo, quedan]);

  if (!r) return null;
  const salir = () => (router.canGoBack() ? router.back() : router.replace('/'));
  const ultimo = paso === total - 1;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: color.cassis }}>
      <View style={{ paddingHorizontal: 20, paddingTop: 8, gap: 14 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Texto tam={13} peso="extra" tono={color.beige}>{r.nombre}{p && p !== '1' ? ` · ${p}` : ''}</Texto>
          <BotonIcono nombre="cerrar" claro etiqueta={t.preparar.salir} onPress={salir} />
        </View>
        <View style={{ flexDirection: 'row', gap: 6 }} accessibilityLabel={t.preparar.paso(paso + 1, total)}>
          {r.pasos.map((_, k) => <View key={k} style={{ flex: 1, height: 6, borderRadius: 3, backgroundColor: k <= paso ? color.wasabi : color.gris }} />)}
        </View>
      </View>
      <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 28, gap: 22 }}>
        <Texto tam={13} peso="black" tono={color.wasabi} estilo={{ letterSpacing: 2, textTransform: 'uppercase' }}>{t.preparar.paso(paso + 1, total)}</Texto>
        <Texto tam={25} tono={color.crema} estilo={{ fontFamily: letra.textoBlack, lineHeight: 33 }}>{r.pasos[paso]}</Texto>
        {seg != null ? (
          <View style={{ alignItems: 'center', gap: 16, marginTop: 8 }}>
            <View accessibilityRole="timer" accessibilityLabel={`${quedan} ${t.preparar.segundos}`} style={{ width: 190, height: 190, borderRadius: 95, borderWidth: 10, borderColor: quedan === 0 ? color.wasabi : color.gris, alignItems: 'center', justifyContent: 'center' }}>
              <Texto tono={color.crema} estilo={{ fontFamily: letra.titular, fontSize: 54, lineHeight: 60 }}>{String(quedan ?? seg).padStart(2, '0')}</Texto>
              <Texto tam={13} peso="extra" tono={color.beige}>{t.preparar.segundos}</Texto>
            </View>
            <Boton variante="wasabi" onPress={() => { if (quedan === 0) setQuedan(seg); setCorriendo((c) => !c); }}>
              {corriendo ? t.preparar.pausar : quedan !== seg && quedan !== 0 ? t.preparar.seguir : t.preparar.agitar}
            </Boton>
            <Texto tam={13} tono={color.beige} estilo={{ textAlign: 'center' }}>{t.preparar.nota}</Texto>
          </View>
        ) : null}
        {ultimo ? <Texto tam={17} peso="black" tono={color.wasabi}>{t.preparar.fin}</Texto> : null}
      </View>
      <View style={{ flexDirection: 'row', gap: 12, padding: 20 }}>
        <Boton variante="bordeClaro" estilo={{ flex: 1 }} alto={54} onPress={() => setPaso((x) => Math.max(0, x - 1))}>{t.preparar.anterior}</Boton>
        <Boton variante="crema" estilo={{ flex: 1 }} alto={54} onPress={() => (ultimo ? salir() : setPaso((x) => x + 1))}>{ultimo ? t.preparar.listo : t.preparar.siguiente}</Boton>
      </View>
    </SafeAreaView>
  );
}
