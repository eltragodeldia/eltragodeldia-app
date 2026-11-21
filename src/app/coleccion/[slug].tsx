import { useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, Share, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Cabecera } from '../../components/Cabecera';
import { FilaReceta } from '../../components/TarjetaReceta';
import { BotonIcono, Texto, Titular } from '../../components/ui';
import { COLECCIONES, recetasDe } from '../../lib/compartido/colecciones';
import { useEstado } from '../../lib/estado';
import { valor } from '../../lib/textos';
import { color, SITIO } from '../../lib/tema';

export default function ColeccionFicha() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { t, idioma, recetas } = useEstado();
  const col = COLECCIONES.find((x) => x.slug === slug);
  const rs = useMemo(() => (col ? recetasDe(col, recetas) : []), [col, recetas]);
  const url = `${SITIO}${idioma === 'en' ? '/en/collections/' : '/colecciones/'}${slug}`;
  if (!col) return <SafeAreaView style={{ flex: 1, backgroundColor: color.crema }}><Cabecera volver={t.receta.volver} atras="/colecciones" /></SafeAreaView>;
  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: color.crema }}>
      <Cabecera volver={t.receta.volver} atras="/colecciones"
        derecha={<BotonIcono nombre="compartir" etiqueta={t.receta.compartir} onPress={() => Share.share({ message: `${col.titulo[idioma]} · ${url}`, url })} />} />
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 4, gap: 12, paddingBottom: 40 }}>
        <Titular tam={30}>{col.titulo[idioma]}</Titular>
        <Texto tam={16} tono={color.gris}>{col.intro[idioma]}</Texto>
        <View style={{ width: 72, height: 8, backgroundColor: color.wasabi, borderRadius: 4, marginBottom: 6 }} />
        {rs.map((r, i) => (
          <FilaReceta key={r.slug} r={r} nota={[valor(r.destilado, idioma), r.tiempo_min ? `${r.tiempo_min} ${t.receta.min}` : null].filter(Boolean).join(' · ')}
            derecha={<Texto tam={13} peso="black" tono={color.gris} estilo={{ paddingRight: 6 }}>{i + 1}</Texto>} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
