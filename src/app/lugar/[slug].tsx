import { router, useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { Pressable, ScrollView, Share, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mapa } from '../../components/Mapa';
import { Boton, BotonIcono, Etiqueta, Texto, Titular } from '../../components/ui';
import { useEstado } from '../../lib/estado';
import { COLOR_TIPO, comoLlegar } from '../../lib/lugares';
import { articulosDeLugar } from '../../lib/compartido/relacionados';
import { articuloEnIdioma } from '../../lib/datos';
import { valor } from '../../lib/textos';
import { color, SITIO } from '../../lib/tema';

export default function LugarFicha() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { t, idioma, lugares, catalogo } = useEstado();
  const m = t.mapa;
  const l = lugares.find((x) => x.slug === slug);
  if (!l) return <SafeAreaView style={{ flex: 1, backgroundColor: color.crema, padding: 20 }}><Texto>{m.ninguno}</Texto></SafeAreaView>;
  const mencionan = articulosDeLugar(l.nombre, (catalogo?.articulos ?? []).filter((a) => idioma === 'es' || a.titulo_en).map((a) => articuloEnIdioma(a, idioma)));
  const url = `${SITIO}${idioma === 'en' ? '/en/places/' : '/lugares/'}${l.slug}`;
  const bloque = (titulo: string, texto: string | null) => texto ? (
    <View style={{ gap: 4 }}><Etiqueta>{titulo}</Etiqueta><Texto tam={16}>{texto}</Texto></View>
  ) : null;

  return (
    <SafeAreaView edges={['bottom']} style={{ flex: 1, backgroundColor: color.crema }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <View>
          {l.lat != null ? <Mapa lugares={[l]} alto={260} interactivo={false} /> : <View style={{ height: 120, backgroundColor: color.beige }} />}
          <SafeAreaView edges={['top']} style={{ position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 8 }}>
            <View style={{ backgroundColor: color.crema, borderRadius: 22 }}><BotonIcono nombre="atras" etiqueta={m.volver} onPress={() => (router.canGoBack() ? router.back() : router.replace('/lugares'))} /></View>
            <View style={{ backgroundColor: color.crema, borderRadius: 22 }}><BotonIcono nombre="compartir" etiqueta={t.receta.compartir} onPress={() => Share.share({ message: `${l.nombre} · ${url}`, url })} /></View>
          </SafeAreaView>
        </View>
        <View style={{ padding: 20, gap: 16 }}>
          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
            <View style={{ backgroundColor: COLOR_TIPO[l.tipo] ?? color.cassis, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 4 }}>
              <Texto tam={11} peso="black" tono={color.crema} estilo={{ letterSpacing: 1.6, textTransform: 'uppercase' }}>{valor(l.tipo, idioma)}</Texto>
            </View>
            {l.precio ? <View style={{ backgroundColor: color.beige, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 4 }}><Texto tam={12} peso="black">{l.precio}</Texto></View> : null}
          </View>
          <Titular tam={30}>{l.nombre}</Titular>
          <Texto tam={14} peso="bold" tono={color.gris}>{[l.barrio, l.ciudad, l.pais].filter(Boolean).join(', ')}</Texto>
          <View style={{ width: 72, height: 8, backgroundColor: color.wasabi, borderRadius: 4 }} />
          {l.pedido ? (
            <View style={{ backgroundColor: color.cassis, borderRadius: 20, padding: 16, gap: 6 }}>
              <Etiqueta tono={color.wasabi}>{m.pedir}</Etiqueta>
              <Texto tam={16} tono={color.crema}>{l.pedido}</Texto>
            </View>
          ) : null}
          {bloque(m.porque, l.porque)}
          {bloque(m.ocasion, l.ocasion)}
          {(l.categorias ?? []).length ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {(l.categorias ?? []).map((c) => <View key={c} style={{ borderWidth: 2, borderColor: color.cassis, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 5 }}><Texto tam={13} peso="extra">{valor(c, idioma)}</Texto></View>)}
            </View>
          ) : null}
          {bloque(m.horario, l.horario)}
          {bloque(m.direccion, l.direccion)}
          <View style={{ gap: 10, marginTop: 4 }}>
            <Boton variante="wasabi" onPress={() => comoLlegar(l)}>{m.llegar}</Boton>
            {l.video_url ? <Boton variante="borde" onPress={() => WebBrowser.openBrowserAsync(l.video_url!)}>{m.video}</Boton> : null}
            {l.instagram_url ? <Boton variante="borde" onPress={() => WebBrowser.openBrowserAsync(l.instagram_url!)}>{m.instagram}</Boton> : null}
          </View>
          {mencionan.length ? (
            <View style={{ gap: 8, marginTop: 8 }}>
              <Etiqueta>{t.leer.titulo}</Etiqueta>
              {mencionan.map((a) => (
                <Pressable key={a.slug} onPress={() => router.push({ pathname: '/articulo/[slug]', params: { slug: a.slug } })} accessibilityRole="link"
                  style={{ backgroundColor: color.beige, borderRadius: 18, padding: 14 }}>
                  <Texto tam={15} peso="black">{a.titulo}</Texto>
                </Pressable>
              ))}
            </View>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
