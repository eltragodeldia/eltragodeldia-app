import { Image } from 'expo-image';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Boton, Chip, Texto, Titular } from '../components/ui';
import { useEstado } from '../lib/estado';
import { color } from '../lib/tema';

export default function Bienvenida() {
  const { t, edad, cambiar, idioma } = useEstado();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: color.crema }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 28, gap: 20 }}>
        <Image source={require('../../assets/marca/icono.png')} style={{ width: 92, height: 112 }} contentFit="contain" accessibilityIgnoresInvertColors />
        <Image source={require('../../assets/marca/logo-horizontal.png')} style={{ width: 230, height: 62 }} contentFit="contain" accessibilityLabel="El Trago del Día" />
        <Texto tam={17} estilo={{ textAlign: 'center' }}>{t.edad.frase}</Texto>
        <View style={{ alignSelf: 'stretch', backgroundColor: color.blanco, borderColor: color.beige, borderWidth: 1, borderRadius: 26, padding: 22, gap: 12 }}>
          {edad === 'no' ? (
            <>
              <Titular tam={22}>{t.edad.noTitulo}</Titular>
              <Texto tono={color.gris}>{t.edad.noTexto}</Texto>
            </>
          ) : (
            <>
              <Titular tam={22}>{t.edad.pregunta}</Titular>
              <Texto tam={14} tono={color.gris}>{t.edad.texto}</Texto>
              <Boton onPress={() => cambiar({ edad: 'si' })}>{t.edad.si}</Boton>
              <Boton variante="borde" onPress={() => cambiar({ edad: 'no' })}>{t.edad.no}</Boton>
            </>
          )}
        </View>
        <Texto tam={12} tono={color.gris} estilo={{ textAlign: 'center' }}>{t.edad.legal}</Texto>
        <View style={{ flexDirection: 'row', gap: 8 }} accessibilityRole="radiogroup">
          <Chip texto="Español" activo={idioma === 'es'} onPress={() => cambiar({ idioma: 'es' })} />
          <Chip texto="English" activo={idioma === 'en'} onPress={() => cambiar({ idioma: 'en' })} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
