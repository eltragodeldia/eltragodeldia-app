import { Nunito_400Regular, Nunito_700Bold, Nunito_800ExtraBold, Nunito_900Black, useFonts } from '@expo-google-fonts/nunito';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { EstadoProvider, useEstado } from '../lib/estado';
import { color } from '../lib/tema';

SplashScreen.preventAutoHideAsync().catch(() => {});

function Navegacion() {
  const { listo, edad } = useEstado();
  const [fuentes] = useFonts({ Nunito_400Regular, Nunito_700Bold, Nunito_800ExtraBold, Nunito_900Black, ArchivoExpandedBlack: require('../../assets/fonts/ArchivoExpandedBlack.ttf') });
  const preparado = listo && fuentes;
  useEffect(() => { if (preparado) SplashScreen.hideAsync().catch(() => {}); }, [preparado]);
  if (!preparado) return null;
  const adentro = edad === 'si';
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: color.crema } }}>
      <Stack.Protected guard={adentro}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="receta/[slug]" />
        <Stack.Screen name="preparar/[slug]" options={{ presentation: 'fullScreenModal', contentStyle: { backgroundColor: color.cassis } }} />
      </Stack.Protected>
      <Stack.Protected guard={!adentro}>
        <Stack.Screen name="bienvenida" />
      </Stack.Protected>
    </Stack>
  );
}

export default function Raiz() {
  return (
    <SafeAreaProvider>
      <EstadoProvider>
        <StatusBar style="dark" />
        <Navegacion />
      </EstadoProvider>
    </SafeAreaProvider>
  );
}
