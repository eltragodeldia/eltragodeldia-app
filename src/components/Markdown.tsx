// Lector de Markdown sencillo para los artículos (lo que Yunior escribe en el panel).
// Cubre lo que usan los artículos: títulos, párrafos, listas, citas, imágenes, separadores,
// negrita, cursiva y enlaces. Sin paquetes nativos, para que llegue como actualización rápida.
// Los enlaces a recetas, artículos y lugares del sitio se abren dentro de la app.
import { Image } from 'expo-image';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import type { ReactNode } from 'react';
import { Text, View } from 'react-native';
import { color, letra, SITIO } from '../lib/tema';

type Bloque =
  | { t: 'h'; nivel: number; texto: string }
  | { t: 'p'; texto: string }
  | { t: 'ul' | 'ol'; items: string[] }
  | { t: 'cita'; texto: string }
  | { t: 'img'; alt: string; url: string }
  | { t: 'hr' };

/** Parte el texto en bloques. El HTML se quita, igual que en el sitio. */
export function bloques(md: string): Bloque[] {
  const lineas = md.replace(/<[^>]*>/g, '').replace(/\r/g, '').split('\n');
  const out: Bloque[] = [];
  let parrafo: string[] = [];
  const cerrar = () => { if (parrafo.length) { out.push({ t: 'p', texto: parrafo.join(' ') }); parrafo = []; } };
  for (let i = 0; i < lineas.length; i++) {
    const l = lineas[i].trim();
    if (!l) { cerrar(); continue; }
    const h = l.match(/^(#{1,4})\s+(.*)$/);
    if (h) { cerrar(); out.push({ t: 'h', nivel: h[1].length, texto: h[2] }); continue; }
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(l)) { cerrar(); out.push({ t: 'hr' }); continue; }
    const img = l.match(/^!\[([^\]]*)\]\(([^)\s]+)[^)]*\)$/);
    if (img) { cerrar(); out.push({ t: 'img', alt: img[1], url: img[2] }); continue; }
    if (/^[-*+]\s+/.test(l) || /^\d+[.)]\s+/.test(l)) {
      cerrar();
      const ordenada = /^\d/.test(l);
      const items: string[] = [];
      while (i < lineas.length && (ordenada ? /^\d+[.)]\s+/ : /^[-*+]\s+/).test(lineas[i].trim())) {
        items.push(lineas[i].trim().replace(ordenada ? /^\d+[.)]\s+/ : /^[-*+]\s+/, ''));
        i++;
      }
      i--;
      out.push({ t: ordenada ? 'ol' : 'ul', items });
      continue;
    }
    if (l.startsWith('>')) {
      cerrar();
      const partes: string[] = [];
      while (i < lineas.length && lineas[i].trim().startsWith('>')) { partes.push(lineas[i].trim().replace(/^>\s?/, '')); i++; }
      i--;
      out.push({ t: 'cita', texto: partes.join(' ') });
      continue;
    }
    parrafo.push(l);
  }
  cerrar();
  return out;
}

