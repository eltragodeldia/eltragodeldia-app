import { router, type Href } from 'expo-router';
import { View } from 'react-native';
import { BotonIcono } from './ui';

/** Fila de arriba de las pantallas que se abren desde Inicio: volver y, si hace falta, otra acción a la derecha. */
export function Cabecera({ volver, atras = '/', derecha }: { volver: string; atras?: Href; derecha?: React.ReactNode }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 12, paddingTop: 4, paddingBottom: 10 }}>
      <BotonIcono nombre="atras" etiqueta={volver} onPress={() => (router.canGoBack() ? router.back() : router.replace(atras))} />
      {derecha}
    </View>
  );
}
