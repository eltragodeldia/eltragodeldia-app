import Constants from 'expo-constants';
import * as WebBrowser from 'expo-web-browser';
import { Pressable, ScrollView, Switch, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icono, Texto, Titular } from '../../components/ui';
import { useEstado } from '../../lib/estado';
import { color, SITIO } from '../../lib/tema';

export default function Cuenta() {
  const { t, idioma, unidad, aviso, cambiar } = useEstado();
  const en = idioma === 'en';
  const fila = (texto: string, derecha: React.ReactNode) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 56, borderBottomWidth: 1, borderBottomColor: color.beige, gap: 12 }}>
      <Texto peso="bold" estilo={{ flex: 1 }}>{texto}</Texto>{derecha}
    </View>
  );
  const seg = <T extends string>(op: [T, string][], v: T, set: (x: T) => void) => (
    <View style={{ flexDirection: 'row', backgroundColor: color.beige, borderRadius: 999, padding: 3 }}>
      {op.map(([k, txt]) => (
        <Pressable key={k} onPress={() => set(k)} accessibilityRole="radio" accessibilityState={{ selected: v === k }}
          style={{ minHeight: 38, paddingHorizontal: 14, borderRadius: 999, justifyContent: 'center', backgroundColor: v === k ? color.cassis : 'transparent' }}>
          <Texto tam={13} peso="black" tono={v === k ? color.crema : color.cassis}>{txt}</Texto>
        </Pressable>
      ))}
    </View>
  );
  const enlace = (texto: string, ruta: string) => (
    <Pressable key={ruta} onPress={() => WebBrowser.openBrowserAsync(SITIO + ruta)} accessibilityRole="link"
      style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 52, borderBottomWidth: 1, borderBottomColor: color.beige }}>
      <Texto peso="bold">{texto}</Texto>
      <View style={{ transform: [{ rotate: '180deg' }] }}><Icono nombre="atras" tam={18} /></View>
    </Pressable>
  );
  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: color.crema }}>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
        <Titular>{t.cuenta.titulo}</Titular>
        <View style={{ backgroundColor: color.cassis, borderRadius: 22, padding: 18, gap: 6 }}>
          <Texto peso="black" tam={17} tono={color.crema}>{t.cuenta.entrar}</Texto>
          <Texto tam={14} tono={color.beige}>{t.cuenta.entrarTexto}</Texto>
          <Texto tam={13} peso="bold" tono={color.wasabi}>{t.cuenta.pronto}</Texto>
        </View>
        <View>
          {fila(t.cuenta.aviso, <Switch value={aviso} onValueChange={(v) => cambiar({ aviso: v })} trackColor={{ true: color.cassis, false: color.beige }} thumbColor={aviso ? color.wasabi : color.blanco} accessibilityLabel={t.cuenta.aviso} />)}
          {fila(t.cuenta.idioma, seg([['es', 'Español'], ['en', 'English']], idioma, (v) => cambiar({ idioma: v })))}
          {fila(t.cuenta.medidas, seg([['oz', 'oz'], ['ml', 'ml']], unidad, (v) => cambiar({ unidad: v })))}
        </View>
        <View>
          {enlace(t.cuenta.privacidad, en ? '/en/privacy' : '/privacidad')}
          {enlace(t.cuenta.terminos, en ? '/en/terms' : '/terminos')}
          {enlace(t.cuenta.consumo, en ? '/en/responsible-drinking' : '/consumo-responsable')}
        </View>
        <Texto tam={12} tono={color.gris}>{t.cuenta.version} {Constants.expoConfig?.version ?? ''} · EL TRAGO DEL DIA, CORP</Texto>
      </ScrollView>
    </SafeAreaView>
  );
}
