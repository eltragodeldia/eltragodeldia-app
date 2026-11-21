import { router } from 'expo-router';
import { Pressable, View } from 'react-native';
import type { Receta } from '../lib/compartido/tipos';
import { useEstado } from '../lib/estado';
import { valor } from '../lib/textos';
import { color } from '../lib/tema';
import { Ilustracion, Texto } from './ui';

export function TarjetaReceta({ r, nota }: { r: Receta; nota?: string }) {
  const { idioma, t } = useEstado();
  return (
      <Pressable onPress={() => router.push(`/receta/${r.slug}`)} accessibilityRole="link" style={{ flex: 1, backgroundColor: color.beige, borderRadius: 22, padding: 12, gap: 4 }}>
        <Ilustracion slug={r.slug} ancho={'100%' as unknown as number} alto={92} />
        <Texto tam={15} peso="black" lineas={1}>{r.nombre}</Texto>
        <Texto tam={12} peso="bold" tono={color.gris} lineas={1}>{nota ?? [valor(r.destilado, idioma), r.tiempo_min ? `${r.tiempo_min} ${t.receta.min}` : null].filter(Boolean).join(' · ')}</Texto>
      </Pressable>
  );
}

export function FilaReceta({ r, nota, derecha }: { r: Receta; nota?: string; derecha?: React.ReactNode }) {
  return (
      <Pressable onPress={() => router.push(`/receta/${r.slug}`)} accessibilityRole="link" style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 10, backgroundColor: color.beige, borderRadius: 18 }}>
        <Ilustracion slug={r.slug} ancho={44} alto={56} />
        <View style={{ flex: 1 }}>
          <Texto tam={15} peso="black">{r.nombre}</Texto>
          {nota ? <Texto tam={12} peso="bold" tono={color.gris}>{nota}</Texto> : null}
        </View>
        {derecha}
      </Pressable>
  );
}
