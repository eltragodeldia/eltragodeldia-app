// Identidad de El Trago del Día (manual de marca). No usar otros colores.
export const color = {
  cassis: '#351E28',
  cassis2: '#4A2E3A',
  crema: '#FDF6EC',
  beige: '#E8D5C4',
  wasabi: '#E9F056',
  azul: '#223C5B',
  verde: '#2C4E3A',
  gris: '#5E4650',
  blanco: '#FFFFFF',
  rojo: '#8A1C1C',
};

export const letra = {
  titular: 'ArchivoExpandedBlack',
  texto: 'Nunito_400Regular',
  textoBold: 'Nunito_700Bold',
  textoExtra: 'Nunito_800ExtraBold',
  textoBlack: 'Nunito_900Black',
};

export const SITIO = 'https://eltragodeldia.com';

export const ilustracion = (slug: string) => `${SITIO}/ilustraciones/${slug}.svg?v=3`;
