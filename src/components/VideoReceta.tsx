import { Image } from 'expo-image';
import { Linking, Pressable, View } from 'react-native';
import { useEstado } from '../lib/estado';
import { color } from '../lib/tema';
import { Icono, Texto, Titular } from './ui';

/** Id de YouTube de un enlace normal, corto (youtu.be) o de Shorts. */
export function idYoutube(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/(?:shorts\/|watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/);
  return m ? m[1] : null;
}

function plataforma(url: string) {
  if (/youtu/.test(url)) return 'YouTube';
  if (/instagram/.test(url)) return 'Instagram';
  if (/tiktok/.test(url)) return 'TikTok';
  return null;
}

/** El video de la receta: la miniatura con un botón de play. Abre YouTube (la app si está instalada) o la red del video. */
export function VideoReceta({ url, nombre }: { url: string; nombre: string }) {
  const { t } = useEstado();
  const id = idYoutube(url);
  const red = plataforma(url);
  const abrir = () => Linking.openURL(url);
  return (
    <View style={{ gap: 10, marginTop: 6 }}>
      <Titular tam={18}>{t.receta.video}</Titular>
      <Pressable onPress={abrir} accessibilityRole="link" accessibilityLabel={`${t.receta.verVideo}: ${nombre}`}
        style={({ pressed }) => ({ borderRadius: 24, overflow: 'hidden', backgroundColor: color.cassis, opacity: pressed ? 0.85 : 1 })}>
        {id ? (
          <Image source={{ uri: `https://i.ytimg.com/vi/${id}/hqdefault.jpg` }} style={{ width: '100%', aspectRatio: 16 / 9 }} contentFit="cover" transition={150} accessibilityIgnoresInvertColors />
        ) : (
          <View style={{ width: '100%', aspectRatio: 16 / 9 }} />
        )}
        <View style={{ position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ width: 68, height: 68, borderRadius: 34, backgroundColor: color.wasabi, alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ marginLeft: 4 }}><Icono nombre="play" tam={30} tono={color.cassis} relleno={color.cassis} /></View>
          </View>
        </View>
      </Pressable>
      <Pressable onPress={abrir} accessibilityRole="link" hitSlop={8}>
        <Texto peso="black" estilo={{ textDecorationLine: 'underline' }}>{red ? t.receta.verEn(red) : t.receta.verVideo}</Texto>
      </Pressable>
    </View>
  );
}
