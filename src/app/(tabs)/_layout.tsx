import { Tabs } from 'expo-router';
import { Text, View } from 'react-native';
import { Icono } from '../../components/ui';
import { useEstado } from '../../lib/estado';
import { color, letra } from '../../lib/tema';

type Nombre = 'hoy' | 'recetas' | 'mibar' | 'corazon' | 'cuenta';

function Pestana({ nombre, texto, activa }: { nombre: Nombre; texto: string; activa: boolean }) {
  return (
    <View style={{ alignItems: 'center', gap: 3, minWidth: 64 }}>
      <View style={{ backgroundColor: activa ? color.wasabi : 'transparent', borderRadius: 999, paddingHorizontal: 16, paddingVertical: 4 }}>
        <Icono nombre={nombre} tono={activa ? color.cassis : color.gris} />
      </View>
      <Text numberOfLines={1} style={{ fontFamily: activa ? letra.textoBlack : letra.textoBold, fontSize: 11, color: activa ? color.cassis : color.gris }}>{texto}</Text>
    </View>
  );
}

export default function Pestanas() {
  const { t } = useEstado();
  const p = t.pestanas;
  const op = (nombre: Nombre, texto: string) => ({
    title: texto,
    tabBarAccessibilityLabel: texto,
    tabBarIcon: ({ focused }: { focused: boolean }) => <Pestana nombre={nombre} texto={texto} activa={focused} />,
  });
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: { backgroundColor: color.crema, borderTopColor: color.beige, height: 84, paddingTop: 10 },
        tabBarItemStyle: { height: 60 },
        sceneStyle: { backgroundColor: color.crema },
      }}
    >
      <Tabs.Screen name="index" options={op('hoy', p.hoy)} />
      <Tabs.Screen name="recetas" options={op('recetas', p.recetas)} />
      <Tabs.Screen name="mi-bar" options={op('mibar', p.mibar)} />
      <Tabs.Screen name="guardadas" options={op('corazon', p.guardadas)} />
      <Tabs.Screen name="cuenta" options={op('cuenta', p.cuenta)} />
    </Tabs>
  );
}
