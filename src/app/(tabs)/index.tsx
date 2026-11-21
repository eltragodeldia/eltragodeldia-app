import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BotonIcono, Boton, Ilustracion, Texto, Titular } from '../../components/ui';
import { necesitaDe } from '../../lib/compartido/mibar';
import { tragoDelDia } from '../../lib/datos';
import { useEstado } from '../../lib/estado';
import { valor } from '../../lib/textos';
import { color } from '../../lib/tema';

export default function Hoy() {
  const { t, idioma, recetas, catalogo, favoritos, alternarFavorito, mibar } = useEstado();
  const hoy = useMemo(() => tragoDelDia(recetas), [recetas]);
  const fecha = new Date().toLocaleDateString(idioma === 'en' ? 'en-US' : 'es', { weekday: 'long', day: 'numeric', month: 'long' });
  const puedes = useMemo(() => {
    if (!mibar.length) return [];
    const tengo = new Set(mibar);
    return recetas.filter((r) => { const n = necesitaDe(r); return n.b.length > 0 && [...n.b, ...n.i].every((k) => tengo.has(k)); }).slice(0, 3);
  }, [recetas, mibar]);

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: color.crema }}>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 18 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Image source={require('../../../assets/marca/logo-horizontal.png')} style={{ width: 150, height: 39 }} contentFit="contain" accessibilityLabel="El Trago del Día" />
        </View>
        <View style={{ gap: 4 }}>
          <Texto tam={12} peso="extra" tono={color.gris} estilo={{ letterSpacing: 2, textTransform: 'uppercase' }}>{fecha}</Texto>
          <Titular>{t.hoy.titulo}</Titular>
        </View>
        {catalogo?.origen === 'guardado' ? <Texto tam={13} tono={color.gris}>{t.sinConexion}</Texto> : null}
        {hoy ? (
          <View style={{ backgroundColor: color.cassis, borderRadius: 26, padding: 20, gap: 12 }}>
            <View style={{ flexDirection: 'row', gap: 14, alignItems: 'center' }}>
              <View style={{ backgroundColor: color.crema, borderRadius: 18, padding: 6 }}><Ilustracion slug={hoy.slug} ancho={92} alto={120} /></View>
              <View style={{ flex: 1, gap: 8 }}>
                <View style={{ alignSelf: 'flex-start', backgroundColor: color.wasabi, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 }}>
                  <Texto tam={11} peso="black" estilo={{ letterSpacing: 1.6, textTransform: 'uppercase' }}>{valor(hoy.destilado, idioma)}</Texto>
                </View>
                <Titular tam={22} claro>{hoy.nombre}</Titular>
                <Texto tam={13} tono={color.beige}>{[valor(hoy.dificultad, idioma), hoy.tiempo_min ? `${hoy.tiempo_min} ${t.receta.min}` : null, hoy.tecnica].filter(Boolean).join(' · ')}</Texto>
              </View>
            </View>
            {hoy.resumen ? <Texto tono={color.crema}>{hoy.resumen}</Texto> : null}
            <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
              <Boton variante="wasabi" href={`/receta/${hoy.slug}`} estilo={{ flex: 1 }}>{t.hoy.preparar}</Boton>
              <BotonIcono nombre="corazon" claro etiqueta={favoritos.includes(hoy.slug) ? t.receta.guardada : t.receta.guardar} activo={favoritos.includes(hoy.slug)} onPress={() => alternarFavorito(hoy.slug)} />
            </View>
          </View>
        ) : null}
        <View style={{ gap: 10 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <Titular tam={16}>{t.hoy.yaPuedes}</Titular>
            <Link href="/mi-bar"><Texto tam={13} peso="extra" estilo={{ textDecorationLine: 'underline' }}>{t.hoy.irMiBar}</Texto></Link>
          </View>
          {puedes.length ? (
            <View style={{ flexDirection: 'row', gap: 10 }}>
              {puedes.map((r) => (
                <Link key={r.slug} href={`/receta/${r.slug}`} asChild>
                  <Pressable accessibilityRole="link" style={{ flex: 1, backgroundColor: color.beige, borderRadius: 18, padding: 10, alignItems: 'center', gap: 6 }}>
                    <Ilustracion slug={r.slug} ancho={60} alto={78} />
                    <Texto tam={13} peso="extra" lineas={1}>{r.nombre}</Texto>
                  </Pressable>
                </Link>
              ))}
            </View>
          ) : (
            <Texto tam={14} tono={color.gris}>{t.hoy.vacioMiBar}</Texto>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
