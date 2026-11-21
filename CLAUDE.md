# CLAUDE.md · App de El Trago del Día

Reglas para cualquier sesión de Claude que trabaje en este repositorio. Las reglas de marca, de cuentas y de trabajo son las mismas del sitio (`eltragodeldia/eltragodeldia-web`, su `CLAUDE.md`).

## Qué es
App de El Trago del Día para iPhone y Android, hecha con Expo (SDK 58) y Expo Router. Vendedor en las tiendas: EL TRAGO DEL DIA, CORP. Separada de Platinum Marketing & Branding: nada de Platinum se usa, se toca ni se copia aquí.

## Idioma y estilo
- Español, sin emojis y sin guiones largos. La app habla como Yunior a una persona.
- Las recetas no nombran la marca del destilado principal.
- Colores: Cassis #351E28, Crema #FDF6EC, Beige #E8D5C4, Wasabi #E9F056, Azul #223C5B, Verde #2C4E3A (`src/lib/tema.ts`). Titulares en Archivo extendido Black (`assets/fonts/ArchivoExpandedBlack.ttf`, instancia estática de Archivo con wdth 125 y wght 900, licencia OFL) y texto en Nunito.

## Reglas de trabajo
1. Rama nueva y pull request; Yunior aprueba antes de integrar a `main`.
2. Los cambios de base de datos van en el repositorio del sitio (`db/`), primero en desarrollo y después en producción.
3. Nunca guardes claves en el repositorio. La app usa solo la clave publicable de Supabase, por variables de entorno (`EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`): en local con `.env` (ignorado por git) y en EAS como variables del proyecto. Desarrollo usa `etd-desarrollo`; las versiones de tienda, `etd-produccion`.
4. Nada se publica en las tiendas ni se manda a revisión sin que Yunior lo pida.
5. Claude nunca escribe contraseñas.
6. Antes de entregar: `npx tsc --noEmit`, prueba en la vista web de celular y capturas.

## Cómo está hecha
- Rutas en `src/app/` (Expo Router). `bienvenida.tsx` es la verificación de 21+; el resto está protegido con `Stack.Protected` hasta confirmar la edad.
- Pestañas `(tabs)`: Inicio, Recetas, Mi bar, Guardadas, Cuenta. Inicio (`(tabs)/index.tsx`) reúne lo principal: saludo, el trago de hoy, atajos (recetas, Mi bar, favoritas, lista), "Ya los puedes hacer" o invitación a Mi bar, por destilado (abre Recetas filtrada con `?d=`), recién llegadas, modo preparar, en 5 minutos o menos, artículos, mapa de bares y colecciones, todo con pantalla propia. Tocar la pestaña en la que ya estás vuelve arriba (`useScrollToTop` en cada pestaña). Guardadas abre la lista con `?pestana=lista`. Además `receta/[slug]` y `preparar/[slug]` (paso a paso con temporizador, pantalla encendida y vibración).
- Artículos y colecciones: `articulos/index.tsx` y `articulo/[slug].tsx` (el texto en Markdown se lee con `components/Markdown.tsx`, sin paquetes nativos; los enlaces a recetas, artículos y lugares del sitio abren la pantalla de la app; al final, recetas del tema con `compartido/relacionados.ts` y "Sigue leyendo"); `colecciones/index.tsx` y `coleccion/[slug].tsx` con `compartido/colecciones.ts` (mínimo 3 recetas). La colección de las más deliciosas usa los votos de `deliciosos_totales`. Cada lugar muestra los artículos que lo mencionan.
- Mapa y lugares: `lugares/index.tsx` (mapa, búsqueda, categorías, "Cerca de mí" con `expo-location` y orden por distancia) y `lugar/[slug].tsx` (qué pedir, por qué ir, ocasión, horario, dirección, cómo llegar con Apple Maps o Google Maps, video, Instagram). El mapa es `react-native-maps` (Apple Maps en iPhone, sin llave); en Android hará falta una llave de Google Maps cuando se arme Android. `components/Mapa.web.tsx` es solo para la prueba web.
- Aviso diario (`src/lib/aviso.ts`): notificaciones locales de `expo-notifications` con el trago del día (`tragoDelDia`) a las 5:00 p. m., programadas para los próximos 14 días y reprogramadas al abrir la app. Sin servidor y sin el plugin en `app.json` (los avisos locales no lo necesitan). El permiso se pide una sola vez desde una tarjeta en Inicio o al encender el interruptor en Cuenta, nunca al abrir la app. Tocar el aviso abre la receta.
- Datos: `src/lib/datos.ts` lee las recetas, los artículos y los lugares publicados de Supabase, guarda la última copia en el teléfono para usarla sin conexión y, si no hay base configurada, usa `src/lib/demo.json` (las recetas de ejemplo del sitio).
- Estado del teléfono (edad, idioma, medidas, aviso, favoritas, Mi bar, lista) en `src/lib/estado.tsx`, guardado con AsyncStorage.
- Cuentas (`src/lib/sincronizar.ts`, `components/TarjetaCuenta.tsx` en Cuenta): se entra con un código de 6 dígitos que llega al correo (`signInWithOtp` y `verifyOtp`, sin contraseña ni enlaces profundos). Al entrar, y cada vez que se abre la app con sesión, lo del teléfono se junta con lo de la cuenta (favoritas, Mi bar y lista se unen; los ajustes de la cuenta mandan) y después cada cambio sube un segundo más tarde, solo lo que cambió. Salir deja todo en el teléfono. "Borrar mi cuenta" llama a `borrar_mi_cuenta()` (Apple lo exige dentro de la app). El aviso diario y lo marcado como hecho son solo del teléfono. Requisitos en Supabase (los configura Yunior, en desarrollo y en producción): la plantilla de correo de `docs/correo-codigo.html` en "Magic Link" y "Confirm signup" (asunto "Tu código de El Trago del Día"), y SMTP propio con Resend desde hola@eltragodeldia.com.
- `src/lib/compartido/` está copiado del sitio (Mi bar, próxima botella, medidas, tipos, colecciones, relacionados; en `relacionados.ts` solo cambia el tipo del artículo). Si cambia en el sitio, se copia igual aquí para que los dos den el mismo resultado.
- Ilustraciones: las mismas del sitio, desde `https://eltragodeldia.com/ilustraciones/<slug>.svg?v=3`.

