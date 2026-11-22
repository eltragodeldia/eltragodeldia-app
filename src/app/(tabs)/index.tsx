import { Image } from 'expo-image';
import { router, useScrollToTop, type Href } from 'expo-router';
import { useEffect, useMemo, useRef, useState, type ComponentRef, type ReactNode } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BotonIcono, Boton, Chip, Icono, Ilustracion, Texto, Titular } from '../../components/ui';
import { necesitaDe } from '../../lib/compartido/mibar';
import { DESTILADOS, type Receta } from '../../lib/compartido/tipos';
import { pedirPermiso, permiso } from '../../lib/aviso';
import { tragoDelDia } from '../../lib/datos';
import { useEstado } from '../../lib/estado';
import { valor } from '../../lib/textos';
import { color, SITIO } from '../../lib/tema';

type NombreIcono = Parameters<typeof Icono>[0]['nombre'];

function Seccion({ titulo, accion, onAccion, children }: { titulo: string; accion?: string; onAccion?: () => void; children: ReactNode }) {
  return (
    <View style={{ gap: 10 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', paddingHorizontal: 20 }}>
        <Titular tam={16}>{titulo}</Titular>
        {accion ? (
          <Pressable onPress={onAccion} accessibilityRole="link" hitSlop={10}>
            <Texto tam={13} peso="extra" estilo={{ textDecorationLine: 'underline' }}>{accion}</Texto>
          </Pressable>
        ) : null}
      </View>
      {children}
    </View>
  );
}

function Atajo({ icono, titulo, sub, href, fondo = color.beige, claro }: { icono: NombreIcono; titulo: string; sub: string; href: Href; fondo?: string; claro?: boolean }) {
  const tono = claro ? color.crema : color.cassis;
  return (
    <Pressable onPress={() => router.push(href)} accessibilityRole="link" accessibilityLabel={`${titulo}. ${sub}`}
      style={({ pressed }) => ({ flex: 1, minHeight: 124, backgroundColor: fondo, borderRadius: 22, padding: 14, gap: 8, justifyContent: 'space-between', opacity: pressed ? 0.9 : 1 })}>
      <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: claro ? color.wasabi : color.crema, alignItems: 'center', justifyContent: 'center' }}>
        <Icono nombre={icono} tam={20} tono={color.cassis} />
      </View>
      <View style={{ gap: 2 }}>
        <Texto tam={15} peso="black" tono={tono}>{titulo}</Texto>
        <Texto tam={12} peso="bold" tono={claro ? color.beige : color.gris}>{sub}</Texto>
      </View>
    </Pressable>
  );
}

function Carrusel({ recetas, nota }: { recetas: Receta[]; nota?: (r: Receta) => string }) {
  const { idioma, t } = useEstado();
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingHorizontal: 20 }}>
      {recetas.map((r) => (
        <Pressable key={r.slug} onPress={() => router.push(`/receta/${r.slug}`)} accessibilityRole="link"
          style={{ width: 138, backgroundColor: color.beige, borderRadius: 20, padding: 10, gap: 4 }}>
          <Ilustracion slug={r.slug} ancho={118} alto={100} />
          <Texto tam={14} peso="black" lineas={1}>{r.nombre}</Texto>
          <Texto tam={12} peso="bold" tono={color.gris} lineas={1}>
            {nota ? nota(r) : [valor(r.destilado, idioma), r.tiempo_min ? `${r.tiempo_min} ${t.receta.min}` : null].filter(Boolean).join(' · ')}
          </Texto>
        </Pressable>
      ))}
    </ScrollView>
  );
}

function Tarjeta({ fondo, titulo, texto, boton, onPress, icono }: { fondo: string; titulo: string; texto: string; boton: string; onPress: () => void; icono: NombreIcono }) {
  const oscuro = fondo !== color.beige && fondo !== color.wasabi;
  return (
    <View style={{ marginHorizontal: 20, backgroundColor: fondo, borderRadius: 24, padding: 18, gap: 10 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: oscuro ? color.wasabi : color.crema, alignItems: 'center', justifyContent: 'center' }}>
          <Icono nombre={icono} tam={18} tono={color.cassis} />
        </View>
        <Titular tam={16} claro={oscuro} estilo={{ flex: 1 }}>{titulo}</Titular>
      </View>
      <Texto tam={14} tono={oscuro ? color.beige : color.cassis}>{texto}</Texto>
      <Boton variante={oscuro ? 'wasabi' : 'cassis'} alto={46} estilo={{ alignSelf: 'flex-start' }} onPress={onPress}>{boton}</Boton>
    </View>
  );
}

