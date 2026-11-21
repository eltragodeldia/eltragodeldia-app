import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import MapView, { Marker, type Region } from 'react-native-maps';
import type { Lugar } from '../lib/compartido/tipos';
import { COLOR_TIPO, MIAMI } from '../lib/lugares';

export interface MapaRef { centrar: (lat: number, lng: number) => void }

interface Props {
  lugares: Lugar[];
  alto: number;
  seleccionado?: string | null;
  onSelect?: (slug: string) => void;
  ubicacion?: boolean;
  interactivo?: boolean;
}

/** Mapa del teléfono (Apple Maps en iPhone). La versión web está en Mapa.web.tsx. */
export const Mapa = forwardRef<MapaRef, Props>(function Mapa({ lugares, alto, seleccionado, onSelect, ubicacion, interactivo = true }, ref) {
  const mapa = useRef<MapView>(null);
  const conPunto = lugares.filter((l) => l.lat != null && l.lng != null);

  useImperativeHandle(ref, () => ({
    centrar: (lat, lng) => mapa.current?.animateToRegion({ latitude: lat, longitude: lng, latitudeDelta: 0.04, longitudeDelta: 0.04 }, 400),
  }));

  useEffect(() => {
    if (!conPunto.length) return;
    const t = setTimeout(() => {
      if (conPunto.length === 1) {
        const l = conPunto[0];
        mapa.current?.animateToRegion({ latitude: l.lat!, longitude: l.lng!, latitudeDelta: 0.01, longitudeDelta: 0.01 }, 0);
      } else {
        mapa.current?.fitToCoordinates(conPunto.map((l) => ({ latitude: l.lat!, longitude: l.lng! })), { edgePadding: { top: 60, right: 50, bottom: 60, left: 50 }, animated: false });
      }
    }, 300);
    return () => clearTimeout(t);
  }, [conPunto.map((l) => l.slug).join(',')]);

  const inicial: Region = conPunto[0] ? { latitude: conPunto[0].lat!, longitude: conPunto[0].lng!, latitudeDelta: 0.2, longitudeDelta: 0.2 } : MIAMI;

  return (
    <MapView
      ref={mapa}
      style={{ height: alto, width: '100%' }}
      initialRegion={inicial}
      showsUserLocation={ubicacion}
      showsPointsOfInterests={false}
      scrollEnabled={interactivo}
      zoomEnabled={interactivo}
      rotateEnabled={false}
      pitchEnabled={false}
    >
      {conPunto.map((l) => (
        <Marker
          key={l.slug}
          coordinate={{ latitude: l.lat!, longitude: l.lng! }}
          title={l.nombre}
          description={[l.barrio, l.ciudad].filter(Boolean).join(', ')}
          pinColor={seleccionado === l.slug ? '#E9F056' : COLOR_TIPO[l.tipo] ?? '#351E28'}
          onPress={() => onSelect?.(l.slug)}
          onCalloutPress={() => onSelect?.(l.slug)}
        />
      ))}
    </MapView>
  );
});
