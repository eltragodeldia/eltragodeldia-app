import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Cabecera } from '../../components/Cabecera';
import { Etiqueta, Texto, Titular } from '../../components/ui';
import { articuloEnIdioma } from '../../lib/datos';
import { useEstado } from '../../lib/estado';
import { portada } from '../../lib/portada';
import { color } from '../../lib/tema';

export default function Articulos() {
  const { t, idioma, catalogo } = useEstado();
  const l = t.leer;
  const lista = useMemo(() => (catalogo?.articulos ?? []).filter((a) => idioma === 'es' || a.titulo_en).map((a) => articuloEnIdioma(a, idioma)), [catalogo, idioma]);
  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: color.crema }}>
      <Cabecera volver={t.receta.volver} />
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 4, gap: 14, paddingBottom: 40 }}>
        <Titular tam={34}>{l.titulo}</Titular>
        <Texto tam={16} tono={color.gris}>{l.lead}</Texto>
        <View style={{ width: 72, height: 8, backgroundColor: color.wasabi, borderRadius: 4, marginBottom: 4 }} />
        {lista.map((a) => (
          <Pressable key={a.slug} onPress={() => router.push({ pathname: '/articulo/[slug]', params: { slug: a.slug } })} accessibilityRole="link"
            style={{ backgroundColor: color.beige, borderRadius: 22, overflow: 'hidden' }}>
            <Image source={{ uri: portada(a) }} style={{ width: '100%', aspectRatio: 16 / 9, backgroundColor: color.beige }} contentFit={a.foto_url ? 'cover' : 'contain'} accessibilityIgnoresInvertColors />
            <View style={{ padding: 16, gap: 6 }}>
              {a.categoria ? <Etiqueta>{a.categoria}</Etiqueta> : null}
              <Texto tam={19} peso="black">{a.titulo}</Texto>
              {a.resumen ? <Texto tam={14} tono={color.gris} lineas={3}>{a.resumen}</Texto> : null}
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
