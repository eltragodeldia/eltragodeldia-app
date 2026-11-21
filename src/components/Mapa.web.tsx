import { forwardRef, useImperativeHandle } from 'react';
import { View } from 'react-native';
import type { Lugar } from '../lib/compartido/tipos';
import { useEstado } from '../lib/estado';
import { color } from '../lib/tema';
import { Icono, Texto } from './ui';

export interface MapaRef { centrar: (lat: number, lng: number) => void }

/** En la vista web (solo para pruebas) no hay mapa nativo: un recuadro en su lugar. */
export const Mapa = forwardRef<MapaRef, { lugares: Lugar[]; alto: number; seleccionado?: string | null; onSelect?: (slug: string) => void; ubicacion?: boolean; interactivo?: boolean }>(function Mapa({ alto, lugares }, ref) {
  const { t } = useEstado();
  useImperativeHandle(ref, () => ({ centrar: () => {} }));
  return (
    <View style={{ height: alto, backgroundColor: color.beige, alignItems: 'center', justifyContent: 'center', gap: 8 }}>
      <Icono nombre="mapa" tam={34} />
      <Texto tam={13} peso="bold" tono={color.gris}>{t.mapa.sinMapa} ({lugares.length})</Texto>
    </View>
  );
});
