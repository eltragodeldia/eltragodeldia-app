import * as Location from 'expo-location';
import { router } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { FlatList, Pressable, ScrollView, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mapa, type MapaRef } from '../../components/Mapa';
import { BotonIcono, Chip, Icono, Texto, Titular } from '../../components/ui';
import { CATEGORIAS_LUGAR, type Lugar } from '../../lib/compartido/tipos';
import { useEstado } from '../../lib/estado';
import { COLOR_TIPO, distanciaKm, sinAcentos } from '../../lib/lugares';
import { valor } from '../../lib/textos';
import { color, letra } from '../../lib/tema';

export default function Lugares() {
  const { t, idioma, lugares } = useEstado();
  const m = t.mapa;
  const mapa = useRef<MapaRef>(null);
  const [cat, setCat] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const [sel, setSel] = useState<string | null>(null);
  const [yo, setYo] = useState<{ lat: number; lng: number } | null>(null);
  const cats = CATEGORIAS_LUGAR.filter((c) => lugares.some((l) => (l.categorias ?? []).includes(c)));

  const lista = useMemo(() => {
    const b = sinAcentos(q.trim());
    const f = lugares.filter((l) => (!cat || (l.categorias ?? []).includes(cat)) && (!b || sinAcentos([l.nombre, l.barrio, l.ciudad, l.pedido].filter(Boolean).join(' ')).includes(b)));
    if (!yo) return f;
    return [...f].sort((a, c) => (a.lat == null ? 1e9 : distanciaKm(yo, { lat: a.lat, lng: a.lng! })) - (c.lat == null ? 1e9 : distanciaKm(yo, { lat: c.lat, lng: c.lng! })));
  }, [lugares, cat, q, yo]);

  const cerca = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return;
    const p = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    setYo({ lat: p.coords.latitude, lng: p.coords.longitude });
    mapa.current?.centrar(p.coords.latitude, p.coords.longitude);
  };

  const fila = (l: Lugar) => {
    const km = yo && l.lat != null ? distanciaKm(yo, { lat: l.lat, lng: l.lng! }) : null;
    return (
      <Pressable onPress={() => router.push(`/lugar/${l.slug}`)} accessibilityRole="link"
        style={{ backgroundColor: sel === l.slug ? color.beige : color.blanco, borderWidth: 1, borderColor: color.beige, borderRadius: 20, padding: 14, gap: 6, marginHorizontal: 20 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: COLOR_TIPO[l.tipo] ?? color.cassis }} />
          <Texto tam={16} peso="black" estilo={{ flex: 1 }} lineas={1}>{l.nombre}</Texto>
          {km != null ? <Texto tam={12} peso="bold" tono={color.gris}>{km < 10 ? km.toFixed(1) : Math.round(km)} km</Texto> : null}
        </View>
        <Texto tam={12} peso="bold" tono={color.gris}>{[valor(l.tipo, idioma), l.barrio, l.ciudad].filter(Boolean).join(' · ')}</Texto>
        {l.pedido ? <Texto tam={14} lineas={2}><Texto tam={14} peso="black">{m.pedir}: </Texto>{l.pedido}</Texto> : null}
      </Pressable>
    );
  };

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: color.crema }}>
      <FlatList
        data={lista}
        keyExtractor={(l) => l.slug}
        contentContainerStyle={{ paddingBottom: 30, gap: 10 }}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View style={{ gap: 14, marginBottom: 4 }}>
            <View style={{ paddingHorizontal: 20, gap: 10 }}>
              <BotonIcono nombre="atras" etiqueta={m.volver} onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} />
              <Titular>{m.titulo}</Titular>
              <Texto>{m.lead}</Texto>
            </View>
            <View>
              <Mapa ref={mapa} lugares={lista} alto={300} seleccionado={sel} onSelect={(s) => { if (sel === s) router.push(`/lugar/${s}`); else setSel(s); }} ubicacion={Boolean(yo)} />
              <Pressable onPress={cerca} accessibilityRole="button" style={{ position: 'absolute', right: 14, bottom: 14, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: color.crema, borderRadius: 999, paddingHorizontal: 14, minHeight: 40, borderWidth: 2, borderColor: color.cassis }}>
                <Icono nombre="mapa" tam={16} /><Texto tam={13} peso="black">{m.cerca}</Texto>
              </Pressable>
            </View>
            <View style={{ paddingHorizontal: 20 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 48, paddingHorizontal: 16, borderRadius: 999, borderWidth: 2, borderColor: color.cassis, backgroundColor: color.blanco }}>
                <Icono nombre="recetas" tam={18} />
                <TextInput value={q} onChangeText={setQ} placeholder={m.buscar} placeholderTextColor={color.gris} accessibilityLabel={m.buscar} style={{ flex: 1, fontFamily: letra.texto, fontSize: 15, color: color.cassis, paddingVertical: 10 }} />
              </View>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 20 }}>
              <Chip texto={m.todos} activo={!cat} onPress={() => setCat(null)} />
              {cats.map((c) => <Chip key={c} texto={valor(c, idioma)} activo={cat === c} onPress={() => setCat(cat === c ? null : c)} />)}
            </ScrollView>
            <Texto tam={13} peso="extra" tono={color.gris} estilo={{ paddingHorizontal: 20 }}>{m.lugares(lista.length)}</Texto>
          </View>
        }
        ListEmptyComponent={<Texto tono={color.gris} estilo={{ paddingHorizontal: 20 }}>{m.ninguno}</Texto>}
        renderItem={({ item }) => fila(item)}
      />
    </SafeAreaView>
  );
}
