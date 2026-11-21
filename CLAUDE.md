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
- Pestañas `(tabs)`: Hoy, Recetas, Mi bar, Guardadas, Cuenta. Además `receta/[slug]` y `preparar/[slug]` (paso a paso con temporizador, pantalla encendida y vibración).
- Datos: `src/lib/datos.ts` lee las recetas publicadas de Supabase, guarda la última copia en el teléfono para usarla sin conexión y, si no hay base configurada, usa `src/lib/demo.json` (las recetas de ejemplo del sitio).
- Estado del teléfono (edad, idioma, medidas, aviso, favoritas, Mi bar, lista) en `src/lib/estado.tsx`, guardado con AsyncStorage. Las cuentas (enlace al correo) y la sincronización con `app_*` (`db/016` del sitio) van en la siguiente versión.
- `src/lib/compartido/` está copiado del sitio (Mi bar, próxima botella, medidas, tipos). Si cambia en el sitio, se copia igual aquí para que los dos den el mismo resultado.
- Ilustraciones: las mismas del sitio, desde `https://eltragodeldia.com/ilustraciones/<slug>.svg?v=3`.

## Expo (EAS)
- Proyecto de Expo: slug `eltragodeldia`, ID `288c11fb-9c18-40cb-b791-74d2837efe0c` (en `app.json`), en la organización de Expo `eltragodeldias-team` (usuario `eltragodeldia`, contact@eltragodeldia.com).
- `eas.json`: perfiles `development` y `preview` (pruebas internas, base `etd-desarrollo`) y `production` (tiendas, base `etd-produccion`). Las variables `EXPO_PUBLIC_SUPABASE_*` de cada uno se configuran en expo.dev (Environment variables), nunca en el código.
- Las credenciales de Apple y Google las carga Yunior en expo.dev; Claude no las ve.

## Comandos
- `npx expo start` para desarrollar; `npx tsc --noEmit` para revisar tipos.
- En esta sesión de Claude la API de Expo no responde: instalar paquetes con `EXPO_OFFLINE=1 npx expo install <paquete>`.
- Prueba en web: `EXPO_OFFLINE=1 npx expo export -p web` y servir `dist`.
