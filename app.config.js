// Completa app.json con lo que no puede ir en el repositorio.
// La llave de Google Maps para Android vive en expo.dev (variable GOOGLE_MAPS_ANDROID_KEY,
// entornos production y preview) y EAS la pone al armar la versión. Nunca se escribe aquí.
module.exports = ({ config }) => {
  const llaveMapa = process.env.GOOGLE_MAPS_ANDROID_KEY;
  if (!llaveMapa && process.env.EAS_BUILD_PLATFORM === 'android') {
    throw new Error(
      'Falta GOOGLE_MAPS_ANDROID_KEY: sin ella el mapa de Android no carga. Agrégala en expo.dev, Environment variables.'
    );
  }
  return {
    ...config,
    android: {
      ...config.android,
      ...(llaveMapa ? { config: { ...config.android?.config, googleMaps: { apiKey: llaveMapa } } } : {}),
    },
  };
};
