import { useState } from 'react';
import { ActivityIndicator, Alert, TextInput, View } from 'react-native';
import { useEstado } from '../lib/estado';
import { borrarCuenta, enviarCodigo, salir, verificarCodigo } from '../lib/sincronizar';
import { hayBase } from '../lib/supabase';
import { color, letra } from '../lib/tema';
import { Boton, Texto } from './ui';

const campo = { backgroundColor: color.crema, borderRadius: 14, paddingHorizontal: 14, minHeight: 50, fontFamily: letra.textoBold, fontSize: 17, color: color.cassis } as const;

/** Entrar con un código al correo, ver la cuenta, salir y borrarla. */
export function TarjetaCuenta() {
  const { t, usuario, sincro } = useEstado();
  const c = t.cuenta;
  const [correo, setCorreo] = useState('');
  const [codigo, setCodigo] = useState('');
  const [paso, setPaso] = useState<'correo' | 'codigo'>('correo');
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mensaje = (e: unknown) => {
    const m = String((e as { message?: string; status?: number })?.message ?? '').toLowerCase();
    const st = (e as { status?: number })?.status;
    if (st === 429 || m.includes('rate') || m.includes('seconds')) return c.errorEspera;
    if (m.includes('expired') || m.includes('invalid') || m.includes('token')) return c.errorCodigo;
    if (m.includes('email')) return c.errorCorreo;
    return c.errorRed;
  };
  const hacer = async (f: () => Promise<void>) => {
    setOcupado(true); setError(null);
    try { await f(); } catch (e) { setError(mensaje(e)); } finally { setOcupado(false); }
  };
  const pedir = () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim())) return setError(c.errorCorreo);
    hacer(async () => { await enviarCodigo(correo); setPaso('codigo'); setCodigo(''); });
  };
  const entrar = () => hacer(async () => { await verificarCodigo(correo, codigo); setPaso('correo'); setCodigo(''); });
  const confirmarBorrar = () => Alert.alert(c.borrarTitulo, c.borrarTexto, [
    { text: c.cancelar, style: 'cancel' },
    { text: c.borrarSi, style: 'destructive', onPress: () => hacer(async () => { await borrarCuenta(); Alert.alert(c.borrada); }) },
  ]);

  const caja = (hijos: React.ReactNode) => <View style={{ backgroundColor: color.cassis, borderRadius: 22, padding: 18, gap: 10 }}>{hijos}</View>;
  const err = error ? <Texto tam={13} peso="bold" tono={color.wasabi}>{error}</Texto> : null;

  if (!hayBase) return caja(<><Texto peso="black" tam={17} tono={color.crema}>{c.entrar}</Texto><Texto tam={14} tono={color.beige}>{c.sinBase}</Texto></>);

  if (usuario) {
    return caja(
      <>
        <Texto tam={13} peso="extra" tono={color.beige}>{c.dentro}</Texto>
        <Texto peso="black" tam={17} tono={color.crema}>{usuario.correo}</Texto>
        <Texto tam={14} tono={sincro === 'error' ? color.wasabi : color.beige}>{sincro === 'subiendo' ? c.subiendo : sincro === 'error' ? c.errorSync : c.sincronizado}</Texto>
        {err}
        <Boton variante="bordeClaro" alto={46} onPress={() => hacer(salir)}>{c.salir}</Boton>
        <Texto tam={12} tono={color.beige}>{c.salirTexto}</Texto>
        <Boton variante="bordeClaro" alto={40} onPress={confirmarBorrar}>{c.borrar}</Boton>
      </>,
    );
  }

  return caja(
    <>
      <Texto peso="black" tam={17} tono={color.crema}>{c.entrar}</Texto>
      {paso === 'correo' ? (
        <>
          <Texto tam={14} tono={color.beige}>{c.entrarTexto}</Texto>
          <TextInput value={correo} onChangeText={setCorreo} placeholder={c.correo} placeholderTextColor={color.gris} accessibilityLabel={c.correo}
            keyboardType="email-address" autoCapitalize="none" autoCorrect={false} autoComplete="email" textContentType="emailAddress" returnKeyType="send" onSubmitEditing={pedir} style={campo} />
          {err}
          {ocupado ? <ActivityIndicator color={color.wasabi} /> : <Boton variante="wasabi" onPress={pedir}>{c.mandar}</Boton>}
        </>
      ) : (
        <>
          <Texto tam={14} tono={color.beige}>{c.codigoTexto(correo.trim())}</Texto>
          <TextInput value={codigo} onChangeText={(v) => setCodigo(v.replace(/\D/g, '').slice(0, 8))} placeholder={c.codigo} placeholderTextColor={color.gris} accessibilityLabel={c.codigo}
            keyboardType="number-pad" autoComplete="one-time-code" textContentType="oneTimeCode" returnKeyType="done" onSubmitEditing={entrar} style={[campo, { letterSpacing: 6, fontSize: 22, textAlign: 'center' }]} />
          {err}
          {ocupado ? <ActivityIndicator color={color.wasabi} /> : <Boton variante="wasabi" onPress={entrar}>{c.entrarBoton}</Boton>}
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Boton variante="bordeClaro" alto={40} estilo={{ flex: 1 }} onPress={() => { setPaso('correo'); setError(null); }}>{c.otroCorreo}</Boton>
            <Boton variante="bordeClaro" alto={40} estilo={{ flex: 1 }} onPress={pedir}>{c.reenviar}</Boton>
          </View>
        </>
      )}
    </>,
  );
}
