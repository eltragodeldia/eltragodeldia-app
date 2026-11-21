import { useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FilaReceta } from '../../components/TarjetaReceta';
import { Boton, BotonIcono, Icono, Texto, Titular } from '../../components/ui';
import { cantidadTexto } from '../../lib/compartido/medidas';
import { claveMiBar } from '../../lib/compartido/mibar';
import type { Ingrediente } from '../../lib/compartido/tipos';
import { useEstado } from '../../lib/estado';
import { color, letra } from '../../lib/tema';

const clave = (n: string) => n.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\b(fresco|fresca|recien exprimido|fresh)\b/g, '').replace(/\s+/g, ' ').trim();

export default function Guardadas() {
  const { t, idioma, unidad, favoritos, alternarFavorito, lista, receta, mibar, hechos, cambiar, quitarDeLista } = useEstado();
  const [pestana, setPestana] = useState<'fav' | 'lista'>('fav');
  const favs = favoritos.map(receta).filter((r): r is NonNullable<typeof r> => Boolean(r));

  const items = useMemo(() => {
    const m = new Map<string, Ingrediente & { id: string; tienes: boolean }>();
    for (const { s, p } of lista) {
      const r = receta(s);
      if (!r) continue;
      for (const i of r.ingredientes) {
        const id = `${clave(i.ingrediente)}|${i.unidad}`;
        const ya = m.get(id);
        const cant = i.cantidad == null ? null : i.cantidad * p;
        if (ya) ya.cantidad = ya.cantidad == null || cant == null ? null : ya.cantidad + cant;
        else { const k = claveMiBar(i.ingrediente); m.set(id, { ...i, cantidad: cant, id, tienes: Boolean(k && mibar.includes(k)) }); }
      }
    }
    return [...m.values()];
  }, [lista, receta, mibar]);

  const marcar = (id: string) => cambiar({ hechos: hechos.includes(id) ? hechos.filter((h) => h !== id) : [...hechos, id] });
  const seg = (id: 'fav' | 'lista', texto: string) => (
    <Pressable key={id} onPress={() => setPestana(id)} accessibilityRole="tab" accessibilityState={{ selected: pestana === id }}
      style={{ flex: 1, minHeight: 42, borderRadius: 999, alignItems: 'center', justifyContent: 'center', backgroundColor: pestana === id ? color.cassis : 'transparent' }}>
      <Texto tam={14} peso="black" tono={pestana === id ? color.crema : color.cassis}>{texto}</Texto>
    </Pressable>
  );

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: color.crema }}>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 14 }}>
        <Titular>{t.guardadas.titulo}</Titular>
        <View accessibilityRole="tablist" style={{ flexDirection: 'row', backgroundColor: color.beige, borderRadius: 999, padding: 4 }}>
          {seg('fav', t.guardadas.favoritas)}{seg('lista', t.guardadas.lista)}
        </View>
        <Texto tam={13} peso="bold" tono={color.verde}>{t.guardadas.local}</Texto>
        {pestana === 'fav' ? (
          favs.length ? favs.map((r) => (
            <FilaReceta key={r.slug} r={r} nota={r.destilado} derecha={<BotonIcono nombre="corazon" activo etiqueta={t.receta.guardada} onPress={() => alternarFavorito(r.slug)} />} />
          )) : <Texto tono={color.gris}>{t.guardadas.sinFav}</Texto>
        ) : lista.length ? (
          <View style={{ gap: 4 }}>
            {lista.map(({ s, p }) => { const r = receta(s); return r ? (
              <View key={s} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Texto peso="extra">{r.nombre} · {p}</Texto>
                <Pressable onPress={() => quitarDeLista(s)} accessibilityRole="button" accessibilityLabel={`Quitar ${r.nombre}`} hitSlop={10} style={{ padding: 8 }}><Icono nombre="cerrar" tam={18} /></Pressable>
              </View>) : null; })}
            {items.map((i) => {
              const hecho = hechos.includes(i.id) || i.tienes;
              return (
                <Pressable key={i.id} onPress={() => marcar(i.id)} accessibilityRole="checkbox" accessibilityState={{ checked: hecho }}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 48, borderBottomWidth: 1, borderBottomColor: color.beige }}>
                  <View style={{ width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: color.cassis, backgroundColor: hecho ? color.cassis : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
                    {hecho ? <Icono nombre="check" tam={16} tono={color.crema} grosor={3} /> : null}
                  </View>
                  <Texto peso="black" estilo={{ minWidth: 64, textDecorationLine: hecho ? 'line-through' : 'none' }} tono={hecho ? color.gris : color.cassis}>{cantidadTexto(i, unidad, idioma)}</Texto>
                  <Texto estilo={{ flex: 1, textDecorationLine: hecho ? 'line-through' : 'none', fontFamily: letra.texto }} tono={hecho ? color.gris : color.cassis}>{i.ingrediente}{i.tienes ? ` · ${t.guardadas.yaTienes}` : ''}</Texto>
                </Pressable>
              );
            })}
            <Boton variante="borde" estilo={{ marginTop: 12 }} onPress={() => cambiar({ lista: [], hechos: [] })}>{t.guardadas.vaciar}</Boton>
          </View>
        ) : <Texto tono={color.gris}>{t.guardadas.sinLista}</Texto>}
      </ScrollView>
    </SafeAreaView>
  );
}
