import { ScrollView, View } from 'react-native';
import { useScrollToTop } from 'expo-router';
import { useMemo, useRef, type ComponentRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FilaReceta } from '../../components/TarjetaReceta';
import { Boton, Chip, Etiqueta, Texto, Titular } from '../../components/ui';
import { BASICOS, BOTELLAS, GRUPOS, GRUPOS_COCINA, INGREDIENTES, necesitaDe } from '../../lib/compartido/mibar';
import { proximasBotellas } from '../../lib/compartido/proxima';
import { useEstado } from '../../lib/estado';
import { color } from '../../lib/tema';

export default function MiBar() {
  const ref = useRef<ComponentRef<typeof ScrollView>>(null);
  useScrollToTop(ref);
  const { t, idioma, recetas, mibar, alternarMiBar, cambiar } = useEstado();
  const tengo = useMemo(() => new Set(mibar), [mibar]);
  const nombre = (k: string) => { const x = BOTELLAS.find((b) => b.clave === k) ?? INGREDIENTES.find((i) => i.clave === k); return x ? x[idioma] : k; };
  // Solo se muestran las botellas que aparecen en alguna receta del catálogo.
  const usadas = useMemo(() => { const s = new Set<string>(); recetas.forEach((r) => { const n = necesitaDe(r); n.b.forEach((k) => s.add(k)); n.i.forEach((k) => s.add(k)); }); return s; }, [recetas]);
  const { puedes, unaMas, proximas } = useMemo(() => {
    const puedes: typeof recetas = [];
    const unaMas: { r: (typeof recetas)[number]; falta: string }[] = [];
    const mini = recetas.map((r) => { const n = necesitaDe(r); return { r, n, s: r.slug, b: n.b, i: n.i }; });
    for (const x of mini) {
      if (!x.b.length) continue;
      const faltan = [...new Set([...x.b, ...x.i])].filter((k) => !tengo.has(k));
      if (!faltan.length) puedes.push(x.r);
      else if (faltan.length === 1) unaMas.push({ r: x.r, falta: x.n.l[faltan[0]] ?? nombre(faltan[0]) });
    }
    return { puedes, unaMas, proximas: tengo.size ? proximasBotellas(mini, tengo) : [] };
  }, [recetas, tengo, idioma]);

  const grupo = (titulo: string, claves: string[]) => claves.length ? (
    <View key={titulo} style={{ gap: 8 }}>
      <Etiqueta>{titulo}</Etiqueta>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {claves.map((k) => <Chip key={k} marca texto={nombre(k)} activo={tengo.has(k)} onPress={() => alternarMiBar(k)} />)}
      </View>
    </View>
  ) : null;

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: color.crema }}>
      <ScrollView ref={ref} contentContainerStyle={{ padding: 20, gap: 16 }}>
        <View style={{ gap: 6 }}>
          <Titular>{t.mibar.titulo}</Titular>
          <Texto>{t.mibar.lead}</Texto>
        </View>
        <Boton estilo={{ alignSelf: 'flex-start' }} alto={44} onPress={() => cambiar({ mibar: [...new Set([...mibar, ...BASICOS])] })}>{t.mibar.basico}</Boton>
        {(['destilados', 'licores', 'otros'] as const).map((g) => grupo(GRUPOS[idioma][g], BOTELLAS.filter((b) => b.grupo === g && usadas.has(b.clave)).map((b) => b.clave)))}
        {(['frutas', 'sodas', 'cocina'] as const).map((g) => grupo(GRUPOS_COCINA[idioma][g], INGREDIENTES.filter((i) => i.grupo === g && usadas.has(i.clave)).map((i) => i.clave)))}
        <View style={{ gap: 8 }}>
          <Titular tam={17}>{t.mibar.yaPuedes}</Titular>
          {puedes.length ? puedes.map((r) => <FilaReceta key={r.slug} r={r} nota={r.tecnica ?? undefined} />) : <Texto tono={color.gris}>{t.mibar.nada}</Texto>}
        </View>
        {unaMas.length ? (
          <View style={{ gap: 8 }}>
            <Titular tam={17}>{t.mibar.falta}</Titular>
            {unaMas.slice(0, 8).map(({ r, falta }) => <FilaReceta key={r.slug} r={r} nota={`${t.mibar.faltaTexto} ${falta}`} />)}
          </View>
        ) : null}
        {proximas.length ? (
          <View style={{ backgroundColor: color.azul, borderRadius: 20, padding: 16, gap: 6 }}>
            <Etiqueta tono={color.wasabi}>{t.mibar.proxima}</Etiqueta>
            {proximas.map((p) => (
              <Texto key={p.clave} tono={color.crema}>
                <Texto peso="black" tono={color.crema}>{nombre(p.clave)}</Texto> {t.mibar.abre}: {p.recetas.map((s) => recetas.find((r) => r.slug === s)?.nombre ?? s).join(', ')}
              </Texto>
            ))}
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