/** Abre un enlace: lo del sitio que existe en la app, dentro de la app; lo demás, en el navegador de la app. */
export function abrirEnlace(url: string) {
  const ruta = url.startsWith(SITIO) ? url.slice(SITIO.length) : url.startsWith('/') ? url : null;
  const m = ruta?.replace(/\.html$/, '').match(/^(?:\/en)?\/(recetas|recipes|articulos|articles|lugares|places)\/([^/?#]+)\/?$/);
  if (m) {
    const slug = decodeURIComponent(m[2]);
    if (m[1] === 'recetas' || m[1] === 'recipes') return router.push({ pathname: '/receta/[slug]', params: { slug } });
    if (m[1] === 'articulos' || m[1] === 'articles') return router.push({ pathname: '/articulo/[slug]', params: { slug } });
    return router.push({ pathname: '/lugar/[slug]', params: { slug } });
  }
  return WebBrowser.openBrowserAsync(ruta ? SITIO + ruta : url);
}

/** Negrita, cursiva y enlaces dentro de una línea. */
function enLinea(texto: string, clave = 'x'): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /\*\*([^*]+)\*\*|__([^_]+)__|\[([^\]]+)\]\(([^)\s]+)[^)]*\)|\*([^*]+)\*|_([^_]+)_/g;
  let ultimo = 0;
  let m: RegExpExecArray | null;
  let n = 0;
  while ((m = re.exec(texto))) {
    if (m.index > ultimo) out.push(texto.slice(ultimo, m.index));
    const k = `${clave}-${n++}`;
    if (m[1] || m[2]) out.push(<Text key={k} style={{ fontFamily: letra.textoBlack }}>{enLinea(m[1] ?? m[2], k)}</Text>);
    else if (m[3]) {
      const url = m[4];
      out.push(<Text key={k} accessibilityRole="link" onPress={() => abrirEnlace(url)} style={{ fontFamily: letra.textoExtra, textDecorationLine: 'underline', textDecorationColor: color.wasabi }}>{enLinea(m[3], k)}</Text>);
    } else out.push(<Text key={k} style={{ fontStyle: 'italic' }}>{enLinea(m[5] ?? m[6], k)}</Text>);
    ultimo = m.index + m[0].length;
  }
  if (ultimo < texto.length) out.push(texto.slice(ultimo));
  return out;
}

const cuerpo = { fontFamily: letra.texto, fontSize: 17, lineHeight: 27, color: color.cassis } as const;

export function Markdown({ texto }: { texto: string }) {
  return (
    <View style={{ gap: 16 }}>
      {bloques(texto).map((b, i) => {
        const k = `b${i}`;
        switch (b.t) {
          case 'h':
            return b.nivel <= 2
              ? <Text key={k} accessibilityRole="header" style={{ fontFamily: letra.titular, fontSize: 22, lineHeight: 25, color: color.cassis, textTransform: 'uppercase', marginTop: 10 }}>{b.texto}</Text>
              : <Text key={k} accessibilityRole="header" style={{ fontFamily: letra.textoBlack, fontSize: 19, lineHeight: 25, color: color.cassis, marginTop: 6 }}>{enLinea(b.texto, k)}</Text>;
          case 'p':
            return <Text key={k} style={cuerpo}>{enLinea(b.texto, k)}</Text>;
          case 'ul':
          case 'ol':
            return (
              <View key={k} style={{ gap: 8 }}>
                {b.items.map((it, j) => (
                  <View key={j} style={{ flexDirection: 'row', gap: 10 }}>
                    {b.t === 'ul'
                      ? <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color.wasabi, borderWidth: 1.5, borderColor: color.cassis, marginTop: 10 }} />
                      : <Text style={{ ...cuerpo, fontFamily: letra.textoBlack, minWidth: 20 }}>{j + 1}.</Text>}
                    <Text style={[cuerpo, { flex: 1 }]}>{enLinea(it, `${k}-${j}`)}</Text>
                  </View>
                ))}
              </View>
            );
          case 'cita':
            return (
              <View key={k} style={{ borderLeftWidth: 6, borderLeftColor: color.wasabi, backgroundColor: color.beige, borderRadius: 12, padding: 14 }}>
                <Text style={{ ...cuerpo, fontFamily: letra.textoBold }}>{enLinea(b.texto, k)}</Text>
              </View>
            );
          case 'img':
            return <Image key={k} source={{ uri: b.url.startsWith('/') ? SITIO + b.url : b.url }} accessibilityLabel={b.alt} style={{ width: '100%', aspectRatio: 4 / 3, borderRadius: 16, backgroundColor: color.beige }} contentFit="cover" />;
          case 'hr':
            return <View key={k} style={{ width: 72, height: 8, backgroundColor: color.wasabi, borderRadius: 4, alignSelf: 'center' }} />;
        }
      })}
    </View>
  );
}
