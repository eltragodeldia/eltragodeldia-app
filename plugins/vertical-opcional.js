// La app va en vertical (orientation: portrait), y eso hace que Android exija la
// pantalla vertical como hardware obligatorio. Google Play la esconde entonces de
// tabletas, Chromebooks y Android XR. Con esto la vertical se pide, pero no se exige.
const { withAndroidManifest } = require('expo/config-plugins');

module.exports = function verticalOpcional(config) {
  return withAndroidManifest(config, (c) => {
    const m = c.modResults.manifest;
    m.$['xmlns:tools'] = m.$['xmlns:tools'] || 'http://schemas.android.com/tools';
    const lista = (m['uses-feature'] = m['uses-feature'] || []);
    const nombre = 'android.hardware.screen.portrait';
    const ya = lista.find((f) => f.$['android:name'] === nombre);
    if (ya) ya.$['android:required'] = 'false';
    else lista.push({ $: { 'android:name': nombre, 'android:required': 'false' } });
    return c;
  });
};
