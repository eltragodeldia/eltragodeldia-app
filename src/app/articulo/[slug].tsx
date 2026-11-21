import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useMemo } from 'react';
import { Pressable, ScrollView, Share, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Cabecera } from '../../components/Cabecera';
import { Markdown } from '../../components/Markdown';
import { FilaReceta } from '../../components/TarjetaReceta';
import { Boton, BotonIcono, Etiqueta, Texto, Titular } from '../../components/ui';
import { recetasDeArticulo } from '../../lib/compartido/relacionados';
import { articuloEnIdioma } from '../../lib/datos';
import { useEstado } from '../../lib/estado';
import { minutosDeLectura, portada } from '../../lib/portada';
import { valor } from '../../lib/textos';
import { color, SITIO } from '../../lib/tema';

export default function ArticuloFicha() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { t, idioma, catalogo, recetas } = useEstado();
  const l = t.leer;
  const en = idioma === 'en';
  const todos = useMemo(() => (catalogo?.articulos ?? []).filter((a) => !en || a.titulo_en).map((a) => articuloEnIdioma(a, idioma)), [catalogo, idioma, en]);
  const a = todos.find((x) => x.slug === slug) ?? (catalogo?.articulos ?? []).find((x) => x.slug === slug);
  const url = `${SITIO}${en ? '/en/articles/' : '/articulos/'}${slug}`;
  const relacionadas = useMemo(() => (a ? recetasDeArticulo(a, recetas) : []), [a, recetas]);
  const otros = todos.filter((x) => x.slug !== slug).slice(0, 3);

  if (!a) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: color.crema }}>
        <Cabecera volver={t.receta.volver} atras="/articulos" />
        <View style={{ padding: 20, gap: 16 }}>
          <Texto>{l.sinTexto}</Texto>
          <Boton variante="wasabi" onPress={() => WebBrowser.openBrowserAsync(url)}>{l.web}</Boton>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: color.crema }}>
      <Cabecera volver={t.receta.volver} atras="/articulos"
        derecha={<BotonIcono nombre="compartir" etiqueta={t.receta.compartir} onPress={() => Share.share({ message: `${a.titulo} · ${url}`, url })} />} />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={{ paddingHorizontal: 20, gap: 12 }}>
          {a.categoria ? <Etiqueta>{a.categoria}</Etiqueta> : null}
          <Titular tam={30}>{a.titulo}</Titular>
          {a.resumen ? <Texto tam={17} peso="bold" tono={color.gris}>{a.resumen}</Texto> : null}
          {a.contenido ? <Texto tam={13} peso="extra" tono={color.gris}>{l.minutos(minutosDeLectura(a.contenido))}</Texto> : null}
        </View>
        <Image source={{ uri: portada(a) }} style={{ width: '100%', aspectRatio: 16 / 9, marginVertical: 18, backgroundColor: a.foto_url ? color.beige : 'transparent' }} contentFit={a.foto_url ? 'cover' : 'contain'} accessibilityIgnoresInvertColors />
        <View style={{ paddingHorizontal: 20, gap: 24 }}>
          {a.contenido ? <Markdown texto={a.contenido} /> : (
            <View style={{ gap: 12 }}>
              <Texto>{l.sinTexto}</Texto>
              <Boton variante="wasabi" onPress={() => WebBrowser.openBrowserAsync(url)}>{l.web}</Boton>
            </View>
          )}
          {relacionadas.length ? (
            <View style={{ gap: 10 }}>
              <Titular tam={20}>{l.recetas}</Titular>
              {relacionadas.map((r) => <FilaReceta key={r.slug} r={r} nota={valor(r.destilado, idioma)} />)}
            </View>
          ) : null}
          {otros.length ? (
            <View style={{ gap: 10 }}>
              <Titular tam={20}>{l.sigue}</Titular>
              {otros.map((o) => (
                <Pressable key={o.slug} onPress={() => router.push({ pathname: '/articulo/[slug]', params: { slug: o.slug } })} accessibilityRole="link"
                  style={{ flexDirection: 'row', gap: 12, alignItems: 'center', backgroundColor: color.beige, borderRadius: 18, padding: 10 }}>
                  <Image source={{ uri: portada(o) }} style={{ width: 64, height: 64, borderRadius: 12 }} contentFit={o.foto_url ? 'cover' : 'contain'} accessibilityIgnoresInvertColors />
                  <View style={{ flex: 1, gap: 2 }}>
                    {o.categoria ? <Etiqueta>{o.categoria}</Etiqueta> : null}
                    <Texto tam={15} peso="black" lineas={2}>{o.titulo}</Texto>
                  </View>
                </Pressable>
              ))}
            </View>
          ) : null}
          <Texto tam={12} tono={color.gris} estilo={{ textAlign: 'center' }}>{t.hoy.responsable}</Texto>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