## Expo (EAS)
- Proyecto de Expo: slug `eltragodeldia`, ID `288c11fb-9c18-40cb-b791-74d2837efe0c` (en `app.json`), en la organización de Expo `eltragodeldias-team` (usuario `eltragodeldia`, contact@eltragodeldia.com).
- `eas.json`: perfiles `development` y `preview` (pruebas internas, base `etd-desarrollo`) y `production` (tiendas, base `etd-produccion`). Las variables `EXPO_PUBLIC_SUPABASE_*` de cada uno se configuran en expo.dev (Environment variables), nunca en el código.
- Las credenciales de Apple y Google las carga Yunior en expo.dev; Claude no las ve. iOS ya tiene en Expo: certificado de distribución, perfil, llave de notificaciones y llave de App Store Connect (rol App Manager).
- Envío automático (`.eas/workflows/enviar-a-testflight.yml`): cada push a `main` (o sea, cada PR integrado) calcula el fingerprint de la parte nativa. Si ya existe una versión de iPhone con ese fingerprint, publica una actualización rápida (expo-updates, canal `production`) que llega sola a la app instalada; si no existe, arma una versión nueva y la manda a TestFlight. Requiere el repositorio conectado a GitHub en expo.dev.
- Actualizaciones rápidas: `expo-updates` con `runtimeVersion` por `fingerprint` y `updates.url` del proyecto. Solo llevan JavaScript e imágenes; un paquete nativo nuevo, un permiso o un cambio de ícono o de `app.json` obliga a una versión nueva (el workflow lo detecta solo).
- `eas.json` lleva `submit.production.ios.ascAppId` (6837599358, la app en App Store Connect): sin él el envío automático no sabe a qué app subir.
- Claude tiene el conector de Expo: puede ver versiones, leer errores, correr y validar workflows, y mandar una versión ya armada a TestFlight (`build_submit`).

## Comandos
- `npx expo start` para desarrollar; `npx tsc --noEmit` para revisar tipos.
- Ya no hace falta la Terminal de Yunior: el envío lo hace el workflow. Si hiciera falta a mano, `EAS_NO_VCS=1 npx testflight` desde una copia del código.
- En esta sesión de Claude la API de Expo no responde: instalar paquetes con `EXPO_OFFLINE=1 npx expo install <paquete>`.
- Prueba en web: `EXPO_OFFLINE=1 npx expo export -p web` y servir `dist`.
