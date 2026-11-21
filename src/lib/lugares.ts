import { Linking, Platform } from 'react-native';
import type { Lugar } from './compartido/tipos';

export const COLOR_TIPO: Record<string, string> = { 'Coctelería': '#351E28', Restaurante: '#2C4E3A', Hotel: '#223C5B' };
export const MIAMI = { latitude: 25.7617, longitude: -80.1918, latitudeDelta: 0.25, longitudeDelta: 0.25 };

/** Abre Apple Maps en iPhone y Google Maps en lo demás, con la ruta al lugar. */
export function comoLlegar(l: Lugar) {
  const destino = l.lat != null && l.lng != null ? `${l.lat},${l.lng}` : encodeURIComponent([l.nombre, l.direccion, l.ciudad].filter(Boolean).join(', '));
  const url = Platform.OS === 'ios' ? `https://maps.apple.com/?daddr=${destino}&q=${encodeURIComponent(l.nombre)}` : `https://www.google.com/maps/dir/?api=1&destination=${destino}`;
  return Linking.openURL(url);
}

export const sinAcentos = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export function distanciaKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const r = (x: number) => (x * Math.PI) / 180;
  const d = Math.sin(r(b.lat - a.lat) / 2) ** 2 + Math.cos(r(a.lat)) * Math.cos(r(b.lat)) * Math.sin(r(b.lng - a.lng) / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(d));
}
