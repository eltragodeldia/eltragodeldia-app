import { router } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Cabecera } from '../../components/Cabecera';
import { Ilustracion, Texto, Titular } from '../../components/ui';
import { COLECCIONES, MINIMO, recetasDe } from '../../lib/compartido/colecciones';
import { useEstado } from '../../lib/estado';
import { color } from '../../lib/tema';

const FONDOS = [color.cassis, color.azul, color.verde];

export default function Colecciones() {
  const { t, idioma, recetas } = useEstado();
  const c = t.colec;
  const lista = useMemo(() => COLECCIONES.map((col) => ({ col, rs: recetasDe(col, recetas) })).filter((x) => x.rs.length >= MINIMO), [recetas]);
  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: color.crema }}>
      <Cabecera volver={t.receta.volver} />
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 4, gap: 14, paddingBottom: 40 }}>
        <Titular tam={34}>{c.titulo}</Titular>
        <Texto tam={16} tono={color.gris}>{c.lead}</Texto>
        <View style={{ width: 72, height: 8, backgroundColor: color.wasabi, borderRadius: 4, marginBottom: 4 }} />
        {lista.map(({ col, rs }, i) => (
          <Pressable key={col.slug} onPress={() => router.push({ pathname: '/coleccion/[slug]', params: { slug: col.slug } })} accessibilityRole="link"
            style={{ backgroundColor: FONDOS[i % FONDOS.length], borderRadius: 22, padding: 16, gap: 10 }}>
            <View style={{ flexDirection: 'row', gap: 4 }}>
              {rs.slice(0, 4).map((r) => <View key={r.slug} style={{ flex: 1, backgroundColor: color.crema, borderRadius: 14, paddingVertical: 6 }}><Ilustracion slug={r.slug} ancho={'100%' as unknown as number} alto={64} /></View>)}
            </View>
            <Titular tam={20} claro>{col.titulo[idioma]}</Titular>
            <Texto tam={13} tono={color.crema} lineas={2}>{col.intro[idioma]}</Texto>
            <Texto tam={12} peso="black" tono={color.wasabi} estilo={{ letterSpacing: 1.6, textTransform: 'uppercase' }}>{c.recetas(rs.length)}</Texto>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
