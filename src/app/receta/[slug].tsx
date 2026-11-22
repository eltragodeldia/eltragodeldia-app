import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Share, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Boton, BotonIcono, Etiqueta, Ilustracion, Texto, Titular } from '../../components/ui';
import { VideoReceta } from '../../components/VideoReceta';
import { cantidadTexto } from '../../lib/compartido/medidas';
import { useEstado } from '../../lib/estado';
import { valor } from '../../lib/textos';
import { color, SITIO } from '../../lib/tema';

export default function Receta() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { t, idioma, unidad, cambiar, receta, favoritos, alternarFavorito, lista, agregarALista } = useEstado();
  const r = receta(String(slug));
  const [porciones, setPorciones] = useState(1);
  if (!r) return <SafeAreaView style={{ flex: 1, backgroundColor: color.crema, padding: 20 }}><Texto>{t.recetas.ninguna}</Texto></SafeAreaView>;
  const guardada = favoritos.includes(r.slug);
  const enLista = lista.some((x) => x.s === r.slug);
  const url = `${SITIO}${idioma === 'en' ? '/en/recipes/' : '/recetas/'}${r.slug}`;
  const dato = (e: string, v: string | null) => v ? (
    <View style={{ flex: 1, backgroundColor: color.blanco, borderColor: color.beige, borderWidth: 1, borderRadius: 16, padding: 10 }}>
      <Etiqueta>{e}</Etiqueta><Texto peso="black">{v}</Texto>
    </View>) : null;

  return (
    <SafeAreaView edges={['bottom']} style={{ flex: 1, backgroundColor: color.crema }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <SafeAreaView edges={['top']} style={{ backgroundColor: color.beige, borderBottomLeftRadius: 32, borderBottomRightRadius: 32, paddingHorizontal: 20, paddingTop: 8 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <BotonIcono nombre="atras" etiqueta={t.receta.volver} onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <BotonIcono nombre="compartir" etiqueta={t.receta.compartir} onPress={() => Share.share({ message: `${r.nombre} · ${url}`, url })} />
              <BotonIcono nombre="corazon" etiqueta={guardada ? t.receta.guardada : t.receta.guardar} activo={guardada} onPress={() => alternarFavorito(r.slug)} />
            </View>
          </View>
          <Ilustracion slug={r.slug} ancho={170} alto={220} estilo={{ alignSelf: 'center' }} />
        </SafeAreaView>
        <View style={{ padding: 20, gap: 14 }}>
          <View style={{ alignSelf: 'flex-start', backgroundColor: color.azul, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 4 }}>
            <Texto tam={11} peso="black" tono={color.crema} estilo={{ letterSpacing: 1.6, textTransform: 'uppercase' }}>{valor(r.destilado, idioma)}</Texto>
          </View>
          <Titular tam={32}>{r.nombre}</Titular>
          <View style={{ width: 72, height: 8, backgroundColor: color.wasabi, borderRadius: 4 }} />
          {r.resumen ? <Texto tam={16}>{r.resumen}</Texto> : null}
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {dato(t.receta.tiempo, r.tiempo_min ? `${r.tiempo_min} ${t.receta.min}` : null)}{dato(t.receta.vaso, r.vaso)}{dato(t.receta.tecnica, r.tecnica)}
          </View>
          {r.video_url ? <VideoReceta url={r.video_url} nombre={r.nombre} /> : null}

          <View style={{ gap: 10, marginTop: 6 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Titular tam={18}>{t.receta.ingredientes}</Titular>
              <View style={{ flexDirection: 'row', gap: 4 }}>
                {(['oz', 'ml'] as const).map((u) => (
                  <Pressable key={u} onPress={() => cambiar({ unidad: u })} accessibilityRole="radio" accessibilityState={{ selected: unidad === u }} style={{ paddingHorizontal: 10, minHeight: 36, justifyContent: 'center', borderRadius: 999, backgroundColor: unidad === u ? color.cassis : 'transparent' }}>
                    <Texto tam={13} peso="black" tono={unidad === u ? color.crema : color.cassis}>{u}</Texto>
                  </Pressable>
                ))}
              </View>
            </View>
            <View accessibilityLabel={t.receta.porciones} style={{ flexDirection: 'row', gap: 8 }}>
              {[1, 2, 4, 8].map((n) => (
                <Pressable key={n} onPress={() => setPorciones(n)} accessibilityRole="radio" accessibilityState={{ selected: porciones === n }}
                  style={{ flex: 1, minHeight: 44, borderRadius: 999, borderWidth: 2, borderColor: color.cassis, alignItems: 'center', justifyContent: 'center', backgroundColor: porciones === n ? color.cassis : 'transparent' }}>
                  <Texto peso="black" tono={porciones === n ? color.crema : color.cassis}>{n}</Texto>
                </Pressable>
              ))}
            </View>
            {r.ingredientes.map((i, k) => (
              <View key={k} style={{ flexDirection: 'row', gap: 14, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: color.beige }}>
                <Texto peso="black" estilo={{ minWidth: 64 }}>{cantidadTexto({ ...i, cantidad: i.cantidad == null ? null : i.cantidad * porciones }, unidad, idioma)}</Texto>
                <Texto estilo={{ flex: 1 }}>{i.ingrediente}</Texto>
              </View>
            ))}
            <Boton variante={enLista ? 'cassis' : 'borde'} onPress={() => agregarALista(r.slug, porciones)}>{enLista ? t.receta.enLista : t.receta.lista}</Boton>
          </View>

          <View style={{ gap: 12, marginTop: 6 }}>
            <Titular tam={18}>{t.receta.pasos}</Titular>
            {r.pasos.map((p, k) => (
              <View key={k} style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: color.cassis, alignItems: 'center', justifyContent: 'center' }}><Texto tam={13} peso="black" tono={color.wasabi}>{k + 1}</Texto></View>
                <Texto estilo={{ flex: 1 }}>{p}</Texto>
              </View>
            ))}
          </View>
          {r.error_comun ? (
            <View style={{ backgroundColor: color.cassis, borderRadius: 20, padding: 16, gap: 6 }}>
              <Etiqueta tono={color.wasabi}>{t.receta.error}</Etiqueta>
              <Texto tono={color.crema}>{r.error_comun}</Texto>
            </View>
          ) : null}
        </View>
      </ScrollView>
      <View style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8, borderTopWidth: 1, borderTopColor: color.beige, backgroundColor: color.crema }}>
        <Boton variante="wasabi" alto={54} href={{ pathname: '/preparar/[slug]', params: { slug: r.slug, p: String(porciones) } }}>{t.receta.preparar}</Boton>
      </View>
    </SafeAreaView>
  );
}
