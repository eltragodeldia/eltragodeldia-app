// El nombre interno del proyecto va sin tilde (con "Día" el proyecto de Xcode no encuentra su target).
// Este plugin pone el nombre visible con tilde en Android; en iPhone lo pone CFBundleDisplayName en app.json.
const { withStringsXml, AndroidConfig } = require('expo/config-plugins');

module.exports = function nombreAndroid(config, nombre) {
  return withStringsXml(config, (c) => {
    c.modResults = AndroidConfig.Strings.setStringItem(
      [{ $: { name: 'app_name', translatable: 'false' }, _: nombre }],
      c.modResults
    );
    return c;
  });
};
