import { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Cabecera } from '../components/Cabecera';
import { FilaReceta } from '../components/TarjetaReceta';
import { Boton, Chip, Texto, Titular } from '../components/ui';
import { cuantasEncajan, elegirAntojo } from '../lib/compartido/antojo';
import { NOMBRE_SABOR, SABORES, sabores } from '../lib/compartido/sabores';
import { DESTILADOS } from '../lib/compartido/tipos';
import { useEstado } from '../lib/estado';
import { valor } from '../lib/textos';
import { color } from '../lib/tema';

/** ¿Qué me tomo hoy?: sabor y destilado (o Sorpréndeme) y 3 recetas de la biblioteca. Misma lógica que el sitio. */
export default function QueMeTomo() {
  const { t, idioma, recetas } = useEstado();
  const a = t.antojo;
  const lista = useMemo(() => recetas.filter((r) => r.slug !== 'sirope-el-trago-del-dia').map((r) => ({ ...r, sabores: sabores(r) as string[] })), [recetas]);
  const destilados = DESTILADOS.filter((d) => lista.some((r) => r.destilado === d));
  const saboresUsados = SABORES.filter((s) => lista.some((r) => r.sabores.includes(s)));
  const [sabor, setSabor] = useState<string | null>(null);
  const [dest, setDest] = useState<string | null>(null);
  const [ronda, setRonda] = useState(0);
  const [semilla, setSemilla] = useState(() => Math.floor(Math.random() * 1e6));
  const [visto, setVisto] = useState<{ sabor: string | null; dest: string | null } | null>(null);

  const elegidas = visto ? elegirAntojo(lista, visto.sabor, visto.dest, ronda, 3, semilla) : [];
  const n = visto ? cuantasEncajan(lista, visto.sabor, visto.dest) : 0;
  const filtro = !!visto && (!!visto.sabor || !!visto.dest);

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: color.crema }}>
      <Cabecera volver={t.receta.volver} />
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 4, gap: 14, paddingBottom: 48 }}>
        <Titular tam={34}>{a.titulo}</Titular>
        <View style={{ width: 72, height: 8, backgroundColor: color.wasabi, borderRadius: 4 }} />
        <Texto tam={16} tono={color.gris}>{a.lead}</Texto>

        <Titular tam={18} estilo={{ marginTop: 8 }}>{a.sabor}</Titular>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          <Chip texto={a.cualquiera} activo={!sabor} onPress={() => setSabor(null)} />
          {saboresUsados.map((s) => <Chip key={s} texto={NOMBRE_SABOR[idioma][s]} activo={sabor === s} onPress={() => setSabor(s)} />)}
        </View>

        <Titular tam={18} estilo={{ marginTop: 8 }}>{a.destilado}</Titular>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          <Chip texto={a.cualquiera} activo={!dest} onPress={() => setDest(null)} />
          {destilados.map((d) => <Chip key={d} texto={valor(d, idioma)} activo={dest === d} onPress={() => setDest(d)} />)}
        </View>

        <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
          <Boton variante="cassis" estilo={{ flex: 1 }} onPress={() => { setRonda(0); setVisto({ sabor, dest }); }}>{a.descubrir}</Boton>
          <Boton variante="wasabi" onPress={() => { setSabor(null); setDest(null); setSemilla(Math.floor(Math.random() * 1e6)); setRonda(0); setVisto({ sabor: null, dest: null }); }}>{a.sorpresa}</Boton>
        </View>

        {visto ? (
          <View style={{ gap: 10, marginTop: 14 }}>
            <Titular tam={24}>{a.resultado}</Titular>
            {filtro ? <Texto tam={14} tono={color.gris}>{n ? a.encajan(n) : a.cerca}</Texto> : null}
            {elegidas.map((r) => <FilaReceta key={r.slug} r={r} nota={r.resumen ?? valor(r.destilado, idioma)} />)}
            {!(filtro && n <= 3) ? <Boton variante="borde" onPress={() => setRonda((x) => x + 1)}>{a.otras}</Boton> : null}
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