export default function Inicio() {
  const { t, idioma, recetas, catalogo, favoritos, alternarFavorito, mibar, lista, aviso, avisoPreguntado, cambiar } = useEstado();
  // Pregunta por el aviso diario una sola vez, aquí y con contexto, nunca al abrir la app.
  const [preguntarAviso, setPreguntarAviso] = useState(false);
  useEffect(() => { if (aviso && !avisoPreguntado) permiso().then((p) => setPreguntarAviso(p === 'sin-preguntar')).catch(() => {}); }, [aviso, avisoPreguntado]);
  const responderAviso = async (si: boolean) => {
    setPreguntarAviso(false);
    const ok = si ? await pedirPermiso() : false;
    cambiar({ avisoPreguntado: true, aviso: ok });
  };
  const h = t.hoy;
  const ref = useRef<ComponentRef<typeof ScrollView>>(null);
  useScrollToTop(ref);
  const en = idioma === 'en';

  const hoy = useMemo(() => tragoDelDia(recetas), [recetas]);
  const hora = new Date().getHours();
  const saludo = h.saludo[hora < 12 ? 0 : hora < 19 ? 1 : 2];
  const fecha = new Date().toLocaleDateString(en ? 'en-US' : 'es', { weekday: 'long', day: 'numeric', month: 'long' });

  const puedes = useMemo(() => {
    if (!mibar.length) return [];
    const tengo = new Set(mibar);
    return recetas.filter((r) => { const n = necesitaDe(r); return n.b.length > 0 && [...n.b, ...n.i].every((k) => tengo.has(k)); }).slice(0, 10);
  }, [recetas, mibar]);
  const nuevas = useMemo(() => recetas.slice(0, 10), [recetas]);
  const rapidas = useMemo(() => recetas.filter((r) => r.tiempo_min != null && r.tiempo_min <= 5 && r.slug !== hoy?.slug).slice(0, 10), [recetas, hoy]);
  const destilados = DESTILADOS.filter((d) => recetas.some((r) => r.destilado === d));
  const articulos = (catalogo?.articulos ?? []).filter((a) => !en || a.titulo_en).slice(0, 3);

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: color.crema }}>
      <ScrollView ref={ref} contentContainerStyle={{ paddingVertical: 16, gap: 26 }}>
        <View style={{ paddingHorizontal: 20, gap: 14 }}>
          <Image source={require('../../../assets/marca/logo-horizontal.png')} style={{ width: 150, height: 39 }} contentFit="contain" accessibilityLabel="El Trago del Día" />
          <View style={{ gap: 2 }}>
            <Texto tam={12} peso="extra" tono={color.gris} estilo={{ letterSpacing: 2, textTransform: 'uppercase' }}>{fecha}</Texto>
            <Titular tam={28}>{saludo}</Titular>
          </View>
          {catalogo?.origen === 'guardado' ? <Texto tam={13} tono={color.gris}>{t.sinConexion}</Texto> : null}
        </View>

        {hoy ? (
          <View style={{ marginHorizontal: 20, backgroundColor: color.cassis, borderRadius: 26, padding: 20, gap: 12 }}>
            <Texto tam={12} peso="black" tono={color.wasabi} estilo={{ letterSpacing: 2, textTransform: 'uppercase' }}>{h.titulo}</Texto>
            <View style={{ flexDirection: 'row', gap: 14, alignItems: 'center' }}>
              <View style={{ backgroundColor: color.crema, borderRadius: 18, padding: 6 }}><Ilustracion slug={hoy.slug} ancho={92} alto={120} /></View>
              <View style={{ flex: 1, gap: 8 }}>
                <View style={{ alignSelf: 'flex-start', backgroundColor: color.wasabi, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 }}>
                  <Texto tam={11} peso="black" estilo={{ letterSpacing: 1.6, textTransform: 'uppercase' }}>{valor(hoy.destilado, idioma)}</Texto>
                </View>
                <Titular tam={22} claro>{hoy.nombre}</Titular>
                <Texto tam={13} tono={color.beige}>{[valor(hoy.dificultad, idioma), hoy.tiempo_min ? `${hoy.tiempo_min} ${t.receta.min}` : null, hoy.tecnica].filter(Boolean).join(' · ')}</Texto>
              </View>
            </View>
            {hoy.resumen ? <Texto tono={color.crema}>{hoy.resumen}</Texto> : null}
            <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
              <Boton variante="wasabi" href={`/receta/${hoy.slug}`} estilo={{ flex: 1 }}>{h.preparar}</Boton>
              <BotonIcono nombre="corazon" claro etiqueta={favoritos.includes(hoy.slug) ? t.receta.guardada : t.receta.guardar} activo={favoritos.includes(hoy.slug)} onPress={() => alternarFavorito(hoy.slug)} />
            </View>
          </View>
        ) : null}

        {preguntarAviso ? (
          <View style={{ marginHorizontal: 20, backgroundColor: color.wasabi, borderRadius: 22, padding: 18, gap: 10 }}>
            <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
              <Icono nombre="campana" tam={22} />
              <Titular tam={18} estilo={{ flex: 1 }}>{h.avisoTitulo}</Titular>
            </View>
            <Texto tam={14}>{h.avisoTexto}</Texto>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Boton variante="cassis" alto={46} estilo={{ flex: 1 }} onPress={() => responderAviso(true)}>{h.avisoSi}</Boton>
              <Boton variante="borde" alto={46} onPress={() => responderAviso(false)}>{h.avisoAhoraNo}</Boton>
            </View>
          </View>
        ) : null}

        <Seccion titulo={h.atajos}>
          <View style={{ paddingHorizontal: 20, gap: 10 }}>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Atajo icono="recetas" titulo={h.a_recetas} sub={h.a_recetasSub(recetas.length)} href="/recetas" />
              <Atajo icono="mibar" titulo={h.a_mibar} sub={h.a_mibarSub(mibar.length)} href="/mi-bar" fondo={color.azul} claro />
            </View>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Atajo icono="corazon" titulo={h.a_fav} sub={h.a_favSub(favoritos.length)} href="/guardadas" />
              <Atajo icono="lista" titulo={h.a_lista} sub={h.a_listaSub(lista.length)} href={{ pathname: '/guardadas', params: { pestana: 'lista' } }} />
            </View>
          </View>
        </Seccion>

        <Tarjeta fondo={color.wasabi} icono="copa" titulo={t.antojo.titulo} texto={t.antojo.tarjeta} boton={t.antojo.tarjetaBoton} onPress={() => router.push('/que-me-tomo')} />

        {puedes.length ? (
          <Seccion titulo={h.yaPuedes} accion={h.irMiBar} onAccion={() => router.push('/mi-bar')}>
            <Carrusel recetas={puedes} />
          </Seccion>
        ) : (
          <Tarjeta fondo={color.azul} icono="mibar" titulo={h.marcaTuBar} texto={h.marcaTuBarSub} boton={h.marcaTuBarBoton} onPress={() => router.push('/mi-bar')} />
        )}

        {destilados.length ? (
          <Seccion titulo={h.porDestilado}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 20 }}>
              {destilados.map((d) => (
                <Chip key={d} texto={valor(d, idioma)} activo={false} onPress={() => router.push({ pathname: '/recetas', params: { d } })} />
              ))}
            </ScrollView>
          </Seccion>
        ) : null}

        {nuevas.length ? (
          <Seccion titulo={h.nuevas} accion={h.verTodos} onAccion={() => router.push('/recetas')}>
            <Carrusel recetas={nuevas} />
          </Seccion>
        ) : null}

        <Tarjeta fondo={color.beige} icono="reloj" titulo={h.prepara} texto={h.preparaSub} boton={h.preparar} onPress={() => hoy && router.push({ pathname: '/preparar/[slug]', params: { slug: hoy.slug } })} />

        {rapidas.length ? (
          <Seccion titulo={h.rapidas}>
            <Carrusel recetas={rapidas} />
          </Seccion>
        ) : null}

        {articulos.length ? (
          <Seccion titulo={h.leer} accion={h.verTodos} onAccion={() => router.push('/articulos')}>
            <View style={{ paddingHorizontal: 20, gap: 10 }}>
              {articulos.map((a) => (
                <Pressable key={a.slug} onPress={() => router.push({ pathname: '/articulo/[slug]', params: { slug: a.slug } })} accessibilityRole="link"
                  style={{ flexDirection: 'row', gap: 12, alignItems: 'center', backgroundColor: color.blanco, borderWidth: 1, borderColor: color.beige, borderRadius: 20, padding: 10 }}>
                  <Image source={{ uri: a.foto_url ?? `${SITIO}/portadas/articulos/${a.slug}.svg?v=2` }} style={{ width: 72, height: 72, borderRadius: 14, backgroundColor: color.beige }} contentFit="contain" accessibilityIgnoresInvertColors />
                  <View style={{ flex: 1, gap: 2 }}>
                    <Texto tam={15} peso="black" lineas={2}>{(en ? a.titulo_en : a.titulo) ?? a.titulo}</Texto>
                    {(en ? a.resumen_en : a.resumen) ? <Texto tam={12} tono={color.gris} lineas={2}>{en ? a.resumen_en : a.resumen}</Texto> : null}
                  </View>
                  <Icono nombre="flecha" tam={18} />
                </Pressable>
              ))}
            </View>
          </Seccion>
        ) : null}

        <Tarjeta fondo={color.verde} icono="mapa" titulo={h.bares} texto={h.baresSub} boton={h.baresBoton} onPress={() => router.push('/lugares')} />
        <Tarjeta fondo={color.cassis} icono="libro" titulo={h.colecciones} texto={h.coleccionesSub} boton={h.coleccionesBoton} onPress={() => router.push('/colecciones')} />

        <Texto tam={12} tono={color.gris} estilo={{ textAlign: 'center', paddingHorizontal: 20 }}>{h.responsable}</Texto>
      </ScrollView>
    </SafeAreaView>
  );
}
