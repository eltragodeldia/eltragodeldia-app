import { Nunito_400Regular, Nunito_700Bold, Nunito_800ExtraBold, Nunito_900Black, useFonts } from '@expo-google-fonts/nunito';
import * as Notifications from 'expo-notifications';
import { router, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { slugDeAviso } from '../lib/aviso';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { EstadoProvider, useEstado } from '../lib/estado';
import { color } from '../lib/tema';

SplashScreen.preventAutoHideAsync().catch(() => {});

function Navegacion() {
  const { listo, edad } = useEstado();
  const [fuentes] = useFonts({ Nunito_400Regular, Nunito_700Bold, Nunito_800ExtraBold, Nunito_900Black, ArchivoExpandedBlack: require('../../assets/fonts/ArchivoExpandedBlack.ttf') });
  const preparado = listo && fuentes;
  useEffect(() => { if (preparado) SplashScreen.hideAsync().catch(() => {}); }, [preparado]);
  const adentro = edad === 'si';
  // Tocar el aviso del trago del día abre esa receta (también si la app estaba cerrada).
  useEffect(() => {
    if (!preparado || !adentro || Platform.OS === 'web') return;
    const abrir = (slug: string | null) => { if (slug) router.push({ pathname: '/receta/[slug]', params: { slug } }); };
    const ultima = Notifications.getLastNotificationResponse();
    if (ultima) { abrir(slugDeAviso(ultima)); Notifications.clearLastNotificationResponse(); }
    const sub = Notifications.addNotificationResponseReceivedListener((r) => { abrir(slugDeAviso(r)); Notifications.clearLastNotificationResponse(); });
    return () => sub.remove();
  }, [preparado, adentro]);
  if (!preparado) return null;
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: color.crema } }}>
      <Stack.Protected guard={adentro}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="receta/[slug]" />
        <Stack.Screen name="lugares/index" />
        <Stack.Screen name="lugar/[slug]" />
        <Stack.Screen name="articulos/index" />
        <Stack.Screen name="articulo/[slug]" />
        <Stack.Screen name="colecciones/index" />
        <Stack.Screen name="coleccion/[slug]" />
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
