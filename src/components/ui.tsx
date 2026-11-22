import { Image } from 'expo-image';
import { router, type Href } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { color, ilustracion, letra } from '../lib/tema';

export function Titular({ children, tam = 30, estilo, claro }: { children: ReactNode; tam?: number; estilo?: StyleProp<TextStyle>; claro?: boolean }) {
  return (
    <Text accessibilityRole="header" style={[{ fontFamily: letra.titular, fontSize: tam, lineHeight: tam * 1.05, color: claro ? color.crema : color.cassis, textTransform: 'uppercase' }, estilo]}>
      {children}
    </Text>
  );
}

export function Texto({ children, estilo, tam = 15, peso = 'normal', tono = color.cassis, lineas }: { children: ReactNode; estilo?: StyleProp<TextStyle>; tam?: number; peso?: 'normal' | 'bold' | 'extra' | 'black'; tono?: string; lineas?: number }) {
  const familia = { normal: letra.texto, bold: letra.textoBold, extra: letra.textoExtra, black: letra.textoBlack }[peso];
  return <Text numberOfLines={lineas} style={[{ fontFamily: familia, fontSize: tam, lineHeight: tam * 1.5, color: tono }, estilo]}>{children}</Text>;
}

export function Etiqueta({ children, tono = color.gris }: { children: ReactNode; tono?: string }) {
  return <Text style={{ fontFamily: letra.textoExtra, fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', color: tono }}>{children}</Text>;
}

type Variante = 'wasabi' | 'cassis' | 'borde' | 'bordeClaro' | 'crema';
const VAR: Record<Variante, { fondo: string; texto: string; borde: string }> = {
  wasabi: { fondo: color.wasabi, texto: color.cassis, borde: color.wasabi },
  cassis: { fondo: color.cassis, texto: color.crema, borde: color.cassis },
  borde: { fondo: 'transparent', texto: color.cassis, borde: color.cassis },
  bordeClaro: { fondo: 'transparent', texto: color.crema, borde: color.crema },
  crema: { fondo: color.crema, texto: color.cassis, borde: color.crema },
};

export function Boton({ children, onPress, href, variante = 'cassis', estilo, alto = 50, etiqueta }: { children: ReactNode; onPress?: () => void; href?: Href; variante?: Variante; estilo?: StyleProp<ViewStyle>; alto?: number; etiqueta?: string }) {
  const v = VAR[variante];
  return (
    <Pressable
      onPress={href ? () => router.push(href) : onPress}
      accessibilityRole={href ? 'link' : 'button'}
      accessibilityLabel={etiqueta}
      style={({ pressed }) => [{ minHeight: alto, borderRadius: 999, borderWidth: 2, borderColor: v.borde, backgroundColor: v.fondo, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 22, opacity: pressed ? 0.85 : 1 }, estilo]}
    >
      <Text style={{ fontFamily: letra.textoBlack, fontSize: 14, letterSpacing: 1.2, textTransform: 'uppercase', color: v.texto, textAlign: 'center' }}>{children}</Text>
    </Pressable>
  );
}

export function Chip({ texto, activo, onPress, marca }: { texto: string; activo: boolean; onPress: () => void; marca?: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: activo }}
      style={{ minHeight: 40, paddingHorizontal: 14, borderRadius: 999, borderWidth: 2, borderColor: color.cassis, backgroundColor: activo ? (marca ? color.wasabi : color.cassis) : 'transparent', flexDirection: 'row', alignItems: 'center', gap: 6 }}
    >
      {marca && activo ? <Icono nombre="check" tam={16} grosor={3} /> : null}
      <Text style={{ fontFamily: letra.textoExtra, fontSize: 14, color: activo && !marca ? color.crema : color.cassis }}>{texto}</Text>
    </Pressable>
  );
}

const PATHS: Record<string, string[]> = {
  hoy: ['m3 10 9-7 9 7', 'M5 9v11a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9'],
  copa: ['M8 22h8', 'M12 11v11', 'm19 3-7 8-7-8Z'],
  lista: ['M9 6h11', 'M9 12h11', 'M9 18h11', 'm3 6 1 1 2-2', 'm3 12 1 1 2-2', 'm3 18 1 1 2-2'],
  mapa: ['M12 21s-6-5.5-6-11a6 6 0 0 1 12 0c0 5.5-6 11-6 11Z'],
  libro: ['M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2Z', 'M4 21V5'],
  reloj: ['M12 7v5l3 2'],
  flecha: ['m9 18 6-6-6-6'],
  recetas: ['m20 20-3.5-3.5'],
  mibar: ['M10 2h4v4l2 3v12a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V9l2-3Z', 'M8 13h8'],
  corazon: ['M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z'],
  cuenta: ['M4 21a8 8 0 0 1 16 0'],
  atras: ['m15 18-6-6 6-6'],
  compartir: ['M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8', 'm16 6-4-4-4 4', 'M12 2v13'],
  cerrar: ['M18 6 6 18', 'm6 6 12 12'],
  check: ['M20 6 9 17l-5-5'],
  campana: ['M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9', 'M10.3 21a1.94 1.94 0 0 0 3.4 0'],
  play: ['M8 5v14l11-7Z'],
};
const CIRCULOS: Record<string, [number, number, number]> = { recetas: [11, 11, 7], cuenta: [12, 8, 4], mapa: [12, 10, 2.5], reloj: [12, 12, 9] };

export function Icono({ nombre, tam = 22, tono = 'currentColor', grosor = 2, relleno }: { nombre: keyof typeof PATHS; tam?: number; tono?: string; grosor?: number; relleno?: string }) {
  const c = CIRCULOS[nombre];
  const t = tono === 'currentColor' ? color.cassis : tono;
  return (
    <Svg width={tam} height={tam} viewBox="0 0 24 24" fill={relleno ?? 'none'} stroke={t} strokeWidth={grosor} strokeLinecap="round" strokeLinejoin="round">
      {c ? <Circle cx={c[0]} cy={c[1]} r={c[2]} /> : null}
      {PATHS[nombre].map((d) => <Path key={d} d={d} />)}
    </Svg>
  );
}

export function BotonIcono({ nombre, etiqueta, onPress, claro, activo }: { nombre: keyof typeof PATHS; etiqueta: string; onPress?: () => void; claro?: boolean; activo?: boolean }) {
  const tono = claro ? color.crema : color.cassis;
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={etiqueta} accessibilityState={{ selected: activo }} hitSlop={4}
      style={{ width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: tono, alignItems: 'center', justifyContent: 'center', backgroundColor: activo ? color.wasabi : 'transparent' }}>
      <Icono nombre={nombre} tam={20} tono={activo ? color.cassis : tono} relleno={activo && nombre === 'corazon' ? color.cassis : undefined} />
    </Pressable>
  );
}

export function Ilustracion({ slug, ancho, alto, estilo }: { slug: string; ancho: number; alto: number; estilo?: StyleProp<ViewStyle> }) {
  return (
    <View style={[{ width: ancho, height: alto }, estilo]}>
      <Image source={{ uri: ilustracion(slug) }} style={{ width: '100%', height: '100%' }} contentFit="contain" cachePolicy="disk" accessibilityIgnoresInvertColors />
    </View>
  );
}

export const est = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: color.crema },
  tarjeta: { backgroundColor: color.beige, borderRadius: 20 },
});
