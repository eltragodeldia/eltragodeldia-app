import { useKeepAwake } from 'expo-keep-awake';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Boton, BotonIcono, Ilustracion, Texto } from '../../components/ui';
import { cantidadTexto } from '../../lib/compartido/medidas';
import type { Ingrediente } from '../../lib/compartido/tipos';
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

// Palabras que no dicen qué ingrediente es ("jugo de limón fresco" se reconoce por "limón").
const VACIAS = new Set(['jugo', 'zumo', 'fresco', 'fresca', 'frescos', 'frescas', 'para', 'con', 'del', 'las', 'los', 'una', 'unas', 'unos', 'juice', 'fresh', 'with', 'the', 'for', 'and', 'decorar', 'garnish', 'opcional', 'optional', 'hielo', 'ice',
  'cucharadita', 'cucharaditas', 'cucharada', 'cucharadas', 'pequena', 'pequenas', 'pequeno', 'pequenos', 'grande', 'grandes', 'gota', 'gotas',
  'dash', 'dashes', 'hoja', 'hojas', 'rodaja', 'rodajas', 'ramita', 'ramitas', 'trozo', 'trozos', 'pizca', 'recien', 'exprimido', 'exprimida',
  'teaspoon', 'teaspoons', 'tablespoon', 'tablespoons', 'small', 'large', 'drop', 'drops', 'leaf', 'leaves', 'slice', 'slices', 'sprig', 'pinch', 'squeezed', 'dry']);
// Lo que el paso nombra en general y la receta por su tipo: "el whiskey" es el bourbon, "los bitters" son la Angostura.
const PARIENTES: Record<string, string[]> = {
  whisk: ['bourbon', 'centeno', 'scotch', 'escoces'], bourb: ['whisky'],
  bitte: ['angostura', 'peychaud', 'amargo'], amarg: ['angostura', 'peychaud', 'bitter'],
};
const sinAcentos = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const clavesDe = (nombre: string) => sinAcentos(nombre).split(/[^a-z0-9ñ]+/).filter((w) => w.length >= 3 && !VACIAS.has(w));

/**
 * Los ingredientes que el paso menciona, en el orden de la receta. Cuenta la palabra principal del ingrediente
 * ("bitter de naranja" es bitter, no naranja). En un paso de decorar no salen los jugos: "rodaja de limón" no es 1 oz de jugo.
 */
function ingredientesDelPaso(paso: string, ingredientes: Ingrediente[]): Ingrediente[] {
  const palabras = sinAcentos(paso).split(/[^a-z0-9ñ]+/).filter(Boolean)
    .flatMap((w) => [w, ...(PARIENTES[w.slice(0, 5)] ?? [])]);
  // Una palabra del paso cuenta si empieza igual que la clave en sus 5 primeras letras (curaçao y curacao,
  // limón y limones). Lima y limón no se confunden: "lima" y "limo" son distintas.
  const esta = (clave: string) => { const k = Math.min(5, clave.length); return palabras.some((w) => w.length >= k && w.slice(0, k) === clave.slice(0, k)); };
  const decorar = /decora|adorna|garnish/.test(sinAcentos(paso));
  return ingredientes.filter((i) => {
    const principal = clavesDe(i.ingrediente)[0];
    if (!principal || !esta(principal)) return false;
    return !(decorar && /\b(jugo|zumo|juice)\b/.test(sinAcentos(i.ingrediente)));
  });
}

export default function Preparar() {
  useKeepAwake();
  const { slug, p } = useLocalSearchParams<{ slug: string; p?: string }>();
  const { t, receta, unidad, idioma } = useEstado();
  const porciones = Math.max(1, Number(p) || 1);
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

  const usados = useMemo(() => (r ? ingredientesDelPaso(r.pasos[paso] ?? '', r.ingredientes) : []), [r, paso]);

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
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingTop: 28, paddingBottom: 12, gap: 22 }}>
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
        {usados.length > 0 ? (
          <View style={{ backgroundColor: 'rgba(253,246,236,0.08)', borderRadius: 20, padding: 18, gap: 4 }}>
            <Texto tam={12} peso="black" tono={color.beige} estilo={{ letterSpacing: 1.6, textTransform: 'uppercase', marginBottom: 6 }}>{t.preparar.enEstePaso}</Texto>
            {usados.map((i, k) => (
              <View key={k} style={{ flexDirection: 'row', gap: 14, paddingVertical: 8, borderTopWidth: k ? 1 : 0, borderTopColor: 'rgba(253,246,236,0.12)' }}>
                <Texto peso="black" tono={color.wasabi} estilo={{ minWidth: 72 }}>{cantidadTexto({ ...i, cantidad: i.cantidad == null ? null : i.cantidad * porciones }, unidad, idioma)}</Texto>
                <Texto tono={color.crema} estilo={{ flex: 1 }}>{i.ingrediente}</Texto>
              </View>
            ))}
          </View>
        ) : null}
        {seg == null ? (
          <View style={{ flex: 1, minHeight: usados.length ? 160 : 220, alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ backgroundColor: color.beige, borderRadius: 32, paddingVertical: 18, paddingHorizontal: 34 }}>
              <Ilustracion slug={r.slug} ancho={150} alto={195} />
            </View>
          </View>
        ) : null}
        {ultimo ? <Texto tam={17} peso="black" tono={color.wasabi}>{t.preparar.fin}</Texto> : null}
      </ScrollView>
      <View style={{ flexDirection: 'row', gap: 12, padding: 20 }}>
        <Boton variante="bordeClaro" estilo={{ flex: 1 }} alto={54} onPress={() => setPaso((x) => Math.max(0, x - 1))}>{t.preparar.anterior}</Boton>
        <Boton variante="crema" estilo={{ flex: 1 }} alto={54} onPress={() => (ultimo ? salir() : setPaso((x) => x + 1))}>{ultimo ? t.preparar.listo : t.preparar.siguiente}</Boton>
      </View>
    </SafeAreaView>
  );
}
