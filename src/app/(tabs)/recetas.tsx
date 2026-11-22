import { useLocalSearchParams, useScrollToTop } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, ScrollView, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TarjetaReceta } from '../../components/TarjetaReceta';
import { Chip, Icono, Texto, Titular } from '../../components/ui';
import { buscar } from '../../lib/compartido/buscar';
import { DESTILADOS } from '../../lib/compartido/tipos';
import { useEstado } from '../../lib/estado';
import { valor } from '../../lib/textos';
import { color, letra } from '../../lib/tema';


export default function Recetas() {
  const { t, idioma, recetas } = useEstado();
  const [q, setQ] = useState('');
  const { d } = useLocalSearchParams<{ d?: string }>();
  const [dest, setDest] = useState<string | null>(d ?? null);
  useEffect(() => { if (d) setDest(d); }, [d]);
  const ref = useRef<FlatList<(typeof recetas)[number]>>(null);
  useScrollToTop(ref);
  const presentes = DESTILADOS.filter((d) => recetas.some((r) => r.destilado === d));
  const lista = useMemo(() => {
    const base = recetas.filter((r) => !dest || r.destilado === dest);
    return buscar(q, base, (r) => ({ nombre: r.nombre, extra: [r.destilado, valor(r.destilado, idioma), ...r.ingredientes.map((i) => i.ingrediente)].join(' ') }));
  }, [recetas, q, dest, idioma]);

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: color.crema }}>
      <FlatList
        ref={ref}
        data={lista}
        keyExtractor={(r) => r.slug}
        numColumns={2}
        columnWrapperStyle={{ gap: 12 }}
        contentContainerStyle={{ padding: 20, gap: 12 }}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View style={{ gap: 14, marginBottom: 4 }}>
            <Titular>{t.recetas.titulo}</Titular>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 50, paddingHorizontal: 16, borderRadius: 999, borderWidth: 2, borderColor: color.cassis, backgroundColor: color.blanco }}>
              <Icono nombre="recetas" tam={20} />
              <TextInput value={q} onChangeText={setQ} placeholder={t.recetas.buscar} placeholderTextColor={color.gris} accessibilityLabel={t.recetas.buscar}
                style={{ flex: 1, fontFamily: letra.texto, fontSize: 15, color: color.cassis, paddingVertical: 10 }} returnKeyType="search" />
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }} style={{ marginHorizontal: -20 }}>
              <View style={{ width: 12 }} />
              <Chip texto={t.recetas.todos} activo={!dest} onPress={() => setDest(null)} />
              {presentes.map((d) => <Chip key={d} texto={valor(d, idioma)} activo={dest === d} onPress={() => setDest(dest === d ? null : d)} />)}
              <View style={{ width: 12 }} />
            </ScrollView>
          </View>
        }
        ListEmptyComponent={<Texto tono={color.gris}>{t.recetas.ninguna}</Texto>}
        renderItem={({ item }) => <TarjetaReceta r={item} />}
      />
    </SafeAreaView>
  );
}
